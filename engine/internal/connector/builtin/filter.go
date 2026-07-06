package builtin

import (
	"context"
	"fmt"
	"reflect"
	"strings"

	"github.com/autoflow/engine/internal/connector"
)

// FilterConnector evaluates conditions and either passes or blocks data flow.
type FilterConnector struct{}

// NewFilterConnector creates a new filter connector.
func NewFilterConnector(_ map[string]interface{}) connector.Connector {
	return &FilterConnector{}
}

// Execute evaluates the filter condition and returns the result.
func (f *FilterConnector) Execute(ctx context.Context, config map[string]interface{}, input map[string]interface{}) (map[string]interface{}, error) {
	field, _ := config["field"].(string)
	operator, _ := config["operator"].(string)
	expectedValue := config["value"]

	if field == "" {
		return nil, fmt.Errorf("field is required for filter connector")
	}

	// Get the actual value from input using dot notation
	actualValue := getNestedValue(input, strings.Split(field, "."))

	operator = strings.ToLower(operator)
	if operator == "" {
		operator = "equals"
	}

	passed := evaluateCondition(actualValue, operator, expectedValue)

	result := make(map[string]interface{})
	for k, v := range input {
		result[k] = v
	}
	result["passed"] = passed

	return result, nil
}

// getNestedValue traverses a nested map by path segments.
func getNestedValue(data map[string]interface{}, path []string) interface{} {
	if len(path) == 0 {
		return data
	}

	val, ok := data[path[0]]
	if !ok {
		return nil
	}

	if len(path) == 1 {
		return val
	}

	if nested, ok := val.(map[string]interface{}); ok {
		return getNestedValue(nested, path[1:])
	}

	return nil
}

// evaluateCondition evaluates a comparison between an actual value and expected value.
func evaluateCondition(actual interface{}, operator string, expected interface{}) bool {
	switch operator {
	case "equals":
		return compareEqual(actual, expected)
	case "not_equals", "notequals":
		return !compareEqual(actual, expected)
	case "contains":
		return compareContains(actual, expected)
	case "greater_than", "greaterthan":
		return compareGreater(actual, expected)
	case "less_than", "lessthan":
		return compareLess(actual, expected)
	case "exists":
		return actual != nil
	default:
		return false
	}
}

func compareEqual(a, b interface{}) bool {
	if a == nil || b == nil {
		return a == b
	}
	av := reflect.ValueOf(a)
	bv := reflect.ValueOf(b)

	if av.Kind() == reflect.Float64 && bv.Kind() == reflect.Float64 {
		return av.Float() == bv.Float()
	}

	return fmt.Sprintf("%v", a) == fmt.Sprintf("%v", b)
}

func compareContains(a, b interface{}) bool {
	if a == nil {
		return false
	}

	aStr := fmt.Sprintf("%v", a)
	bStr := fmt.Sprintf("%v", b)
	return strings.Contains(strings.ToLower(aStr), strings.ToLower(bStr))
}

func compareGreater(a, b interface{}) bool {
	aVal := toFloat64(a)
	bVal := toFloat64(b)
	return aVal > bVal
}

func compareLess(a, b interface{}) bool {
	aVal := toFloat64(a)
	bVal := toFloat64(b)
	return aVal < bVal
}

func toFloat64(val interface{}) float64 {
	v := reflect.ValueOf(val)
	switch v.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return float64(v.Int())
	case reflect.Float32, reflect.Float64:
		return v.Float()
	default:
		return 0
	}
}
