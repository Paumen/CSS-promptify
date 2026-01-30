import { useAppStore, useIssues, useSelectedFixIds } from '../state';
import { hasSafeFix } from '../types';
import type { Issue } from '../types';
import './IssuesPanel.css';

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`severity-badge severity-${severity}`}>
      {severity}
    </span>
  );
}

function IssueItem({ issue, isSelected, onToggle }: {
  issue: Issue;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canFix = hasSafeFix(issue);

  return (
    <div className={`issue-item ${isSelected ? 'selected' : ''}`}>
      <div className="issue-header">
        {canFix && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="issue-checkbox"
          />
        )}
        <SeverityBadge severity={issue.severity} />
        <span className="issue-rule">{issue.rule_id}</span>
      </div>
      <div className="issue-message">{issue.message}</div>
      <div className="issue-location">
        Line {issue.location.start.line}, col {issue.location.start.column}
      </div>
      {canFix && issue.fix && (
        <div className="issue-preview">
          <span className="preview-label">Fix:</span>
          <code className="preview-code">{issue.fix.preview || '(remove)'}</code>
        </div>
      )}
      <details className="issue-logic">
        <summary>Rule Logic</summary>
        <div className="logic-content">
          <p><strong>WHAT:</strong> {issue.logic.what}</p>
          <p><strong>WHY:</strong> {issue.logic.why}</p>
          <p><strong>WHEN SAFE:</strong> {issue.logic.when_safe}</p>
        </div>
      </details>
    </div>
  );
}

export function IssuesPanel() {
  const { toggleFix, selectAllFixes, unselectAllFixes } = useAppStore();
  const issues = useIssues();
  const selectedFixIds = useSelectedFixIds();

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
    <div className="panel issues-panel">
      <div className="panel-header">
        <h2>Issues ({issues.length})</h2>
        <div className="issue-counts">
          {errorCount > 0 && <span className="count count-error">{errorCount} errors</span>}
          {warningCount > 0 && <span className="count count-warning">{warningCount} warnings</span>}
          {infoCount > 0 && <span className="count count-info">{infoCount} info</span>}
        </div>
      </div>

      {fixableIssues.length > 0 && (
        <div className="panel-actions">
          <button className="btn btn-small" onClick={handleToggleAll}>
            {allSelected ? 'Unselect All' : 'Select All Fixes'}
          </button>
          <span className="selected-count">
            {selectedFixIds.length} / {fixableIssues.length} selected
          </span>
        </div>
      )}

      <div className="panel-content issues-list">
        {issues.length === 0 ? (
          <div className="no-issues">No issues found!</div>
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
      </div>
    </div>
  );
}
