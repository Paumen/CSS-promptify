import { useState, useMemo } from 'react';
import { useAppStore } from '../state';
import { Panel, PanelHeader, PanelContent, PanelFooter, Button, Row, CSSHighlighter } from './primitives';
import type { IssueMarker } from './primitives';
import styles from './OutputPanel.module.css';

export function OutputPanel() {
  const outputCss = useAppStore((state) => state.outputCss);
  const commentsEnabled = useAppStore((state) => state.session.comments_enabled);
  const toggleComments = useAppStore((state) => state.toggleComments);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const selectedFixIds = useAppStore((state) => state.session.selected_fix_ids);
  const [copied, setCopied] = useState(false);

  // Convert issues to issue markers for highlighting
  // Filter out issues that have been fixed (issue #18)
  // When fixes are applied, their positions change, so we only show unfixed issues
  const issueMarkers = useMemo((): IssueMarker[] => {
    if (!analysisResult?.issues) return [];

    // Filter out issues whose fixes have been selected
    const unfixedIssues = analysisResult.issues.filter(issue => {
      // If issue has no fix, always show it
      if (!issue.fix) return true;
      // If issue's fix is selected, don't show it (position may have changed)
      return !selectedFixIds.includes(issue.fix.id);
    });

    return unfixedIssues.map(issue => ({
      startLine: issue.location.start.line,
      startColumn: issue.location.start.column,
      endLine: issue.location.end.line,
      endColumn: issue.location.end.column,
      severity: issue.severity
    }));
  }, [analysisResult?.issues, selectedFixIds]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyWithoutComments = async () => {
    const cleaned = outputCss.replace(/\s*\/\*\s*cssreview:[^*]*\*\//g, '');
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Panel className={styles.outputPanel}>
      <PanelHeader>
        <h2>Output CSS</h2>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={commentsEnabled}
            onChange={toggleComments}
          />
          <span className={styles.toggleText}>Show comments</span>
        </label>
      </PanelHeader>

      <PanelContent>
        <CSSHighlighter
          code={outputCss}
          showLineNumbers={true}
          issueMarkers={issueMarkers}
        />
      </PanelContent>

      <PanelFooter>
        <Row gap="sm">
          <Button
            variant="primary"
            onClick={handleCopy}
            disabled={!outputCss}
          >
            {copied ? 'Copied!' : 'Copy Output'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyWithoutComments}
            disabled={!outputCss}
          >
            Copy (no comments)
          </Button>
        </Row>
      </PanelFooter>
    </Panel>
  );
}
