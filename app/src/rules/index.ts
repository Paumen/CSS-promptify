/**
 * Rules Module
 * Contains all CSS analysis rules
 */

import type { Rule } from '../types';

// Import format rules
import { noTabsRule } from './format/no-tabs';
import { indent2SpacesRule } from './format/indent-2-spaces';
import { multipleDeclarationsPerLineRule } from './format/multiple-declarations-per-line';
import { normalizeSpacesRule } from './format/normalize-spaces';
import { singlePropSingleLineRule } from './format/single-prop-single-line';

// Import token rules
import { zeroUnitsRule } from './tokens/zero-units';
import { shortenHexColorsRule } from './tokens/shorten-hex-colors';
import { removeTrailingZerosRule } from './tokens/remove-trailing-zeros';

// Import consolidation rules
import { shorthandMarginPaddingRule } from './consolidation/shorthand-margin-padding';
import { deduplicateLastWinsRule } from './consolidation/deduplicate-last-wins';

// Rule registry
const rules: Map<string, Rule> = new Map();

/**
 * Register a rule
 */
export function registerRule(rule: Rule): void {
  rules.set(rule.meta.rule_id, rule);
}

/**
 * Get all registered rules
 */
export function getAllRules(): Rule[] {
  return Array.from(rules.values());
}

/**
 * Get a rule by ID
 */
export function getRule(ruleId: string): Rule | undefined {
  return rules.get(ruleId);
}

/**
 * Get rules by group
 */
export function getRulesByGroup(group: string): Rule[] {
  return getAllRules().filter((rule) => rule.meta.group === group);
}

// Register all rules
// Format rules
registerRule(noTabsRule);
registerRule(indent2SpacesRule);
registerRule(multipleDeclarationsPerLineRule);
registerRule(normalizeSpacesRule);
registerRule(singlePropSingleLineRule);

// Token rules
registerRule(zeroUnitsRule);
registerRule(shortenHexColorsRule);
registerRule(removeTrailingZerosRule);

// Consolidation rules
registerRule(shorthandMarginPaddingRule);
registerRule(deduplicateLastWinsRule);

// Re-export utilities
export * from './utils';
