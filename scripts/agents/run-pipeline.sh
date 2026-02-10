#!/usr/bin/env bash
# Four-Agent Repo Hygiene Pipeline — Shell Bootstrap
#
# This script prepares the environment for the pipeline and provides
# the invocation command for Claude Code. The actual orchestration
# happens inside Claude Code using Task agents.
#
# Usage:
#   bash scripts/agents/run-pipeline.sh
#
# Or simply tell Claude Code:
#   "Run the four-agent repo hygiene pipeline defined in scripts/agents/pipeline-trigger.md"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ARTIFACTS_DIR="$REPO_ROOT/.pipeline/artifacts"

echo "=== Four-Agent Repo Hygiene Pipeline ==="
echo "Repo root: $REPO_ROOT"
echo ""

# Pre-flight: ensure artifacts directory exists and is clean
echo "[pre-flight] Preparing artifacts directory..."
mkdir -p "$ARTIFACTS_DIR"
rm -f "$ARTIFACTS_DIR"/*.json "$ARTIFACTS_DIR"/*.md 2>/dev/null || true

# Record pipeline start commit
START_COMMIT=$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo "no-git")
echo "$START_COMMIT" > "$ARTIFACTS_DIR/.pipeline-start-commit"
echo "[pre-flight] Start commit: $START_COMMIT"

echo ""
echo "[ready] Pipeline environment prepared."
echo ""
echo "To run the full pipeline in Claude Code, use this prompt:"
echo ""
echo '  Run the four-agent repo hygiene pipeline. Execute each phase sequentially:'
echo '  Phase 1: Read scripts/agents/01-repo-auditor.md and launch a Task agent (haiku) with its contents.'
echo '  Phase 2: Read scripts/agents/02-structure-engineer.md and launch a Task agent (sonnet) with its contents.'
echo '  Phase 3: Read scripts/agents/03-adversarial-reviewer.md and launch a Task agent (opus) with its contents.'
echo '  Phase 4: Read scripts/agents/04-fix-consolidator.md and launch a Task agent (sonnet) with its contents.'
echo '  Between each phase, verify the artifact JSON exists in .pipeline/artifacts/.'
echo '  After Phase 4, print the change summary and git diff --stat.'
echo ""
