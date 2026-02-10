#!/usr/bin/env bash
# Four-Agent Repo Hygiene Pipeline — Shell Bootstrap
#
# Prepares the environment, resolves paths, and prints the Claude Code
# invocation command. The actual orchestration runs inside Claude Code.
#
# Usage:
#   bash scripts/agents/run-pipeline.sh [--auto]
#
# Options:
#   --auto    Set approval_mode to "auto" (skip human approval gates)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || cd "$(dirname "$0")/../.." && pwd)"
ARTIFACTS_DIR="$REPO_ROOT/.pipeline/artifacts"
CONFIG_FILE="$REPO_ROOT/.pipeline/config.json"

echo "=== Four-Agent Repo Hygiene Pipeline ==="
echo "Repo root: $REPO_ROOT"
echo ""

# Handle --auto flag
APPROVAL_MODE="prompt"
if [[ "${1:-}" == "--auto" ]]; then
  APPROVAL_MODE="auto"
  echo "[config] Approval mode: auto (human gates disabled)"
else
  echo "[config] Approval mode: prompt (human approval required for major changes)"
fi

# Pre-flight: ensure artifacts directory exists and is clean
echo "[pre-flight] Preparing artifacts directory..."
mkdir -p "$ARTIFACTS_DIR"
rm -f "$ARTIFACTS_DIR"/*.json "$ARTIFACTS_DIR"/*.md 2>/dev/null || true

# Write/update config
cat > "$CONFIG_FILE" <<EOF
{
  "approval_mode": "$APPROVAL_MODE",
  "repo_root": "$REPO_ROOT"
}
EOF
echo "[pre-flight] Config written to $CONFIG_FILE"

# Record pipeline start commit
START_COMMIT=$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo "no-git")
echo "$START_COMMIT" > "$ARTIFACTS_DIR/.pipeline-start-commit"
echo "[pre-flight] Start commit: $START_COMMIT"

# Verify agent prompt files exist
echo "[pre-flight] Verifying agent prompts..."
for f in 01-repo-auditor.md 02-structure-engineer.md 03-adversarial-reviewer.md 04-fix-consolidator.md pipeline-trigger.md; do
  if [[ ! -f "$REPO_ROOT/scripts/agents/$f" ]]; then
    echo "ERROR: Missing agent prompt: scripts/agents/$f"
    exit 1
  fi
done
echo "[pre-flight] All agent prompts present."

echo ""
echo "[ready] Pipeline environment prepared."
echo ""
echo "To run the full pipeline in Claude Code, use this prompt:"
echo ""
echo "  Run the repo hygiene pipeline: read and execute scripts/agents/pipeline-trigger.md"
echo ""
echo "The orchestrator will:"
echo "  1. Detect repo root automatically (portable — no hardcoded paths)"
echo "  2. Replace {{REPO_ROOT}} placeholders in all agent prompts"
echo "  3. Launch each agent sequentially with hard phase gates"
echo "  4. Display before/after health comparison with ASCII visualization"
echo "  5. Ask for your approval before committing changes"
echo ""
