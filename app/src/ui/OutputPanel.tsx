import { useState } from 'react';
import { useAppStore } from '../state';
import './OutputPanel.css';

export function OutputPanel() {
  // Use individual selectors to avoid infinite re-renders
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
    // Remove cssreview: comments
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
    <div className="panel output-panel">
      <div className="panel-header">
        <h2>Output CSS</h2>
        <div className="output-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={commentsEnabled}
              onChange={toggleComments}
            />
            Show comments
          </label>
        </div>
      </div>

      <div className="panel-content">
        <pre className="css-output">
          <code>{outputCss || '(No output yet)'}</code>
        </pre>
      </div>

      <div className="panel-footer">
        <button
          className="btn btn-primary"
          onClick={handleCopy}
          disabled={!outputCss}
        >
          {copied ? 'Copied!' : 'Copy Output'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleCopyWithoutComments}
          disabled={!outputCss}
        >
          Copy (no comments)
        </button>
      </div>
    </div>
  );
}
