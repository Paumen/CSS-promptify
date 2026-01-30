/**
 * Rule: format/no-tabs
 * Converts tabs to 2 spaces for consistent indentation
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  findAllMatches,
  rangeFromCoords,
  createPatch,
} from '../utils';

export const noTabsRule: Rule = {
  meta: {
    rule_id: 'format/no-tabs',
    group: 'format',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'all CSS content containing tab characters',
    autofix_notes: 'Replace each tab with 2 spaces',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const tabMatches = findAllMatches(source, /\t+/g);

    for (const match of tabMatches) {
      const tabCount = match.match.length;
      const replacement = '  '.repeat(tabCount); // 2 spaces per tab

      const location = rangeFromCoords(
        match.line,
        match.column,
        match.line,
        match.column + tabCount
      );

      issues.push(
        createSafeIssue({
          ruleId: 'format/no-tabs',
          group: 'format',
          severity: 'warning',
          message: `Found ${tabCount} tab${tabCount > 1 ? 's' : ''}, use spaces instead`,
          location,
          logic: {
            what: `Detected ${tabCount} tab character${tabCount > 1 ? 's' : ''}`,
            why: 'Tabs render inconsistently across editors and make CSS harder for LLMs to parse accurately',
            when_safe: 'Always safe - tabs and spaces are visually interchangeable for indentation',
          },
          preview: replacement,
          patches: [createPatch(location, replacement)],
          commentText: 'format/no-tabs: converted tabs to spaces',
        })
      );
    }

    return issues;
  },
};
