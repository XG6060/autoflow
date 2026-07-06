.PHONY: build test run clean

build:
	go build -o bin/runner ./cmd/runner

test:
	go test ./... -v -count=1

test-race:
	go test ./... -v -race -count=1

run:
	go run ./cmd/runner

clean:
	rm -rf bin/

fmt:
	go fmt ./...

vet:
	go vet ./...

check: fmt vet test
