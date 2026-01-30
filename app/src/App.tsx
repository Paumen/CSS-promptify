import { useMemo, useState } from 'react';
import { useAppStore, calculateStats } from './state';
import { getAllRules } from './rules';
import { InputPanel } from './ui/InputPanel';
import { IssuesPanel } from './ui/IssuesPanel';
import { OutputPanel } from './ui/OutputPanel';
import { SettingsPanel } from './ui/SettingsPanel';
import type { RuleGroup } from './types';
import './App.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Use individual selectors to avoid infinite re-renders
  const originalCss = useAppStore((state) => state.session.original_css);
  const outputCss = useAppStore((state) => state.outputCss);
  const analyzeInput = useAppStore((state) => state.analyzeInput);
  const reset = useAppStore((state) => state.reset);
  const issues = useAppStore((state) => state.analysisResult?.issues);
  const selectedFixIds = useAppStore((state) => state.session.selected_fix_ids);
  const config = useAppStore((state) => state.config);

  // Memoize stats to avoid recalculation on every render
  const stats = useMemo(() => ({
    before: calculateStats(originalCss || ''),
    after: calculateStats(outputCss || ''),
  }), [originalCss, outputCss]);

  // Calculate active rules count
  const activeRulesCount = useMemo(() => {
    const allRules = getAllRules();
    return allRules.filter((rule) => {
      const groupEnabled = config.groups[rule.meta.group as RuleGroup]?.enabled ?? true;
      if (!groupEnabled) return false;
      const ruleConfig = config.rules[rule.meta.rule_id];
      return ruleConfig?.enabled ?? rule.meta.enabled_by_default;
    }).length;
  }, [config]);

  const hasInput = originalCss.length > 0;
  const issueCount = issues?.length ?? 0;
  const hasAnalysis = issueCount > 0 || outputCss.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>CSS Promptify</h1>
          <p className="tagline">Analyze, fix, and optimize CSS for LLM consumption</p>
        </div>
        <button
          className="btn btn-secondary settings-btn"
          onClick={() => setSettingsOpen(true)}
          title="Configure rules"
        >
          Settings
        </button>
      </header>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
              <span className="stat-value">{issueCount}</span>
              <span className="stat-detail">({selectedFixIds.length} selected)</span>
            </div>
            <button className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>CSS Promptify v1.0 - {activeRulesCount} rules active</p>
      </footer>
    </div>
  );
}

export default App;
