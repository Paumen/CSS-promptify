import { useAppStore } from '../state';
import { getAllRules } from '../rules';
import type { Rule, RuleGroup, Severity } from '../types';
import './SettingsPanel.css';

// All rule groups in display order
const RULE_GROUPS: { id: RuleGroup; label: string; description: string }[] = [
  { id: 'safety', label: 'Safety', description: 'Syntax validation and error detection' },
  { id: 'format', label: 'Format', description: 'LLM-friendly formatting rules' },
  { id: 'tokens', label: 'Tokens', description: 'Token optimization and simplification' },
  { id: 'consolidation', label: 'Consolidation', description: 'CSS deduplication and merging' },
  { id: 'modern', label: 'Modern', description: 'Modern CSS best practices' },
  { id: 'education', label: 'Education', description: 'Educational warnings about CSS usage' },
];

// Severity cycle: off -> info -> warning -> error -> off
const SEVERITY_CYCLE: (Severity | 'off')[] = ['off', 'info', 'warning', 'error'];

function getNextSeverity(current: Severity | 'off'): Severity | 'off' {
  const currentIndex = SEVERITY_CYCLE.indexOf(current);
  return SEVERITY_CYCLE[(currentIndex + 1) % SEVERITY_CYCLE.length];
}

function SeverityButton({
  severity,
  onClick,
  title
}: {
  severity: Severity | 'off';
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className={`severity-btn severity-btn-${severity}`}
      onClick={onClick}
      title={title}
    >
      {severity}
    </button>
  );
}

function RuleItem({
  rule,
  isEnabled,
  currentSeverity,
  onToggle,
  onCycleSeverity
}: {
  rule: Rule;
  isEnabled: boolean;
  currentSeverity: Severity | 'off';
  onToggle: () => void;
  onCycleSeverity: () => void;
}) {
  // Extract rule name from rule_id (e.g., "format/no-tabs" -> "no-tabs")
  const ruleName = rule.meta.rule_id.split('/').pop() || rule.meta.rule_id;

  return (
    <div className={`rule-item ${!isEnabled ? 'rule-disabled' : ''}`}>
      <div className="rule-main">
        <label className="rule-toggle">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={onToggle}
          />
          <span className="rule-name">{ruleName}</span>
        </label>
        <SeverityButton
          severity={currentSeverity}
          onClick={onCycleSeverity}
          title={`Click to cycle: off -> info -> warning -> error (current: ${currentSeverity})`}
        />
      </div>
      <div className="rule-meta">
        <span className="rule-fixability">{rule.meta.fixability}</span>
        <span className="rule-applies">{rule.meta.applies_to}</span>
      </div>
    </div>
  );
}

function GroupSection({
  group,
  rules,
}: {
  group: { id: RuleGroup; label: string; description: string };
  rules: Rule[];
}) {
  const config = useAppStore((state) => state.config);
  const setRuleEnabled = useAppStore((state) => state.setRuleEnabled);
  const setRuleSeverity = useAppStore((state) => state.setRuleSeverity);
  const setGroupEnabled = useAppStore((state) => state.setGroupEnabled);

  const groupConfig = config.groups[group.id];
  const isGroupEnabled = groupConfig?.enabled ?? true;

  // Count enabled rules in group
  const enabledCount = rules.filter((rule) => {
    const ruleConfig = config.rules[rule.meta.rule_id];
    if (ruleConfig) {
      return ruleConfig.enabled;
    }
    return rule.meta.enabled_by_default;
  }).length;

  const handleGroupToggle = () => {
    setGroupEnabled(group.id, !isGroupEnabled);
  };

  const handleRuleToggle = (ruleId: string) => {
    const ruleConfig = config.rules[ruleId];
    const rule = rules.find((r) => r.meta.rule_id === ruleId);
    const currentEnabled = ruleConfig?.enabled ?? rule?.meta.enabled_by_default ?? true;
    setRuleEnabled(ruleId, !currentEnabled);
  };

  const handleSeverityCycle = (ruleId: string) => {
    const ruleConfig = config.rules[ruleId];
    const rule = rules.find((r) => r.meta.rule_id === ruleId);
    const isEnabled = ruleConfig?.enabled ?? rule?.meta.enabled_by_default ?? true;
    const currentSeverity = ruleConfig?.severity ?? rule?.meta.severity ?? 'warning';

    // Determine current state for cycling
    const currentState: Severity | 'off' = isEnabled ? currentSeverity : 'off';
    const nextState = getNextSeverity(currentState);

    if (nextState === 'off') {
      setRuleEnabled(ruleId, false);
    } else {
      setRuleEnabled(ruleId, true);
      setRuleSeverity(ruleId, nextState);
    }
  };

  const getRuleState = (rule: Rule): { isEnabled: boolean; severity: Severity | 'off' } => {
    const ruleConfig = config.rules[rule.meta.rule_id];
    const isEnabled = ruleConfig?.enabled ?? rule.meta.enabled_by_default;
    const severity = ruleConfig?.severity ?? rule.meta.severity;

    // If group is disabled, show as off
    if (!isGroupEnabled) {
      return { isEnabled: false, severity: 'off' };
    }

    return {
      isEnabled,
      severity: isEnabled ? severity : 'off'
    };
  };

  return (
    <details className="group-section" open>
      <summary className="group-header">
        <div className="group-toggle">
          <input
            type="checkbox"
            checked={isGroupEnabled}
            onChange={handleGroupToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="group-info">
          <span className="group-label">{group.label}</span>
          <span className="group-count">
            {enabledCount}/{rules.length} rules
          </span>
        </div>
        <span className="group-description">{group.description}</span>
      </summary>
      <div className="group-rules">
        {rules.map((rule) => {
          const state = getRuleState(rule);
          return (
            <RuleItem
              key={rule.meta.rule_id}
              rule={rule}
              isEnabled={state.isEnabled && isGroupEnabled}
              currentSeverity={state.severity}
              onToggle={() => handleRuleToggle(rule.meta.rule_id)}
              onCycleSeverity={() => handleSeverityCycle(rule.meta.rule_id)}
            />
          );
        })}
      </div>
    </details>
  );
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const allRules = getAllRules();
  const config = useAppStore((state) => state.config);

  // Group rules by their group
  const rulesByGroup = RULE_GROUPS.map((group) => ({
    group,
    rules: allRules.filter((rule) => rule.meta.group === group.id),
  })).filter(({ rules }) => rules.length > 0);

  // Also include any rules in groups not in RULE_GROUPS (like 'style')
  const knownGroupIds = new Set(RULE_GROUPS.map((g) => g.id));
  const otherRules = allRules.filter((rule) => !knownGroupIds.has(rule.meta.group as RuleGroup));

  // Calculate total enabled rules
  const totalRules = allRules.length;
  const enabledRules = allRules.filter((rule) => {
    const groupEnabled = config.groups[rule.meta.group as RuleGroup]?.enabled ?? true;
    if (!groupEnabled) return false;
    const ruleConfig = config.rules[rule.meta.rule_id];
    return ruleConfig?.enabled ?? rule.meta.enabled_by_default;
  }).length;

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Rule Settings</h2>
          <div className="settings-summary">
            {enabledRules}/{totalRules} rules enabled
          </div>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">
            &times;
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-help">
            <p>
              <strong>Group toggle:</strong> Enable/disable all rules in a group
            </p>
            <p>
              <strong>Severity button:</strong> Click to cycle through off &rarr; info &rarr; warning &rarr; error
            </p>
          </div>

          {rulesByGroup.map(({ group, rules }) => (
            <GroupSection
              key={group.id}
              group={group}
              rules={rules}
            />
          ))}

          {otherRules.length > 0 && (
            <GroupSection
              group={{ id: 'modern' as RuleGroup, label: 'Other', description: 'Other rules' }}
              rules={otherRules}
            />
          )}
        </div>
      </div>
    </div>
  );
}
