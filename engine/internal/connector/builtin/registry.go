package builtin

import (
	"github.com/autoflow/engine/internal/connector"
)

// InitializeRegistry creates a registry with all built-in connectors registered.
func InitializeRegistry() *connector.Registry {
	r := connector.NewRegistry()

	triggers := []connector.Info{
		{Type: "webhook", Label: "Webhook", Description: "Receive data via HTTP request or make outbound HTTP calls", Category: "triggers"},
		{Type: "schedule", Label: "Schedule", Description: "Run on a time interval", Category: "triggers"},
		{Type: "email_trigger", Label: "Email Trigger", Description: "Trigger on incoming email", Category: "triggers"},
	}

	actions := []connector.Info{
		{Type: "http_request", Label: "HTTP Request", Description: "Make an HTTP API call with template interpolation", Category: "actions"},
		{Type: "send_email", Label: "Send Email", Description: "Send an email via SMTP", Category: "actions"},
		{Type: "slack_message", Label: "Slack Message", Description: "Post to a Slack channel", Category: "actions"},
		{Type: "google_sheets", Label: "Google Sheets", Description: "Read/write spreadsheet data", Category: "actions"},
	}

	logic := []connector.Info{
		{Type: "filter", Label: "Filter", Description: "Branch based on conditions", Category: "logic"},
		{Type: "transform", Label: "Transform", Description: "Apply template transformations to data", Category: "logic"},
		{Type: "delay", Label: "Delay", Description: "Wait for a duration", Category: "logic"},
		{Type: "router", Label: "Router", Description: "Route to different paths", Category: "logic"},
		{Type: "code", Label: "Code", Description: "Run custom JavaScript", Category: "logic"},
	}

	apps := []connector.Info{
		{Type: "stripe", Label: "Stripe", Description: "Payment and subscription events", Category: "apps"},
		{Type: "shopify", Label: "Shopify", Description: "E-commerce automation", Category: "apps"},
		{Type: "hubspot", Label: "HubSpot", Description: "CRM data and events", Category: "apps"},
		{Type: "notion", Label: "Notion", Description: "Database and pages", Category: "apps"},
		{Type: "airtable", Label: "Airtable", Description: "Base records", Category: "apps"},
	}

	all := append(triggers, append(actions, append(logic, apps...)...)...)

	for _, info := range all {
		t := info.Type
		switch t {
		case "webhook":
			r.Register(info, func(config map[string]interface{}) connector.Connector {
				return NewWebhookConnector(config)
			})
		case "http_request":
			r.Register(info, func(config map[string]interface{}) connector.Connector {
				return NewHTTPConnector(config)
			})
		case "filter":
			r.Register(info, func(config map[string]interface{}) connector.Connector {
				return NewFilterConnector(config)
			})
		case "transform", "code":
			r.Register(info, func(config map[string]interface{}) connector.Connector {
				return NewTransformConnector(config)
			})
		default:
			// Generic passthrough for all other node types
			r.Register(info, func(config map[string]interface{}) connector.Connector {
				return NewGenericConnector(t, config)
			})
		}
	}

	return r
}
