# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn start` - Start development server on http://localhost:3000
- `yarn build` - Build for production (outputs to `build/` folder)
- `yarn test` - Run tests in watch mode

## Architecture

This is a React TypeScript experimental playground showcasing advanced UI components and parsing techniques. The codebase contains two main experiments:

### 1. Tag Parser (`/experiment/tags`)
Visual parser and AST visualizer for tag expressions using:
- **Ohm-js grammar parser** with manual fallback implementation
- Real-time AST visualization with syntax highlighting
- Complex expression support: `||` (OR), `,` (AND), `..` (range)

Key files:
- `src/pages/experiments/tags/TagVisualizer.tsx` - Main component
- `src/pages/experiments/tags/tagParser.ts` - Dual parser implementation
- `src/pages/experiments/tags/useASTHighlighter.tsx` - JSON syntax highlighting

### 2. Code Editor (`/experiment/editor`)
Advanced CodeMirror v6 editor with custom autocompletion:
- Custom autocompletion UI replacing CodeMirror defaults
- Categorized suggestions (functions, variables, operators, constants)
- Rich documentation display with examples
- Snippet support with tab stops

Key files:
- `src/pages/experiments/editor/Editor.tsx` - CodeMirror integration
- `src/pages/experiments/editor/components/AutocompletionUI.tsx` - Custom completion UI
- `src/pages/experiments/editor/utils.ts` - Suggestions data and documentation

## Key Patterns

- **Singleton classes**: `ExamplesManager`, `TagParser` for state management
- **Custom hooks**: Extensive use for reusable logic
- **CodeMirror extensions**: Custom state fields, ViewPlugins, and themes
- **Tailwind CSS**: Utility-first styling with custom utilities

## Dependencies

Major libraries:
- React 19.1.0 with TypeScript
- CodeMirror 6 (@codemirror/*)
- Ohm-js 17.1.0 for grammar parsing
- React Router DOM 7.6.0
- Tailwind CSS 3.4.17