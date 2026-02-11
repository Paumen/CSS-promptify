/**
 * Rule: style/important-used
 * Detect !important declarations (awareness rule, no fix)
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createInfoIssue, findAllMatches, rangeFromCoords } from '../utils';

export const importantUsedRule: Rule = {
  meta: {
    rule_id: 'style/important-used',
    group: 'education',
    severity: 'info',
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'all CSS declarations using !important',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    // Find all !important occurrences
    const matches = findAllMatches(source, /!important/gi);

    for (const match of matches) {
      issues.push(
        createInfoIssue({
          ruleId: 'style/important-used',
          group: 'education',
          severity: 'info',
          message: 'Found !important declaration',
          location: rangeFromCoords(
            match.line,
            match.column,
            match.line,
            match.column + match.match.length
          ),
          logic: {
            what: 'Declaration uses !important to override cascade',
            why: 'Overusing !important makes CSS harder to maintain and debug. It breaks the natural cascade and can lead to specificity wars.',
            when_safe: 'No auto-fix available - review if !important is truly necessary',
          },
        })
      );
    }

    return issues;
  },
};
