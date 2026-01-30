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
import { sortPropertiesRule } from './format/sort-properties';
import { oneSelectorPerLineRule } from './format/one-selector-per-line';

// Import token rules
import { zeroUnitsRule } from './tokens/zero-units';
import { shortenHexColorsRule } from './tokens/shorten-hex-colors';
import { removeTrailingZerosRule } from './tokens/remove-trailing-zeros';

// Import consolidation rules
import { shorthandMarginPaddingRule } from './consolidation/shorthand-margin-padding';
import { deduplicateLastWinsRule } from './consolidation/deduplicate-last-wins';

// Import safety rules
import { invalidSyntaxRule } from './safety/invalid-syntax';
import { unrecognizedPropertyRule } from './safety/unrecognized-property';
import { misspelledPropertyRule } from './safety/misspelled-property';
import { typoSuspiciousUnitsRule } from './safety/typo-suspicious-units';

// Import style rules
import { importantUsedRule } from './style/important-used';

// Import education/layout rules
import { flexPropertiesRequireFlexRule } from './education/flex-properties-require-flex';
import { gridPropertiesRequireGridRule } from './education/grid-properties-require-grid';

// Import modern rules
import { preferHexColorsRule } from './modern/prefer-hex-colors';

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
registerRule(sortPropertiesRule);
registerRule(oneSelectorPerLineRule);

// Token rules
registerRule(zeroUnitsRule);
registerRule(shortenHexColorsRule);
registerRule(removeTrailingZerosRule);

// Consolidation rules
registerRule(shorthandMarginPaddingRule);
registerRule(deduplicateLastWinsRule);

// Safety rules
registerRule(invalidSyntaxRule);
registerRule(unrecognizedPropertyRule);
registerRule(misspelledPropertyRule);
registerRule(typoSuspiciousUnitsRule);

// Style rules
registerRule(importantUsedRule);

// Education/layout rules
registerRule(flexPropertiesRequireFlexRule);
registerRule(gridPropertiesRequireGridRule);

// Modern rules
registerRule(preferHexColorsRule);

// Re-export utilities
export * from './utils';

// Re-export parse error helper
export { createParseErrorIssues } from './safety/invalid-syntax';
