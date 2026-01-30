/**
 * Rule: tokens/zero-units
 * Removes unnecessary units from zero values (e.g., 0px -> 0)
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  findAllMatches,
  rangeFromCoords,
  createPatch,
} from '../utils';

// Units where 0 can safely have the unit removed
const SAFE_UNITS = [
  'px', 'em', 'rem', 'ex', 'ch',
  'vw', 'vh', 'vmin', 'vmax', 'dvh', 'dvw', 'svh', 'svw', 'lvh', 'lvw',
  'cm', 'mm', 'in', 'pt', 'pc',
  '%',
];

// Pattern to match 0 followed by a unit
// Use (?![0-9a-zA-Z]) lookahead instead of \b to handle % correctly
const ZERO_UNIT_PATTERN = new RegExp(
  `(?<![0-9])0(${SAFE_UNITS.join('|')})(?![0-9a-zA-Z])`,
  'gi'
);

export const zeroUnitsRule: Rule = {
  meta: {
    rule_id: 'tokens/zero-units',
    group: 'tokens',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'zero values with units (0px, 0em, 0%, etc.)',
    autofix_notes: 'Remove unit from zero values. Exception: 0s, 0ms, 0deg, 0rad, 0turn are kept.',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const matches = findAllMatches(source, ZERO_UNIT_PATTERN);

    for (const match of matches) {
      const unit = match.match.slice(1); // Remove the '0' prefix
      const location = rangeFromCoords(
        match.line,
        match.column,
        match.line,
        match.column + match.match.length
      );

      issues.push(
        createSafeIssue({
          ruleId: 'tokens/zero-units',
          group: 'tokens',
          severity: 'warning',
          message: `Unnecessary unit '${unit}' on zero value`,
          location,
          logic: {
            what: `Found 0${unit} which can be simplified to 0`,
            why: 'Zero is zero regardless of unit, removing units saves tokens and improves clarity',
            when_safe: 'Safe for length/percentage units. Not applied to time (0s), angles (0deg), or flex (0fr)',
          },
          preview: '0',
          patches: [createPatch(location, '0')],
          commentText: `tokens/zero-units: was 0${unit}`,
        })
      );
    }

    return issues;
  },
};
