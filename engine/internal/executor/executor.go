package executor

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/autoflow/engine/internal/connector"
	"github.com/autoflow/engine/internal/models"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

const (
	defaultMaxRetries  = 3
	defaultTimeout     = 30 * time.Second
	defaultConcurrency = 5
)

// Config holds executor configuration.
type Config struct {
	MaxRetries  int
	Timeout     time.Duration
	Concurrency int
}

// DefaultConfig returns the default executor configuration.
func DefaultConfig() Config {
	return Config{
		MaxRetries:  defaultMaxRetries,
		Timeout:     defaultTimeout,
		Concurrency: defaultConcurrency,
	}
}

// Executor executes workflow DAGs.
type Executor struct {
	registry *connector.Registry
	config   Config
	logger   *zap.Logger
}

// New creates a new Executor.
func New(registry *connector.Registry, config Config, logger *zap.Logger) *Executor {
	return &Executor{
		registry: registry,
		config:   config,
		logger:   logger,
	}
}

// Execute runs a workflow and returns the execution result.
func (e *Executor) Execute(workflow *models.Workflow, input map[string]interface{}) (*models.Execution, error) {
	execution := models.NewExecution(uuid.New().String(), workflow.ID)

	// Build and validate the graph
	graph := models.NewGraph(workflow.Nodes, workflow.Edges)
	if err := graph.Validate(); err != nil {
		execution.Status = models.StatusFailed
		execution.ErrorMessage = err.Error()
		now := time.Now()
		execution.CompletedAt = &now
		return execution, err
	}

	// Get execution levels (parallelizable groups)
	levels, err := graph.LevelOrder()
	if err != nil {
		execution.Status = models.StatusFailed
		execution.ErrorMessage = err.Error()
		now := time.Now()
		execution.CompletedAt = &now
		return execution, err
	}

	e.logger.Info("Starting workflow execution",
		zap.String("workflowId", workflow.ID),
		zap.String("executionId", execution.ID),
		zap.Int("nodeCount", graph.NodeCount()),
		zap.Int("levels", len(levels)),
	)

	// Store outputs from each node
	nodeOutputs := make(map[string]map[string]interface{})
	failedNodes := make(map[string]bool)

	// Execute level by level
	for levelIdx, level := range levels {
		e.logger.Info("Executing level",
			zap.Int("level", levelIdx),
			zap.Int("nodeCount", len(level)),
		)

		wg := sync.WaitGroup{}
		resultsCh := make(chan *models.StepResult, len(level))
		mu := sync.Mutex{}

		for _, node := range level {
			wg.Add(1)
			go func(n models.Node) {
				defer wg.Done()

				// Skip if any dependency failed
				if e.hasFailedDependency(n.ID, graph, failedNodes) {
					step := models.NewStepResult(n.ID)
					step.Status = models.StatusSkipped
					now := time.Now()
					step.CompletedAt = &now
					duration := int64(0)
					step.DurationMs = &duration
					mu.Lock()
					execution.Steps = append(execution.Steps, step)
					mu.Unlock()
					resultsCh <- nil
					return
				}

				// Collect inputs from upstream nodes
				nodeInput := e.collectInputs(n.ID, graph, nodeOutputs, input)

				// Execute the node
				step := e.executeNode(n, nodeInput)
				mu.Lock()
				execution.Steps = append(execution.Steps, step)
				if step.Status == models.StatusSuccess {
					nodeOutputs[n.ID] = step.Output
				} else if step.Status == models.StatusFailed {
					failedNodes[n.ID] = true
				}
				mu.Unlock()

				resultsCh <- &step
			}(node)
		}

		wg.Wait()
		close(resultsCh)

		// Collect results for logging
		for result := range resultsCh {
			if result != nil {
				e.logger.Info("Node executed",
					zap.String("nodeId", result.NodeID),
					zap.String("status", result.Status),
				)
			}
		}
	}

	// Determine overall status
	execution.Status = models.StatusSuccess
	for _, step := range execution.Steps {
		if step.Status == models.StatusFailed {
			execution.Status = models.StatusFailed
			execution.ErrorMessage = fmt.Sprintf("Node %s failed", step.NodeID)
			break
		}
	}

	now := time.Now()
	execution.CompletedAt = &now

	e.logger.Info("Workflow execution completed",
		zap.String("executionId", execution.ID),
		zap.String("status", execution.Status),
	)

	return execution, nil
}

// executeNode runs a single node with retries and timeout.
func (e *Executor) executeNode(node models.Node, input map[string]interface{}) models.StepResult {
	step := models.NewStepResult(node.ID)
	step.Input = input

	conn, err := e.registry.Get(node.Type)
	if err != nil {
		step.Status = models.StatusFailed
		step.Error = fmt.Sprintf("unknown node type: %s", node.Type)
		now := time.Now()
		step.CompletedAt = &now
		duration := now.Sub(step.StartedAt).Milliseconds()
		step.DurationMs = &duration
		return step
	}

	var lastErr error
	for attempt := 0; attempt <= e.config.MaxRetries; attempt++ {
		if attempt > 0 {
			e.logger.Info("Retrying node",
				zap.String("nodeId", node.ID),
				zap.Int("attempt", attempt),
			)
		}

		ctx, cancel := context.WithTimeout(context.Background(), e.config.Timeout)
		defer cancel()

		outputCh := make(chan struct {
			output map[string]interface{}
			err    error
		}, 1)

		go func() {
			out, exErr := conn.Execute(ctx, node.Config, input)
			outputCh <- struct {
				output map[string]interface{}
				err    error
			}{out, exErr}
		}()

		select {
		case result := <-outputCh:
			if result.err == nil {
				step.Status = models.StatusSuccess
				step.Output = result.output
				now := time.Now()
				step.CompletedAt = &now
				duration := now.Sub(step.StartedAt).Milliseconds()
				step.DurationMs = &duration
				return step
			}
			lastErr = result.err
		case <-ctx.Done():
			lastErr = fmt.Errorf("node execution timed out after %v", e.config.Timeout)
		}
	}

	step.Status = models.StatusFailed
	step.Error = lastErr.Error()
	now := time.Now()
	step.CompletedAt = &now
	duration := now.Sub(step.StartedAt).Milliseconds()
	step.DurationMs = &duration

	return step
}

// hasFailedDependency checks if any upstream node of the given node has failed.
func (e *Executor) hasFailedDependency(nodeID string, graph *models.Graph, failedNodes map[string]bool) bool {
	for _, dep := range graph.GetDependencies(nodeID) {
		if failedNodes[dep] {
			return true
		}
	}
	return false
}

// collectInputs gathers outputs from all upstream nodes as input for the current node.
func (e *Executor) collectInputs(
	nodeID string,
	graph *models.Graph,
	nodeOutputs map[string]map[string]interface{},
	rootInput map[string]interface{},
) map[string]interface{} {
	input := make(map[string]interface{})

	deps := graph.GetDependencies(nodeID)
	if len(deps) == 0 {
		// This is a trigger node: pass root input
		for k, v := range rootInput {
			input[k] = v
		}
		return input
	}

	// Collect outputs from all upstream nodes
	for _, dep := range deps {
		if output, ok := nodeOutputs[dep]; ok {
			for k, v := range output {
				input[k] = v
			}
		}
	}

	return input
}
