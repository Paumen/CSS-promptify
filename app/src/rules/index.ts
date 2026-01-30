/**
 * Rules Module
 * Contains all CSS analysis rules
 */

import type { Rule } from '../types';

// Import rules
import { noTabsRule } from './format/no-tabs';
import { indent2SpacesRule } from './format/indent-2-spaces';
import { multipleDeclarationsPerLineRule } from './format/multiple-declarations-per-line';
import { zeroUnitsRule } from './tokens/zero-units';
import { shortenHexColorsRule } from './tokens/shorten-hex-colors';

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
registerRule(noTabsRule);
registerRule(indent2SpacesRule);
registerRule(multipleDeclarationsPerLineRule);
registerRule(zeroUnitsRule);
registerRule(shortenHexColorsRule);

// Re-export utilities
export * from './utils';
