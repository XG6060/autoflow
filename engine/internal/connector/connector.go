package connector

import (
	"context"
	"fmt"
)

// Connector executes a single node in a workflow.
type Connector interface {
	Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error)
}

// Info describes a connector type for the UI and documentation.
type Info struct {
	Type        string `json:"type"`
	Label       string `json:"label"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

// Factory creates a Connector from its configuration.
type Factory func(config map[string]interface{}) Connector

// Registry holds all registered connector types.
type Registry struct {
	factories map[string]Factory
	infos     map[string]Info
}

// NewRegistry creates an empty connector registry.
func NewRegistry() *Registry {
	return &Registry{
		factories: make(map[string]Factory),
		infos:     make(map[string]Info),
	}
}

// Register adds a connector type to the registry.
func (r *Registry) Register(info Info, factory Factory) {
	r.factories[info.Type] = factory
	r.infos[info.Type] = info
}

// Get returns a connector instance for the given type.
func (r *Registry) Get(connectorType string) (Connector, error) {
	factory, ok := r.factories[connectorType]
	if !ok {
		return nil, fmt.Errorf("unknown connector type: %s (available: %v)", connectorType, r.ListTypes())
	}
	return factory(nil), nil
}

// ListTypes returns all registered connector type names.
func (r *Registry) ListTypes() []string {
	types := make([]string, 0, len(r.factories))
	for t := range r.factories {
		types = append(types, t)
	}
	return types
}

// ListInfo returns all registered connector infos for discovery.
func (r *Registry) ListInfo() []Info {
	infos := make([]Info, 0, len(r.infos))
	for _, info := range r.infos {
		infos = append(infos, info)
	}
	return infos
}
