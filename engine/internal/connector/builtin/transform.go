package builtin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"text/template"

	"github.com/autoflow/engine/internal/connector"
)

// TransformConnector applies template transformations to data.
// For MVP, uses Go text/template for JSON transformations.
type TransformConnector struct{}

// NewTransformConnector creates a new transform connector.
func NewTransformConnector(_ map[string]interface{}) connector.Connector {
	return &TransformConnector{}
}

// Execute applies a transformation template to the input data.
func (t *TransformConnector) Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error) {
	code, ok := config["code"].(string)
	if !ok || code == "" {
		// No transformation code - pass through
		output := make(map[string]interface{})
		for k, v := range input {
			output[k] = v
		}
		return output, nil
	}

	// Use Go text/template with the code as the template and input as data
	tmpl, err := template.New("transform").Option("missingkey=zero").Parse(code)
	if err != nil {
		return nil, fmt.Errorf("transform template parse error: %w", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, input); err != nil {
		return nil, fmt.Errorf("transform template execution error: %w", err)
	}

	// Parse result as JSON
	var output map[string]interface{}
	if err := json.Unmarshal(buf.Bytes(), &output); err != nil {
		// If not valid JSON, return as raw string
		return map[string]interface{}{
			"result": buf.String(),
		}, nil
	}

	return output, nil
}
