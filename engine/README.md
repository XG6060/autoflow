# AutoFlow Execution Engine

The Go execution engine for AutoFlow - executes workflow DAGs with parallel node execution.

## Architecture

```
cmd/runner          Entry point: CLI that loads workflow JSON and executes it
internal/
  models/           Data types: Workflow, Node, Edge, Execution, StepResult
        /graph      DAG implementation: topological sort, level-order traversal
  executor/         Core engine: executes nodes level-by-level with concurrency
  connector/        Plugin interface: Connector registry and type system
         /builtin   Built-in connectors: webhook, http, filter, transform
```

## Build

```bash
make build
# Output: bin/runner
```

## Test

```bash
make test
```

## Usage

```bash
# Execute a workflow
./bin/runner --workflow=samples/sample-workflow.json --input=samples/input.json

# Execute without input
./bin/runner --workflow=samples/sample-workflow.json
```

## Workflow JSON Format

```json
{
  "id": "wf-example",
  "name": "Example Workflow",
  "nodes": [
    {
      "id": "node-1",
      "type": "webhook",
      "label": "Receive Order",
      "config": {},
      "position": { "x": 250, "y": 50 }
    },
    {
      "id": "node-2",
      "type": "filter",
      "label": "Check Amount",
      "config": {
        "field": "body.amount",
        "operator": "greater_than",
        "value": 100
      },
      "position": { "x": 250, "y": 200 }
    }
  ],
  "edges": [
    { "id": "e1", "source": "node-1", "target": "node-2" }
  ]
}
```

## Built-in Connectors

| Type | Description |
|------|-------------|
| `webhook` | HTTP trigger/action |
| `http_request` | HTTP API calls with template interpolation |
| `filter` | Conditional branching (equals, contains, greater_than, exists) |
| `transform` | Data transformation with Go text/template |

## Adding a New Connector

1. Implement the `Connector` interface in `internal/connector/builtin/`
2. Register it in `registry.go`
3. Add the corresponding node type in the frontend palette
