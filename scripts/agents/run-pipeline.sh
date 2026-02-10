#!/usr/bin/env bash
# Four-Agent Repo Hygiene Pipeline — Shell Bootstrap
#
# Prepares the environment, resolves paths, and prints the Claude Code
# invocation command. The actual orchestration runs inside Claude Code.
#
# Usage:
#   bash scripts/agents/run-pipeline.sh [--auto] [--dry-run]
#
# Options:
#   --auto      Set approval_mode to "auto" (skip human approval gates)
#   --dry-run   Run only the Auditor (Phase 1) — no mutations, just health report

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || (cd "$(dirname "$0")/../.." && pwd))"
ARTIFACTS_DIR="$REPO_ROOT/.pipeline/artifacts"
CONFIG_FILE="$REPO_ROOT/.pipeline/config.json"

echo "=== Four-Agent Repo Hygiene Pipeline ==="
echo "Repo root: $REPO_ROOT"
echo ""

# Handle flags
APPROVAL_MODE="prompt"
DRY_RUN="false"
for arg in "$@"; do
  case "$arg" in
    --auto)    APPROVAL_MODE="auto" ;;
    --dry-run) DRY_RUN="true" ;;
  esac
done

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[config] Mode: DRY RUN (Auditor only — no mutations)"
elif [[ "$APPROVAL_MODE" == "auto" ]]; then
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
  "dry_run": $DRY_RUN,
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
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  Run a dry-run repo health audit: read scripts/agents/pipeline-trigger.md and execute Phase 1 only (Auditor). Stop after producing the health baseline report. Do not run Phases 2-4."
else
  echo "  Run the repo hygiene pipeline: read and execute scripts/agents/pipeline-trigger.md"
fi
echo ""
echo "The orchestrator will:"
echo "  1. Detect repo root automatically (portable — no hardcoded paths)"
echo "  2. Replace {{REPO_ROOT}} placeholders in all agent prompts"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "  3. Run only the Auditor agent (read-only, no mutations)"
  echo "  4. Print the health baseline and findings summary"
else
  echo "  3. Launch each agent sequentially with hard phase gates"
  echo "  4. Display before/after health comparison with ASCII visualization"
  echo "  5. Ask for your approval before committing changes"
fi
echo ""
