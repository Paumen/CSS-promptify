import { useState, useMemo } from 'react';
import { useAppStore } from '../state';
import { Panel, PanelHeader, PanelContent, PanelFooter, Button, Row, CSSHighlighter } from './primitives';
import type { IssueMarker } from './primitives';
import styles from './InputPanel.module.css';

export function InputPanel() {
  const originalCss = useAppStore((state) => state.session.original_css);
  const setOriginalCss = useAppStore((state) => state.setOriginalCss);
  const analyzeInput = useAppStore((state) => state.analyzeInput);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const [showPreview, setShowPreview] = useState(false);

  // Convert issues to markers for highlighting in preview mode
  const issueMarkers = useMemo((): IssueMarker[] => {
    if (!analysisResult?.issues) return [];

    return analysisResult.issues.map(issue => ({
      startLine: issue.location.start.line,
      startColumn: issue.location.start.column,
      endLine: issue.location.end.line,
      endColumn: issue.location.end.column,
      severity: issue.severity
    }));
  }, [analysisResult?.issues]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalCss(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (originalCss.length > 0) {
        analyzeInput();
      }
    }
  };

  const hasContent = originalCss.length > 0;
  const hasAnalysis = analysisResult !== null;

  return (
    <Panel className={styles.inputPanel}>
      <PanelHeader>
        <h2>Input CSS</h2>
        <div className={styles.headerControls}>
          {hasContent && hasAnalysis && (
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={showPreview}
                onChange={() => setShowPreview(!showPreview)}
              />
              <span className={styles.toggleText}>Preview</span>
            </label>
          )}
          {!showPreview && (
            <span className={styles.hint}>Paste your CSS here</span>
          )}
        </div>
      </PanelHeader>
      <PanelContent>
        {showPreview && hasContent ? (
          <CSSHighlighter
            code={originalCss}
            showLineNumbers={true}
            issueMarkers={issueMarkers}
            className={styles.preview}
          />
        ) : (
          <textarea
            className={styles.textarea}
            value={originalCss}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Paste your CSS here...\n\nExample:\n.button {\n  display: flex;\n  color: #ffffff;\n  margin: 0px;\n}`}
            spellCheck={false}
          />
        )}
      </PanelContent>
      {hasContent && (
        <PanelFooter>
          <Row justify="between" style={{ width: '100%' }}>
            <span className={styles.charCount}>{originalCss.length} characters</span>
            <Button variant="primary" onClick={analyzeInput}>
              Analyze
            </Button>
          </Row>
        </PanelFooter>
      )}
    </Panel>
  );
}
