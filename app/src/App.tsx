import { useMemo, useState } from 'react';
import { useAppStore, calculateStats } from './state';
import { getAllRules } from './rules';
import { InputPanel } from './ui/InputPanel';
import { IssuesPanel } from './ui/IssuesPanel';
import { OutputPanel } from './ui/OutputPanel';
import { SettingsPanel } from './ui/SettingsPanel';
import { Button } from './ui/primitives';
import type { RuleGroup } from './types';
import styles from './App.module.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const originalCss = useAppStore((state) => state.session.original_css);
  const outputCss = useAppStore((state) => state.outputCss);
  const analyzeInput = useAppStore((state) => state.analyzeInput);
  const reset = useAppStore((state) => state.reset);
  const issues = useAppStore((state) => state.analysisResult?.issues);
  const selectedFixIds = useAppStore((state) => state.session.selected_fix_ids);
  const config = useAppStore((state) => state.config);

  const stats = useMemo(() => ({
    before: calculateStats(originalCss || ''),
    after: calculateStats(outputCss || ''),
  }), [originalCss, outputCss]);

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
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>CSS Promptify</h1>
          <p className={styles.tagline}>Analyze, fix, and optimize CSS for LLM consumption</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setSettingsOpen(true)}
          title="Configure rules"
        >
          Settings
        </Button>
      </header>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className={styles.main}>
        <div className={styles.panels}>
          <InputPanel />

          {hasAnalysis && (
            <>
              <IssuesPanel />
              <OutputPanel />
            </>
          )}
        </div>

        {hasAnalysis && (
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Before:</span>
              <span className={styles.statValue}>{stats.before.tokens} tokens</span>
              <span className={styles.statDetail}>({stats.before.lines} lines, {stats.before.characters} chars)</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>After:</span>
              <span className={styles.statValue}>{stats.after.tokens} tokens</span>
              <span className={styles.statDetail}>({stats.after.lines} lines, {stats.after.characters} chars)</span>
            </div>
            {stats.before.tokens > stats.after.tokens && (
              <div className={`${styles.stat} ${styles.statSavings}`}>
                <span className={styles.statLabel}>Saved:</span>
                <span className={styles.statValue}>{stats.before.tokens - stats.after.tokens} tokens</span>
                <span className={styles.statDetail}>({Math.round((1 - stats.after.tokens / stats.before.tokens) * 100)}%)</span>
              </div>
            )}
            <div className={styles.stat}>
              <span className={styles.statLabel}>Issues:</span>
              <span className={styles.statValue}>{issueCount}</span>
              <span className={styles.statDetail}>({selectedFixIds.length} selected)</span>
            </div>
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>CSS Promptify v1.0 - {activeRulesCount} rules active</p>
      </footer>
    </div>
  );
}

export default App;
