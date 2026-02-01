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
  // Only show markers when NO fixes have been applied (issue #18)
  // When fixes are applied, line positions change and markers would be incorrect
  const issueMarkers = useMemo((): IssueMarker[] => {
    if (!analysisResult?.issues) return [];

    // Don't show markers if any fixes are selected - positions would be wrong
    if (selectedFixIds.length > 0) {
      return [];
    }

    return analysisResult.issues.map(issue => ({
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
