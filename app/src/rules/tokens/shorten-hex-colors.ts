/**
 * Rule: tokens/shorten-hex-colors
 * Shortens 6-digit hex colors to 3-digit when possible
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';
import { walk } from '../../parser';

/**
 * Check if a 2-digit hex can be shortened (e.g., "ff" -> "f")
 */
function canShorten(hex: string): boolean {
  return hex[0].toLowerCase() === hex[1].toLowerCase();
}

/**
 * Shorten a 2-digit hex to 1 digit
 */
function shorten(hex: string): string {
  return hex[0].toLowerCase();
}

export const shortenHexColorsRule: Rule = {
  meta: {
    rule_id: 'tokens/shorten-hex-colors',
    group: 'tokens',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: '6-digit hex colors that can be represented as 3-digit (#ffffff -> #fff)',
    autofix_notes: 'Only shorten when all three pairs can be shortened (e.g., #aabbcc -> #abc)',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    // Walk through declarations to find hex colors in VALUES only (not selectors)
    walk(ast, (node) => {
      // css-tree parses hex colors in values as Hash nodes
      if (node.type === 'Hash' && node.loc) {
        const hexValue = String(node.value || '');

        // Check if it's a 6-digit or 8-digit hex that can be shortened
        if (hexValue.length !== 6 && hexValue.length !== 8) {
          return;
        }

        const r = hexValue.slice(0, 2);
        const g = hexValue.slice(2, 4);
        const b = hexValue.slice(4, 6);
        const a = hexValue.length === 8 ? hexValue.slice(6, 8) : null;

        // Check if we can shorten (all pairs must be shortenable)
        const canShortenRGB = canShorten(r) && canShorten(g) && canShorten(b);
        const canShortenAlpha = !a || canShorten(a);

        if (canShortenRGB && canShortenAlpha) {
          let shortened = `#${shorten(r)}${shorten(g)}${shorten(b)}`;
          if (a) {
            shortened += shorten(a);
          }

          const fullMatch = `#${hexValue}`;

          // css-tree uses 1-based lines and columns
          const startLine = node.loc.start.line;
          const startCol = node.loc.start.column;
          const endLine = node.loc.end.line;
          const endCol = node.loc.end.column;

          const location = rangeFromCoords(startLine, startCol, endLine, endCol);

          issues.push(
            createSafeIssue({
              ruleId: 'tokens/shorten-hex-colors',
              group: 'tokens',
              severity: 'warning',
              message: `Hex color ${fullMatch} can be shortened to ${shortened}`,
              location,
              logic: {
                what: `Found ${fullMatch} which can be written as ${shortened}`,
                why: 'Shorter hex colors save tokens and are equally precise',
                when_safe: 'Safe when all RGB (and optional A) pairs have identical digits',
              },
              preview: shortened,
              patches: [createPatch(location, shortened)],
              commentText: `tokens/shorten-hex-colors: was ${fullMatch}`,
            })
          );
        }
      }
    });

    return issues;
  },
};
