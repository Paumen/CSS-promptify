import { useAppStore } from '../state';
import { Panel, PanelHeader, PanelContent, PanelFooter, Button, Row } from './primitives';
import styles from './InputPanel.module.css';

export function InputPanel() {
  const originalCss = useAppStore((state) => state.session.original_css);
  const setOriginalCss = useAppStore((state) => state.setOriginalCss);
  const analyzeInput = useAppStore((state) => state.analyzeInput);

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

  return (
    <Panel className={styles.inputPanel}>
      <PanelHeader>
        <h2>Input CSS</h2>
        <span className={styles.hint}>Paste your CSS here</span>
      </PanelHeader>
      <PanelContent>
        <textarea
          className={styles.textarea}
          value={originalCss}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Paste your CSS here...\n\nExample:\n.button {\n  display: flex;\n  color: #ffffff;\n  margin: 0px;\n}`}
          spellCheck={false}
        />
      </PanelContent>
      {originalCss.length > 0 && (
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
