# VS Code extension for Compact

This reference summarizes the official Midnight documentation for the Visual Studio Code extension for
Compact.

Source: <https://docs.midnight.network/compact/reference/tools/vsc-plugin>

## What you get

- Syntax highlighting for Compact keywords, literals, comments, and parentheses.
- Build integration: compile contracts and show errors in the **Problems** panel.
- Snippets for common Compact constructs (ledger, constructor, circuits, witness, imports, etc.).
- A file template snippet to generate a simple contract skeleton.

## Compile scripts (package.json)

When compiling from a script, the docs recommend using the compiler flag `--vscode` so error messages
render properly inside VS Code.

Example script:

```json
{
  "scripts": {
    "compact": "compact compile --vscode ./src/myContract.compact ./src/managed/myContract"
  }
}
```

Then run:

```bash
yarn compact
```

If the compiler is not on your `PATH`, follow the "Running Midnight Compact compiler" instructions in the main docs.

## VS Code tasks (tasks.json)

For quick iteration (especially on larger contracts), you can configure a build task.

Example task (from the docs):

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile compact file to JS",
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
    }
  ]
}
```

Notes:

- `--skip-zk` skips proving key generation, which can be slow and is often unnecessary when you just want
  fast syntax/type feedback.
- Problem matchers allow compiler errors to show up in the **Problems** tab.
- VS Code task format details: <https://code.visualstudio.com/docs/editor/tasks>

## Compiler flags referenced

- `--vscode`: omit newlines in error messages (so VS Code renders them correctly).
- `--skip-zk`: skip proving key generation (useful for quick iteration).

The Compact compiler manual page lists these flags: <https://docs.midnight.network/compact/reference/tools/compiler-usage>
