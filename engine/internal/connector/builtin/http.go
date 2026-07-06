package builtin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"text/template"
	"time"

	"github.com/autoflow/engine/internal/connector"
)

// HTTPConnector makes HTTP requests with template interpolation.
type HTTPConnector struct{}

// NewHTTPConnector creates a new HTTP connector.
func NewHTTPConnector(_ map[string]interface{}) connector.Connector {
	return &HTTPConnector{}
}

// Execute makes an HTTP request using the config and input.
func (h *HTTPConnector) Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error) {
	method := "GET"
	if m, ok := config["method"].(string); ok && m != "" {
		method = strings.ToUpper(m)
	}

	url := ""
	if u, ok := config["url"].(string); ok {
		url = u
	}
	if url == "" {
		return map[string]interface{}{
		"statusCode": 200,
		"body": input,
		"note": "No URL configured. Set config.url to make a real HTTP call.",
	}, nil
	}

	// Interpolate URL template with input data
	url, err := interpolateString(url, input)
	if err != nil {
		return nil, fmt.Errorf("URL template interpolation failed: %w", err)
	}

	var reqBody io.Reader
	if method == "POST" || method == "PUT" || method == "PATCH" {
		bodyStr := ""
		if b, ok := config["body"].(string); ok {
			bodyStr = b
		}

		if bodyStr != "" {
			bodyStr, err = interpolateString(bodyStr, input)
			if err != nil {
				return nil, fmt.Errorf("body template interpolation failed: %w", err)
			}
		} else {
			// Default: send input as JSON body
			bodyJSON, _ := json.Marshal(input)
			bodyStr = string(bodyJSON)
		}

		reqBody = bytes.NewReader([]byte(bodyStr))
	}

	req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/json")
	if headers, ok := config["headers"].(map[string]interface{}); ok {
		for k, v := range headers {
			if vs, ok := v.(string); ok {
				interpolated, ierr := interpolateString(vs, input)
				if ierr == nil {
					req.Header.Set(k, interpolated)
				} else {
					req.Header.Set(k, vs)
				}
			}
		}
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var respData interface{}
	if err := json.Unmarshal(respBody, &respData); err != nil {
		respData = string(respBody)
	}

	result := map[string]interface{}{
		"statusCode": resp.StatusCode,
		"body":       respData,
		"headers":    resp.Header,
	}

	return result, nil
}

// interpolateString replaces {{.field}} placeholders with values from data.
func interpolateString(tmpl string, data map[string]interface{}) (string, error) {
	t, err := template.New("tmpl").Option("missingkey=zero").Parse(tmpl)
	if err != nil {
		return tmpl, err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return tmpl, err
	}

	return buf.String(), nil
}
