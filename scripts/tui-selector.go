package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#7D56F4")).
			Bold(true).
			MarginBottom(1)

	cursorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#7D56F4")).
			Bold(true)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#7D56F4")).
			Bold(true)

	categoryStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FFA500")).
			Bold(false)

	itemStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#00FF00"))

	descriptionStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#888888")).
				Italic(true)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666")).
			MarginTop(1)
)

type Example struct {
	Index       int    `json:"index"`
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	Category    string `json:"category"`
	CategoryName string `json:"categoryName"`
	Description string `json:"description"`
	Path        string `json:"path"`
}

type model struct {
	examples   []Example
	cursor     int
	selected   map[int]struct{}
	quitting   bool
}

func initialModel(examples []Example) model {
	return model{
		examples: examples,
		selected: make(map[int]struct{}),
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			m.quitting = true
			return m, tea.Quit

		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}

		case "down", "j":
			if m.cursor < len(m.examples)-1 {
				m.cursor++
			}

		case " ":
			// Toggle selection
			if _, ok := m.selected[m.cursor]; ok {
				delete(m.selected, m.cursor)
			} else {
				m.selected[m.cursor] = struct{}{}
			}

		case "enter":
			// Submit if at least one selected
			if len(m.selected) > 0 {
				// Write selected indices (1-based) to result file
				resultFile := os.Getenv("RESULT_FILE")
				if resultFile != "" {
					var indices []int
					for idx := range m.selected {
						indices = append(indices, m.examples[idx].Index)
					}
					// Write to file
					if f, err := os.Create(resultFile); err == nil {
						for _, idx := range indices {
							fmt.Fprintf(f, "%d\n", idx)
						}
						f.Close()
					}
				}
				return m, tea.Quit
			}

		case "ctrl+d":
			// Select all
			for i := range m.examples {
				m.selected[i] = struct{}{}
			}

		case "ctrl+a":
			// Clear all selections
			m.selected = make(map[int]struct{})
		}
	}

	return m, nil
}

func (m model) View() string {
	if m.quitting {
		return ""
	}

	var s strings.Builder
	s.Grow(len(m.examples) * 80) // Pre-allocate capacity for better performance

	// Title
	s.WriteString(titleStyle.Render("📦 Select 3Lens Examples"))
	s.WriteString("\n\n")

	// Display examples - optimize by pre-computing styles
	for i, ex := range m.examples {
		// Cursor
		if m.cursor == i {
			s.WriteString(cursorStyle.Render(">"))
		} else {
			s.WriteString(" ")
		}

		// Checkbox
		if _, ok := m.selected[i]; ok {
			s.WriteString(" [")
			s.WriteString(selectedStyle.Render("✓"))
			s.WriteString("]")
		} else {
			s.WriteString(" [ ]")
		}

		// Index and category
		s.WriteString(fmt.Sprintf(" %2d. ", ex.Index))
		s.WriteString(categoryStyle.Render(fmt.Sprintf("[%s]", ex.CategoryName)))
		s.WriteString(" ")
		
		// Name
		s.WriteString(itemStyle.Render(ex.ShortName))
		
		// Description (if present)
		if ex.Description != "" {
			s.WriteString(" ")
			s.WriteString(descriptionStyle.Render(fmt.Sprintf("- %s", truncate(ex.Description, 50))))
		}
		
		s.WriteString("\n")
	}

	// Footer with help
	s.WriteString("\n")
	s.WriteString(helpStyle.Render("↑↓/jk: navigate • Space: toggle • Enter: confirm • Ctrl+C/q: quit"))

	// Show selection count
	if len(m.selected) > 0 {
		s.WriteString("\n")
		s.WriteString(helpStyle.Render(fmt.Sprintf("Selected: %d example(s)", len(m.selected))))
	}

	return s.String()
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

func main() {
	// Read JSON from file (preferred), environment variable, or stdin
	var examples []Example
	var jsonData []byte
	var err error

	// Try file path from environment variable first (most reliable)
	filePath := os.Getenv("EXAMPLES_JSON_FILE")
	if filePath != "" {
		jsonData, err = os.ReadFile(filePath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading examples file '%s': %v\n", filePath, err)
			os.Exit(1)
		}
	} else if envData := os.Getenv("EXAMPLES_JSON"); envData != "" {
		// Try environment variable (may have size limits on Windows)
		jsonData = []byte(envData)
	} else {
		// Fallback to stdin (for backwards compatibility)
		jsonData, err = io.ReadAll(os.Stdin)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading examples: %v\n", err)
			os.Exit(1)
		}
	}

	if len(jsonData) == 0 {
		fmt.Fprintf(os.Stderr, "No examples data provided\n")
		os.Exit(1)
	}

	if err := json.Unmarshal(jsonData, &examples); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing examples: %v\n", err)
		os.Exit(1)
	}

	if len(examples) == 0 {
		fmt.Fprintf(os.Stderr, "No examples provided\n")
		os.Exit(1)
	}

	// Create and run the Bubble Tea program
	p := tea.NewProgram(
		initialModel(examples),
		tea.WithAltScreen(),
	)

	if _, err := p.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error running program: %v\n", err)
		os.Exit(1)
	}
}
