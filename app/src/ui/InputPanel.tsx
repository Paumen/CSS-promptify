import { useAppStore } from '../state';
import './InputPanel.css';

export function InputPanel() {
  const { session, setOriginalCss, analyzeInput } = useAppStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalCss(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow default paste, then optionally auto-analyze
    setTimeout(() => {
      const target = e.target as HTMLTextAreaElement;
      if (target.value.length > 0) {
        // Don't auto-analyze, let user click the button
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to analyze
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (session.original_css.length > 0) {
        analyzeInput();
      }
    }
  };

  return (
    <div className="panel input-panel">
      <div className="panel-header">
        <h2>Input CSS</h2>
        <span className="hint">Paste your CSS here</span>
      </div>
      <div className="panel-content">
        <textarea
          className="css-input"
          value={session.original_css}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={`Paste your CSS here...\n\nExample:\n.button {\n  display: flex;\n  color: #ffffff;\n  margin: 0px;\n}`}
          spellCheck={false}
        />
      </div>
      {session.original_css.length > 0 && (
        <div className="panel-footer">
          <span className="char-count">{session.original_css.length} characters</span>
          <button className="btn btn-primary" onClick={analyzeInput}>
            Analyze
          </button>
        </div>
      )}
    </div>
  );
}
