package builtin

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/autoflow/engine/internal/connector"
)

// WebhookConnector simulates a webhook trigger or action.
// In a trigger position, it returns predefined response data.
// In an action position, it makes an HTTP request.
type WebhookConnector struct {
	method  string
	url     string
	headers map[string]string
}

// NewWebhookConnector creates a new webhook connector from config.
func NewWebhookConnector(config map[string]interface{}) connector.Connector {
	wc := &WebhookConnector{
		method:  "POST",
		headers: make(map[string]string),
	}

	if m, ok := config["method"].(string); ok && m != "" {
		wc.method = strings.ToUpper(m)
	}
	if u, ok := config["url"].(string); ok {
		wc.url = u
	}
	if h, ok := config["headers"].(map[string]interface{}); ok {
		for k, v := range h {
			if vs, ok := v.(string); ok {
				wc.headers[k] = vs
			}
		}
	}

	return wc
}

// Execute makes an HTTP request or returns trigger data.
func (w *WebhookConnector) Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error) {
	url := w.url
	if u, ok := config["url"].(string); ok && u != "" {
		url = u
	}

	// If no URL, this is being used as a trigger - return the input as if "received"
	if url == "" {
		return map[string]interface{}{
			"received": true,
			"body":     input,
		}, nil
	}

	method := w.method
	if m, ok := config["method"].(string); ok && m != "" {
		method = strings.ToUpper(m)
	}

	var body io.Reader
	if method == "POST" || method == "PUT" || method == "PATCH" {
		bodyJSON, err := json.Marshal(input)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		body = strings.NewReader(string(bodyJSON))
	}

	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	for k, v := range w.headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("webhook request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var respData map[string]interface{}
	if err := json.Unmarshal(respBody, &respData); err != nil {
		respData = map[string]interface{}{}
	}

	return map[string]interface{}{
		"statusCode": resp.StatusCode,
		"body":       respData,
	}, nil
}
