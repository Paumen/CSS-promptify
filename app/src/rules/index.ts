/**
 * Rules Module
 * Contains all CSS analysis rules
 */

import type { Rule } from '../types';

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

// Rules will be imported and registered here as they are implemented
// import { noTabsRule } from './format/no-tabs';
// registerRule(noTabsRule);
