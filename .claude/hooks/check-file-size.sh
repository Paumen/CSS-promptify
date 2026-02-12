#!/bin/bash
# PreToolUse hook for Read tool: prompt user if file exceeds 500 lines

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')

# If file doesn't exist or path is empty, let the tool handle the error
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null)

if [ "$LINE_COUNT" -gt 500 ] 2>/dev/null; then
  jq -n --arg reason "File has $LINE_COUNT lines (exceeds 500-line threshold). Consider using offset/limit parameters to read a specific section." '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "ask",
      "permissionDecisionReason": $reason
    }
  }'
fi

exit 0
