import { useState } from 'react';
import { useAppStore } from '../state';
import { Panel, PanelHeader, PanelContent, PanelFooter, Button, CodeBlock, Row } from './primitives';
import styles from './OutputPanel.module.css';

export function OutputPanel() {
  const outputCss = useAppStore((state) => state.outputCss);
  const commentsEnabled = useAppStore((state) => state.session.comments_enabled);
  const toggleComments = useAppStore((state) => state.toggleComments);
  const [copied, setCopied] = useState(false);

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
          Show comments
        </label>
      </PanelHeader>

      <PanelContent>
        <CodeBlock>{outputCss || '(No output yet)'}</CodeBlock>
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
