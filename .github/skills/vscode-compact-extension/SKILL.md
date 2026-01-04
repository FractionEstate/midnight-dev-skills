---
name: vscode-compact-extension
description: Guide for installing and using the VS Code extension for Compact smart contract development. Use when users need syntax highlighting, code snippets, error highlighting, or task configuration for Midnight Compact development. Triggers on requests about VS Code setup, VSIX installation, Compact snippets, or IDE configuration.
---

# VS Code Extension for Compact

The Visual Studio Code extension for Compact assists with writing and debugging smart contracts in Midnight's Compact language.

## Features

- **Syntax Highlighting**: Keywords, literals, comments, parentheses
- **Code Snippets**: Templates for common patterns
- **Error Highlighting**: Compiler errors in Problems panel
- **File Templates**: Quick-start contract scaffolding
- **Build Tasks**: Integrated compilation workflow

## Installation

### Option 1: Install from VSIX File

```bash
# Download latest VSIX
curl -LO https://raw.githubusercontent.com/midnight-ntwrk/releases/gh-pages/artifacts/vscode-extension/compact-0.2.13/compact-0.2.13.vsix

# Install via command line
code --install-extension compact-0.2.13.vsix

# Or in VS Code:
# 1. Cmd/Ctrl+Shift+P → "Extensions: Install from VSIX..."
# 2. Select the downloaded .vsix file
```

### Option 2: Install via VS Code UI

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Install from VSIX..."
4. Navigate to and select `compact-0.2.13.vsix`
5. Reload VS Code when prompted

**Verify Installation**: Open a `.compact` file - syntax highlighting should appear.

## Syntax Highlighting

The extension recognizes:

| Element | Examples |
|---------|----------|
| Keywords | `enum`, `struct`, `circuit`, `ledger`, `export`, `witness` |
| Literals | `"string"`, `true`, `false`, `123` |
| Comments | `// single line`, `/* multi line */` |
| Types | `Opaque<"string">`, `Map<K, V>` |

## Code Snippets

Type these prefixes and press Tab to expand:

| Prefix | Expands To |
|--------|------------|
| `ledger` or `state` | Ledger declaration |
| `circuit` or `function` | Circuit function |
| `witness` or `private` | Witness (private) function |
| `constructor` | Constructor in ledger |
| `stdlib` or `init` | Standard library import |
| `if` or `cond` | If statement |
| `map` or `for` | Map iteration |
| `fold` | Fold operation |
| `enum` | Enum definition |
| `struct` | Struct definition |
| `module` | Module definition |
| `assert` | Assert statement |
| `pragma` | Pragma directive |
| `compact` | Full contract template |

### Using Snippets

1. Create a new `.compact` file
2. Type a snippet prefix (e.g., `circuit`)
3. Press `Tab` to expand
4. Use `Tab` to move between placeholders

## File Template

Create a complete contract skeleton:

1. Open Command Palette (`Cmd+Shift+P`)
2. Select "Snippets: Fill File with Snippet"
3. Choose "Compact"

This generates:

```compact
pragma language_version 0.17;

export ledger state: Opaque<"string">;

export circuit init(): [] {
    state = disclose("");
}
```

**Warning**: This overwrites existing file content!

## Build Tasks Configuration

### Basic package.json Script

```json
{
  "scripts": {
    "compact": "compact compile --vscode ./src/myContract.compact ./src/managed/myContract"
  }
}
```

Run with: `npm run compact` or `yarn compact`

### VS Code Tasks (Recommended)

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Compact (current file)",
      "type": "shell",
      "command": "npx compact compile --vscode --skip-zk ${file} ${workspaceFolder}/src/managed",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "never",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": false,
        "clear": true,
        "revealProblems": "onProblem"
      },
      "problemMatcher": [
        "$compactException",
        "$compactInternal",
        "$compactCommandNotFound"
      ]
    },
    {
      "label": "Compile Compact (full build)",
      "type": "shell",
      "command": "npx compact compile --vscode ${workspaceFolder}/contracts/*.compact ${workspaceFolder}/contracts/managed",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": [
        "$compactException",
        "$compactInternal",
        "$compactCommandNotFound"
      ]
    }
  ]
}
```

### Compiler Flags

| Flag | Purpose |
|------|---------|
| `--vscode` | Format errors for VS Code (no newlines) |
| `--skip-zk` | Skip ZK circuit generation (faster syntax check) |

### Problem Matchers

The extension provides three problem matchers:

- `$compactException` - Compact compilation errors
- `$compactInternal` - Internal compiler errors
- `$compactCommandNotFound` - Compiler not found

## Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Run Build Task | `Cmd+Shift+B` | `Ctrl+Shift+B` |
| Toggle Problems | `Cmd+Shift+M` | `Ctrl+Shift+M` |
| Go to Error | `F8` | `F8` |

## Troubleshooting

### Extension Not Working

```bash
# Check if installed
code --list-extensions | grep compact

# Reinstall
code --uninstall-extension midnight.compact
code --install-extension compact-0.2.13.vsix
```

### No Syntax Highlighting

1. Ensure file has `.compact` extension
2. Check bottom-right language mode shows "Compact"
3. Click language mode → Select "Compact" if needed

### Errors Not Showing in Problems Panel

1. Verify `--vscode` flag is in compile command
2. Check `problemMatcher` is configured in tasks.json
3. Run "Developer: Reload Window" from Command Palette

### Compiler Not Found

```bash
# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Verify
which compact
compact --version
```

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.2.13 | Feb 2024 | Bug fixes, performance improvements |

## Resources

- [Official Documentation](https://docs.midnight.network/develop/reference/tools/vsc-plugin/)
- [Release Notes](https://docs.midnight.network/relnotes/vs-code-extension)
- [Download VSIX](https://raw.githubusercontent.com/midnight-ntwrk/releases/gh-pages/artifacts/vscode-extension/compact-0.2.13/compact-0.2.13.vsix)
