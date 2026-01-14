# Bubble Tea TUI Selector

This directory contains a Go-based Terminal User Interface (TUI) for selecting 3Lens examples, built with [Bubble Tea](https://github.com/charmbracelet/bubbletea).

## Building

The TUI binary is automatically built when you run `pnpm example` if it doesn't exist. To build it manually:

```bash
cd scripts
go mod tidy
go build -o tui-selector tui-selector.go
```

On Windows, the binary will be named `tui-selector.exe`.

## Requirements

- Go 1.21 or later
- The Bubble Tea and Lip Gloss packages (automatically downloaded via `go mod tidy`)

## How It Works

1. The Node.js script (`run-example.mjs`) finds all available examples
2. It serializes them to JSON and passes them to the Go binary via stdin
3. The Go TUI displays an interactive menu using Bubble Tea
4. User selects examples using arrow keys and spacebar
5. Selected indices are output to stdout (one per line)
6. The Node.js script parses the output and runs the selected examples

## Features

- Beautiful, colorful terminal UI using Lip Gloss styling
- Multi-select with checkboxes
- Keyboard navigation (arrow keys or vim-style j/k)
- Category grouping and descriptions
- Selection counter
- Smooth, responsive interface

## Controls

- `↑/↓` or `j/k`: Navigate up/down
- `Space`: Toggle selection
- `Enter`: Confirm and submit selections
- `Ctrl+C` or `q`: Quit without selecting
- `Ctrl+D`: Select all
- `Ctrl+A`: Clear all selections
