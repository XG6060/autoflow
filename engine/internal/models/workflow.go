package models

import "time"

// Workflow represents a complete workflow definition.
type Workflow struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

// Node represents a single node (step) in a workflow.
type Node struct {
	ID       string                 `json:"id"`
	Type     string                 `json:"type"`
	Label    string                 `json:"label"`
	Config   map[string]interface{} `json:"config"`
	Position Position               `json:"position"`
}

// Position represents the visual position of a node on the canvas.
type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Edge represents a connection between two nodes.
type Edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

// Execution represents a single run of a workflow.
type Execution struct {
	ID           string       `json:"id"`
	WorkflowID   string       `json:"workflowId"`
	Status       string       `json:"status"`
	StartedAt    time.Time    `json:"startedAt"`
	CompletedAt  *time.Time   `json:"completedAt,omitempty"`
	Steps        []StepResult `json:"steps"`
	ErrorMessage string       `json:"errorMessage,omitempty"`
}

// StepResult represents the result of executing a single node.
type StepResult struct {
	NodeID      string                 `json:"nodeId"`
	Status      string                 `json:"status"`
	Input       map[string]interface{} `json:"input"`
	Output      map[string]interface{} `json:"output,omitempty"`
	Error       string                 `json:"error,omitempty"`
	StartedAt   time.Time              `json:"startedAt"`
	CompletedAt *time.Time             `json:"completedAt,omitempty"`
	DurationMs  *int64                 `json:"durationMs,omitempty"`
}

// Status constants for execution and step status.
const (
	StatusRunning  = "running"
	StatusSuccess  = "success"
	StatusFailed   = "failed"
	StatusSkipped  = "skipped"
	StatusPending  = "pending"
)

// NewExecution creates a new execution with the given ID and workflow ID.
func NewExecution(id, workflowID string) *Execution {
	now := time.Now()
	return &Execution{
		ID:         id,
		WorkflowID: workflowID,
		Status:     StatusRunning,
		StartedAt:  now,
		Steps:      make([]StepResult, 0),
	}
}

// NewStepResult creates a step result for the given node.
func NewStepResult(nodeID string) StepResult {
	return StepResult{
		NodeID:    nodeID,
		Status:    StatusPending,
		Input:     make(map[string]interface{}),
		StartedAt: time.Now(),
	}
}
