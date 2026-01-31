import { useAppStore } from '../state';
import { getAllRules } from '../rules';
import type { Rule, RuleGroup, Severity } from '../types';
import styles from './SettingsPanel.module.css';

// All rule groups in display order
const RULE_GROUPS: { id: RuleGroup; label: string; description: string }[] = [
  { id: 'safety', label: 'Safety', description: 'Syntax validation and error detection' },
  { id: 'format', label: 'Format', description: 'LLM-friendly formatting rules' },
  { id: 'tokens', label: 'Tokens', description: 'Token optimization and simplification' },
  { id: 'consolidation', label: 'Consolidation', description: 'CSS deduplication and merging' },
  { id: 'modern', label: 'Modern', description: 'Modern CSS best practices' },
  { id: 'education', label: 'Education', description: 'Educational warnings about CSS usage' },
];

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
  const variantClass = {
    off: styles.severityBtnOff,
    info: styles.severityBtnInfo,
    warning: styles.severityBtnWarning,
    error: styles.severityBtnError,
  }[severity];

  return (
    <button
      className={`${styles.severityBtn} ${variantClass}`}
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
  const ruleName = rule.meta.rule_id.split('/').pop() || rule.meta.rule_id;

  return (
    <div className={`${styles.ruleItem} ${!isEnabled ? styles.ruleDisabled : ''}`}>
      <div className={styles.ruleMain}>
        <label className={styles.ruleToggle}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={onToggle}
          />
          <span className={styles.ruleName}>{ruleName}</span>
        </label>
        <SeverityButton
          severity={currentSeverity}
          onClick={onCycleSeverity}
          title={`Click to cycle: off -> info -> warning -> error (current: ${currentSeverity})`}
        />
      </div>
      <div className={styles.ruleMeta}>
        <span className={styles.ruleFixability}>{rule.meta.fixability}</span>
        <span className={styles.ruleApplies}>{rule.meta.applies_to}</span>
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

    if (!isGroupEnabled) {
      return { isEnabled: false, severity: 'off' };
    }

    return {
      isEnabled,
      severity: isEnabled ? severity : 'off'
    };
  };

  return (
    <details className={styles.groupSection} open>
      <summary className={styles.groupHeader}>
        <div className={styles.groupToggle}>
          <input
            type="checkbox"
            checked={isGroupEnabled}
            onChange={handleGroupToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className={styles.groupInfo}>
          <span className={styles.groupLabel}>{group.label}</span>
          <span className={styles.groupCount}>
            {enabledCount}/{rules.length} rules
          </span>
        </div>
        <span className={styles.groupDescription}>{group.description}</span>
      </summary>
      <div className={styles.groupRules}>
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

  const rulesByGroup = RULE_GROUPS.map((group) => ({
    group,
    rules: allRules.filter((rule) => rule.meta.group === group.id),
  })).filter(({ rules }) => rules.length > 0);

  const knownGroupIds = new Set(RULE_GROUPS.map((g) => g.id));
  const otherRules = allRules.filter((rule) => !knownGroupIds.has(rule.meta.group as RuleGroup));

  const totalRules = allRules.length;
  const enabledRules = allRules.filter((rule) => {
    const groupEnabled = config.groups[rule.meta.group as RuleGroup]?.enabled ?? true;
    if (!groupEnabled) return false;
    const ruleConfig = config.rules[rule.meta.rule_id];
    return ruleConfig?.enabled ?? rule.meta.enabled_by_default;
  }).length;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Rule Settings</h2>
          <div className={styles.summary}>
            {enabledRules}/{totalRules} rules enabled
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.help}>
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
