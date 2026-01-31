import { useAppStore } from '../state';
import { hasSafeFix } from '../types';
import type { Issue, Severity } from '../types';
import { Panel, PanelHeader, PanelContent, Badge, Button, Row } from './primitives';
import styles from './IssuesPanel.module.css';

const EMPTY_ISSUES: Issue[] = [];

function IssueItem({ issue, isSelected, onToggle }: {
  issue: Issue;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canFix = hasSafeFix(issue);
  const severityVariant = issue.severity as Severity;

  return (
    <div className={`${styles.issueItem} ${isSelected ? styles.issueItemSelected : ''}`}>
      <div className={styles.issueHeader}>
        {canFix && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className={styles.issueCheckbox}
          />
        )}
        <Badge variant={severityVariant}>{issue.severity}</Badge>
        <span className={styles.issueRule}>{issue.rule_id}</span>
      </div>
      <div className={styles.issueMessage}>{issue.message}</div>
      <div className={styles.issueLocation}>
        Line {issue.location.start.line}, col {issue.location.start.column}
      </div>
      {canFix && issue.fix && (
        <div className={styles.issuePreview}>
          <span className={styles.previewLabel}>Fix:</span>
          <code className={styles.previewCode}>{issue.fix.preview || '(remove)'}</code>
        </div>
      )}
      <details className={styles.issueLogic}>
        <summary>Rule Logic</summary>
        <div className={styles.logicContent}>
          <p><strong>WHAT:</strong> {issue.logic.what}</p>
          <p><strong>WHY:</strong> {issue.logic.why}</p>
          <p><strong>WHEN SAFE:</strong> {issue.logic.when_safe}</p>
        </div>
      </details>
    </div>
  );
}

export function IssuesPanel() {
  const toggleFix = useAppStore((state) => state.toggleFix);
  const selectAllFixes = useAppStore((state) => state.selectAllFixes);
  const unselectAllFixes = useAppStore((state) => state.unselectAllFixes);
  const rawIssues = useAppStore((state) => state.analysisResult?.issues);
  const selectedFixIds = useAppStore((state) => state.session.selected_fix_ids);

  const issues = rawIssues ?? EMPTY_ISSUES;

  const fixableIssues = issues.filter(hasSafeFix);
  const allSelected = fixableIssues.length > 0 &&
    fixableIssues.every((issue) => selectedFixIds.includes(issue.fix!.id));

  const handleToggleAll = () => {
    if (allSelected) {
      unselectAllFixes();
    } else {
      selectAllFixes();
    }
  };

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return (
    <Panel className={styles.issuesPanel}>
      <PanelHeader>
        <h2>Issues ({issues.length})</h2>
        <Row gap="sm" className={styles.issueCounts}>
          {errorCount > 0 && <Badge variant="error">{errorCount} errors</Badge>}
          {warningCount > 0 && <Badge variant="warning">{warningCount} warnings</Badge>}
          {infoCount > 0 && <Badge variant="info">{infoCount} info</Badge>}
        </Row>
      </PanelHeader>

      {fixableIssues.length > 0 && (
        <div className={styles.panelActions}>
          <Button size="small" onClick={handleToggleAll}>
            {allSelected ? 'Unselect All' : 'Select All Fixes'}
          </Button>
          <span className={styles.selectedCount}>
            {selectedFixIds.length} / {fixableIssues.length} selected
          </span>
        </div>
      )}

      <PanelContent scrollable className={styles.issuesList}>
        {issues.length === 0 ? (
          <div className={styles.noIssues}>No issues found!</div>
        ) : (
          issues.map((issue) => (
            <IssueItem
              key={issue.id}
              issue={issue}
              isSelected={issue.fix ? selectedFixIds.includes(issue.fix.id) : false}
              onToggle={() => issue.fix && toggleFix(issue.fix.id)}
            />
          ))
        )}
      </PanelContent>
    </Panel>
  );
}
