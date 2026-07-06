package builtin

import (
	"context"
	"math/rand"
	"time"

	"github.com/autoflow/engine/internal/connector"
)

// GenericConnector provides a simulated response for any node type.
type GenericConnector struct {
	nodeType string
	config   map[string]interface{}
}

// NewGenericConnector creates a generic connector for simulated execution.
func NewGenericConnector(nodeType string, config map[string]interface{}) connector.Connector {
	return &GenericConnector{nodeType: nodeType, config: config}
}

// Execute simulates the action and returns a typed result.
func (g *GenericConnector) Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error) {
	// Merge stored config with runtime config
	cfg := make(map[string]interface{})
	for k, v := range g.config {
		cfg[k] = v
	}
	for k, v := range config {
		cfg[k] = v
	}

	result := map[string]interface{}{
		"executed":  true,
		"nodeType": g.nodeType,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	switch g.nodeType {
	case "schedule":
		result["triggered"] = true
		result["scheduledAt"] = time.Now().UTC().Format(time.RFC3339)

	case "email_trigger":
		result["received"] = true
		result["from"] = "trigger@autoflow.dev"
		result["subject"] = "Workflow triggered"

	case "send_email":
		result["sent"] = true
		result["to"] = getString(cfg, "to", "user@example.com")
		result["subject"] = getString(cfg, "subject", "AutoFlow notification")

	case "slack_message":
		result["sent"] = true
		result["channel"] = getString(cfg, "channel", "#general")
		result["text"] = "Workflow step executed"

	case "google_sheets":
		result["updated"] = true
		result["rowCount"] = rand.Intn(100) + 1
		result["spreadsheetId"] = getString(cfg, "spreadsheetId", "autoflow-demo")

	case "stripe":
		result["event"] = getString(cfg, "event", "payment.succeeded")
		result["amount"] = getFloat(cfg, "amount", 2999)
		result["currency"] = getString(cfg, "currency", "usd")

	case "shopify":
		result["orderId"] = "ORD-" + randomSuffix()
		result["status"] = "created"

	case "hubspot":
		result["contactId"] = "C-" + randomSuffix()
		result["updated"] = true

	case "notion":
		result["pageId"] = "P-" + randomSuffix()
		result["database"] = getString(cfg, "database", "autoflow-db")

	case "airtable":
		result["recordId"] = "rec-" + randomSuffix()
		result["created"] = true

	case "delay":
		seconds := getInt(cfg, "seconds", 1)
		select {
		case <-time.After(time.Duration(seconds) * time.Millisecond):
			result["waited"] = true
			result["duration"] = seconds
		case <-ctx.Done():
			return nil, ctx.Err()
		}

	case "router":
		result["route"] = getString(cfg, "defaultRoute", "default")
		result["branches"] = []string{"a", "b"}
	}

	// Pass through input data
	for k, v := range input {
		if _, exists := result[k]; !exists {
			result[k] = v
		}
	}

	return result, nil
}

func getString(m map[string]interface{}, key, fallback string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return fallback
}

func getFloat(m map[string]interface{}, key string, fallback float64) float64 {
	if v, ok := m[key]; ok {
		switch n := v.(type) {
		case float64:
			return n
		case int:
			return float64(n)
		case int64:
			return float64(n)
		}
	}
	return fallback
}

func getInt(m map[string]interface{}, key string, fallback int) int {
	if v, ok := m[key]; ok {
		switch n := v.(type) {
		case int:
			return n
		case float64:
			return int(n)
		}
	}
	return fallback
}

func randomSuffix() string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
