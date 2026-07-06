package models

import (
	"fmt"
)

// Graph represents a Directed Acyclic Graph (DAG) built from workflow nodes and edges.
type Graph struct {
	nodes    map[string]Node
	edges    []Edge
	adjIn    map[string][]string // incoming edges: target -> sources
	adjOut   map[string][]string // outgoing edges: source -> targets
}

// NewGraph creates a new Graph from nodes and edges.
func NewGraph(nodes []Node, edges []Edge) *Graph {
	g := &Graph{
		nodes:  make(map[string]Node),
		edges:  edges,
		adjIn:  make(map[string][]string),
		adjOut: make(map[string][]string),
	}

	for _, n := range nodes {
		g.nodes[n.ID] = n
		g.adjIn[n.ID] = make([]string, 0)
		g.adjOut[n.ID] = make([]string, 0)
	}

	for _, e := range edges {
		g.adjOut[e.Source] = append(g.adjOut[e.Source], e.Target)
		g.adjIn[e.Target] = append(g.adjIn[e.Target], e.Source)
	}

	return g
}

// Validate checks that all edges reference valid nodes and that the graph has no cycles.
func (g *Graph) Validate() error {
	// Check all edge endpoints exist
	for _, e := range g.edges {
		if _, ok := g.nodes[e.Source]; !ok {
			return fmt.Errorf("edge %s references unknown source node %s", e.ID, e.Source)
		}
		if _, ok := g.nodes[e.Target]; !ok {
			return fmt.Errorf("edge %s references unknown target node %s", e.ID, e.Target)
		}
	}

	// Check for cycles using topological sort
	_, err := g.TopologicalSort()
	return err
}

// TopologicalSort returns nodes in execution order. Returns an error if a cycle is detected.
func (g *Graph) TopologicalSort() ([]Node, error) {
	inDegree := make(map[string]int)
	for id := range g.nodes {
		inDegree[id] = len(g.adjIn[id])
	}

	// Start with nodes that have no incoming edges (source/trigger nodes)
	queue := make([]string, 0)
	for id, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, id)
		}
	}

	sorted := make([]Node, 0, len(g.nodes))

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		sorted = append(sorted, g.nodes[current])

		for _, neighbor := range g.adjOut[current] {
			inDegree[neighbor]--
			if inDegree[neighbor] == 0 {
				queue = append(queue, neighbor)
			}
		}
	}

	if len(sorted) != len(g.nodes) {
		return nil, fmt.Errorf("cycle detected in workflow graph")
	}

	return sorted, nil
}

// LevelOrder returns nodes grouped by parallel execution levels.
// Nodes at the same level have no mutual dependencies and can run concurrently.
func (g *Graph) LevelOrder() ([][]Node, error) {
	if err := g.Validate(); err != nil {
		return nil, err
	}

	levels := make([][]Node, 0)
	remaining := make(map[string]bool)
	for id := range g.nodes {
		remaining[id] = true
	}

	for len(remaining) > 0 {
		level := make([]Node, 0)

		for id := range remaining {
			// Check if all dependencies are already processed
			depsSatisfied := true
			for _, dep := range g.adjIn[id] {
				if remaining[dep] {
					depsSatisfied = false
					break
				}
			}

			if depsSatisfied {
				level = append(level, g.nodes[id])
			}
		}

		if len(level) == 0 {
			return nil, fmt.Errorf("unreachable nodes detected (possible cycle)")
		}

		levels = append(levels, level)

		for _, n := range level {
			delete(remaining, n.ID)
		}
	}

	return levels, nil
}

// GetNode returns a node by its ID.
func (g *Graph) GetNode(id string) (Node, bool) {
	n, ok := g.nodes[id]
	return n, ok
}

// GetDependencies returns all upstream nodes for a given node.
func (g *Graph) GetDependencies(nodeID string) []string {
	return g.adjIn[nodeID]
}

// GetDependents returns all downstream nodes for a given node.
func (g *Graph) GetDependents(nodeID string) []string {
	return g.adjOut[nodeID]
}

// NodeCount returns the number of nodes in the graph.
func (g *Graph) NodeCount() int {
	return len(g.nodes)
}
