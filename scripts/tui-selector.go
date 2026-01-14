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
	
	categoryHeaderStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FFA500")).
				Bold(true).
				MarginTop(1).
				MarginBottom(0)

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
	width      int
	height     int
	viewportOffset int // First visible item index
}

func initialModel(examples []Example) model {
	return model{
		examples: examples,
		cursor: 0, // Explicitly set cursor to 0 to start at first item
		selected: make(map[int]struct{}),
		viewportOffset: 0,
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		// On first window size, ensure cursor and viewport start at beginning
		if m.cursor == 0 && m.viewportOffset == 0 {
			// Already at beginning, just adjust viewport
			m.adjustViewport()
		} else {
			// Ensure we start from the beginning on first load
			m.cursor = 0
			m.viewportOffset = 0
		}
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			m.quitting = true
			return m, tea.Quit

		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
				m.adjustViewport()
			}

		case "down", "j":
			if m.cursor < len(m.examples)-1 {
				m.cursor++
				m.adjustViewport()
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

// wrapText wraps text to fit within the given width
func wrapText(text string, width int) []string {
	if width <= 0 {
		return []string{text}
	}
	
	words := strings.Fields(text)
	if len(words) == 0 {
		return []string{""}
	}
	
	var lines []string
	currentLine := words[0]
	
	for i := 1; i < len(words); i++ {
		word := words[i]
		testLine := currentLine + " " + word
		if len(testLine) <= width {
			currentLine = testLine
		} else {
			lines = append(lines, currentLine)
			currentLine = word
		}
	}
	lines = append(lines, currentLine)
	
	return lines
}

// adjustViewport ensures the cursor is always visible
func (m *model) adjustViewport() {
	if m.height == 0 || len(m.examples) == 0 {
		return
	}
	
	// Calculate available height for items (subtract title, footer, help text)
	// Title: 1 line + margin (1) = 2 lines
	// Footer: scroll info (1) + help (1) + selection count (1) = 3 lines
	// Total: 5 lines reserved
	availableHeight := m.height - 5
	if availableHeight < 1 {
		availableHeight = 1
	}
	
	// Estimate items per screen (conservative - accounts for category headers and multi-line descriptions)
	// Assume average of 2-3 lines per item (1 for item + 1-2 for description/category)
	// Use a more generous estimate to show more items
	estimatedItemsPerScreen := (availableHeight * 2) / 3
	if estimatedItemsPerScreen < 3 {
		estimatedItemsPerScreen = 3 // Minimum to show a few items
	}
	
	// Always ensure cursor is within bounds first
	if m.cursor < 0 {
		m.cursor = 0
	}
	if m.cursor >= len(m.examples) {
		m.cursor = len(m.examples) - 1
	}
	
	// Special case: if cursor is near the beginning, always start viewport at 0
	// This ensures the beginning of the list is always visible
	// Use a slightly larger threshold to ensure we show from the beginning
	threshold := estimatedItemsPerScreen + 2
	if m.cursor < threshold {
		m.viewportOffset = 0
		return
	}
	
	// If cursor is above viewport, move viewport up to show cursor
	if m.cursor < m.viewportOffset {
		m.viewportOffset = m.cursor
	}
	
	// If cursor is below estimated viewport, move viewport down
	// Use a conservative estimate to ensure cursor is visible
	// We want the cursor to be in the lower half of visible items for better UX
	targetCursorPosition := estimatedItemsPerScreen - 2 // Keep cursor a bit above bottom
	if targetCursorPosition < 1 {
		targetCursorPosition = 1
	}
	
	if m.cursor >= m.viewportOffset+estimatedItemsPerScreen {
		m.viewportOffset = m.cursor - targetCursorPosition
		// Ensure we don't go negative
		if m.viewportOffset < 0 {
			m.viewportOffset = 0
		}
	}
	
	// Ensure viewport can show the beginning (offset 0)
	// and can scroll to show the last item
	// Max offset should allow the last item to be visible
	maxOffset := len(m.examples) - estimatedItemsPerScreen
	if maxOffset < 0 {
		maxOffset = 0
	}
	// But if cursor is near the end, allow viewport to go further to show cursor
	if m.cursor >= maxOffset {
		// Allow viewport to scroll to show cursor, but try to keep some items visible
		maxOffset = m.cursor
		if maxOffset > len(m.examples)-1 {
			maxOffset = len(m.examples) - 1
		}
	}
	if m.viewportOffset > maxOffset {
		m.viewportOffset = maxOffset
	}
	
	// Final check: ensure viewportOffset is at least 0
	if m.viewportOffset < 0 {
		m.viewportOffset = 0
	}
}

func (m model) View() string {
	if m.quitting {
		return ""
	}

	var s strings.Builder
	s.Grow(len(m.examples) * 120) // Pre-allocate capacity for better performance

	// Title
	s.WriteString(titleStyle.Render("📦 Select 3Lens Examples"))
	s.WriteString("\n")

	// Calculate available height for items
	// Title: 1 line + margin (1) = 2 lines
	// Footer: scroll info (1) + help (1) + selection count (1) = 3 lines
	// Total: 5 lines reserved
	availableHeight := m.height - 5
	if availableHeight < 1 {
		availableHeight = 1
	}
	if m.height == 0 {
		// If height not yet known, show all items (fallback)
		availableHeight = len(m.examples)
	}

	// Calculate available width for content (account for cursor, checkbox, index)
	// "> [ ] 99. " = 10 characters
	prefixWidth := 10
	availableWidth := m.width - prefixWidth
	if availableWidth < 40 {
		availableWidth = 40 // Minimum width
	}
	if m.width == 0 {
		availableWidth = 80 // Default width if unknown
	}

	// Simple, reliable approach: use viewportOffset as the base
	// Let adjustViewport() handle keeping cursor visible - don't adjust ranges here
	startIdx := m.viewportOffset
	if startIdx < 0 {
		startIdx = 0
	}
	if startIdx >= len(m.examples) {
		startIdx = len(m.examples) - 1
		if startIdx < 0 {
			startIdx = 0
		}
	}
	
	// Calculate how many items we can show (conservative estimate)
	// Account for category headers and multi-line descriptions
	estimatedItemsPerScreen := (availableHeight * 2) / 3
	if estimatedItemsPerScreen < 5 {
		estimatedItemsPerScreen = 5 // Minimum to show a reasonable number
	}
	
	// Simple endIdx calculation - just add estimated items to start
	endIdx := startIdx + estimatedItemsPerScreen
	if endIdx > len(m.examples) {
		endIdx = len(m.examples)
	}
	
	// Ensure cursor is visible (adjustViewport should handle this, but double-check)
	if m.cursor < startIdx {
		startIdx = m.cursor
		endIdx = startIdx + estimatedItemsPerScreen
		if endIdx > len(m.examples) {
			endIdx = len(m.examples)
		}
	} else if m.cursor >= endIdx {
		endIdx = m.cursor + 1
		if endIdx > len(m.examples) {
			endIdx = len(m.examples)
		}
	}
	
	// Final bounds check
	if startIdx < 0 {
		startIdx = 0
	}
	if endIdx > len(m.examples) {
		endIdx = len(m.examples)
	}
	if endIdx <= startIdx {
		endIdx = startIdx + 1
		if endIdx > len(m.examples) {
			endIdx = len(m.examples)
		}
	}

	// Track current category to show headers
	// For the first visible item, we need to show its category header
	// For subsequent items, show header when category changes
	linesUsed := 0
	lastCategory := "" // Empty string so first item always shows its header

	// Display examples within viewport - simple iteration in order
	for i := startIdx; i < endIdx; i++ {
		ex := m.examples[i]
		
		// Show category header when category changes
		if ex.CategoryName != lastCategory {
			// Add spacing before new category (but not before the very first one)
			if lastCategory != "" {
				s.WriteString("\n")
				linesUsed++
			}
			// Show category header
			s.WriteString(categoryHeaderStyle.Render(fmt.Sprintf("━━━ %s ━━━", ex.CategoryName)))
			s.WriteString("\n")
			linesUsed++
			lastCategory = ex.CategoryName
		}
		
		// Check if we have space to render this item
		// Always render cursor item, otherwise check available space
		shouldRender := (i == m.cursor) || (linesUsed < availableHeight)
		
		// Stop if we've exceeded height and we're past the cursor
		if !shouldRender && i > m.cursor {
			break
		}
		
		// Skip if no room (unless it's the cursor)
		if !shouldRender {
			continue
		}
		
		// Build the item line
		var itemLine strings.Builder
		
		// Cursor
		if m.cursor == i {
			itemLine.WriteString(cursorStyle.Render(">"))
		} else {
			itemLine.WriteString(" ")
		}

		// Checkbox
		if _, ok := m.selected[i]; ok {
			itemLine.WriteString(" [")
			itemLine.WriteString(selectedStyle.Render("✓"))
			itemLine.WriteString("]")
		} else {
			itemLine.WriteString(" [ ]")
		}

		// Index
		itemLine.WriteString(fmt.Sprintf(" %2d. ", ex.Index))
		
		// Name
		itemLine.WriteString(itemStyle.Render(ex.ShortName))
		
		// Calculate base prefix width (without ANSI codes): "> [ ] 99. " + shortName
		basePrefixWidth := 10 + len(ex.ShortName) // "> [ ] 99. " = 10 chars
		remainingWidth := availableWidth - basePrefixWidth
		
		// Description (if present) - wrap to available width
		if ex.Description != "" && remainingWidth > 20 {
			descText := fmt.Sprintf(" - %s", ex.Description)
			descLines := wrapText(descText, remainingWidth)
			
			// First line of description on same line as name
			if len(descLines) > 0 {
				itemLine.WriteString(" ")
				itemLine.WriteString(descriptionStyle.Render(descLines[0]))
				s.WriteString(itemLine.String())
				s.WriteString("\n")
				linesUsed++
				
				// Additional description lines indented
				// Always render all description lines for cursor item
				maxDescLines := len(descLines)
				if i != m.cursor {
					// For non-cursor items, limit based on available height
					if linesUsed >= availableHeight {
						maxDescLines = 1 // Only show first line
					}
				}
				for lineIdx := 1; lineIdx < len(descLines) && lineIdx < maxDescLines; lineIdx++ {
					if i != m.cursor && linesUsed >= availableHeight {
						break
					}
					indent := strings.Repeat(" ", prefixWidth)
					s.WriteString(indent)
					s.WriteString(descriptionStyle.Render(descLines[lineIdx]))
					s.WriteString("\n")
					linesUsed++
				}
			} else {
				s.WriteString(itemLine.String())
				s.WriteString("\n")
				linesUsed++
			}
		} else {
			s.WriteString(itemLine.String())
			s.WriteString("\n")
			linesUsed++
		}
	}

	// Footer with help and scroll indicator
	s.WriteString("\n")
	
	// Show scroll indicator if there are more items
	if len(m.examples) > availableHeight {
		scrollInfo := fmt.Sprintf("Showing %d-%d of %d", startIdx+1, endIdx, len(m.examples))
		s.WriteString(helpStyle.Render(scrollInfo))
		s.WriteString("\n")
	}
	
	s.WriteString(helpStyle.Render("↑↓/jk: navigate • Space: toggle • Enter: confirm • Ctrl+C/q: quit"))

	// Show selection count
	if len(m.selected) > 0 {
		s.WriteString("\n")
		s.WriteString(helpStyle.Render(fmt.Sprintf("Selected: %d example(s)", len(m.selected))))
	}

	return s.String()
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
