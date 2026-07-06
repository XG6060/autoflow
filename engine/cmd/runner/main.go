package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/autoflow/engine/internal/connector/builtin"
	"github.com/autoflow/engine/internal/executor"
	"github.com/autoflow/engine/internal/models"
	"go.uber.org/zap"
)

func main() {
	workflowPath := flag.String("workflow", "", "Path to workflow JSON file")
	inputPath := flag.String("input", "", "Path to input JSON file (optional)")
	flag.Parse()

	if *workflowPath == "" {
		fmt.Fprintf(os.Stderr, "Usage: runner --workflow=<path> [--input=<path>]\n")
		os.Exit(1)
	}

	logger, err := zap.NewDevelopment()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	// Load workflow
	workflowData, err := os.ReadFile(*workflowPath)
	if err != nil {
		logger.Fatal("Failed to read workflow file", zap.Error(err))
	}

	var workflow models.Workflow
	if err := json.Unmarshal(workflowData, &workflow); err != nil {
		logger.Fatal("Failed to parse workflow JSON", zap.Error(err))
	}

	// Load input
	input := make(map[string]interface{})
	if *inputPath != "" {
		inputData, err := os.ReadFile(*inputPath)
		if err != nil {
			logger.Fatal("Failed to read input file", zap.Error(err))
		}
		if err := json.Unmarshal(inputData, &input); err != nil {
			logger.Fatal("Failed to parse input JSON", zap.Error(err))
		}
	}

	// Initialize registry with built-in connectors
	registry := builtin.InitializeRegistry()

	// Create executor and run
	exec := executor.New(registry, executor.DefaultConfig(), logger)
	execution, err := exec.Execute(&workflow, input)
	if err != nil {
		logger.Fatal("Execution failed", zap.Error(err))
	}

	// Output result as JSON
	result, err := json.MarshalIndent(execution, "", "  ")
	if err != nil {
		logger.Fatal("Failed to marshal result", zap.Error(err))
	}

	fmt.Println(string(result))
}
