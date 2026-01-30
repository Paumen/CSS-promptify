import { useAppStore, useStats, useIssues, useSelectedFixIds } from './state';
import { InputPanel } from './ui/InputPanel';
import { IssuesPanel } from './ui/IssuesPanel';
import { OutputPanel } from './ui/OutputPanel';
import './App.css';

function App() {
  const { session, outputCss, analyzeInput, reset } = useAppStore();
  const stats = useStats();
  const issues = useIssues();
  const selectedFixIds = useSelectedFixIds();

  const hasInput = session.original_css.length > 0;
  const hasAnalysis = issues.length > 0 || outputCss.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>CSS Promptify</h1>
        <p className="tagline">Analyze, fix, and optimize CSS for LLM consumption</p>
      </header>

      <main className="app-main">
        <div className="panels">
          <InputPanel />

          {hasAnalysis && (
            <>
              <IssuesPanel />
              <OutputPanel />
            </>
          )}
        </div>

        {hasInput && !hasAnalysis && (
          <div className="actions">
            <button className="btn btn-primary" onClick={analyzeInput}>
              Analyze CSS
            </button>
          </div>
        )}

        {hasAnalysis && (
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-label">Before:</span>
              <span className="stat-value">{stats.before.tokens} tokens</span>
              <span className="stat-detail">({stats.before.lines} lines, {stats.before.characters} chars)</span>
            </div>
            <div className="stat">
              <span className="stat-label">After:</span>
              <span className="stat-value">{stats.after.tokens} tokens</span>
              <span className="stat-detail">({stats.after.lines} lines, {stats.after.characters} chars)</span>
            </div>
            {stats.before.tokens > stats.after.tokens && (
              <div className="stat stat-savings">
                <span className="stat-label">Saved:</span>
                <span className="stat-value">{stats.before.tokens - stats.after.tokens} tokens</span>
                <span className="stat-detail">({Math.round((1 - stats.after.tokens / stats.before.tokens) * 100)}%)</span>
              </div>
            )}
            <div className="stat">
              <span className="stat-label">Issues:</span>
              <span className="stat-value">{issues.length}</span>
              <span className="stat-detail">({selectedFixIds.length} selected)</span>
            </div>
            <button className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>CSS Promptify v1.0 - 10 rules active</p>
      </footer>
    </div>
  );
}

export default App;
