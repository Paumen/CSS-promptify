/**
 * Rule: format/single-prop-single-line
 * Suggests keeping single-property rules on one line for token efficiency
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { csstree } from '../../parser';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

export const singlePropSingleLineRule: Rule = {
  meta: {
    rule_id: 'format/single-prop-single-line',
    group: 'format',
    severity: 'info',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'rule blocks with exactly one declaration that span multiple lines',
    autofix_notes: 'Collapse to single line: .selector { property: value; }',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    csstree.walk(ast as csstree.CssNode, {
      visit: 'Rule',
      enter(ruleNode: csstree.CssNode) {
        const rule = ruleNode as csstree.Rule;
        if (!rule.block || !rule.loc || !rule.prelude) return;

        const block = rule.block as csstree.Block;
        if (!block.children) return;

        // Count declarations
        const declarations: csstree.Declaration[] = [];
        block.children.forEach((child) => {
          if (child.type === 'Declaration') {
            declarations.push(child as csstree.Declaration);
          }
        });

        // Only process if exactly one declaration
        if (declarations.length !== 1) return;

        const decl = declarations[0];
        if (!decl.loc) return;

        // Check if rule spans multiple lines
        const startLine = rule.loc.start.line;
        const endLine = rule.loc.end.line;

        if (endLine > startLine) {
          // This is a multi-line single-property rule - suggest collapsing
          const selector = csstree.generate(rule.prelude);
          const property = decl.property;
          const value = csstree.generate(decl.value);

          const collapsed = `${selector} { ${property}: ${value}; }`;

          // css-tree uses 1-based lines and columns
          const location = rangeFromCoords(
            startLine,
            rule.loc.start.column,
            endLine,
            rule.loc.end.column
          );

          issues.push(
            createSafeIssue({
              ruleId: 'format/single-prop-single-line',
              group: 'format',
              severity: 'info',
              message: 'Single-property rule can be collapsed to one line',
              location,
              logic: {
                what: 'Found multi-line rule with only one property',
                why: 'Single-property rules on one line save tokens and improve scannability',
                when_safe: 'Always safe - only affects formatting, not behavior',
              },
              preview: collapsed,
              patches: [createPatch(location, collapsed)],
              commentText: 'format/single-prop-single-line: single property kept on one line',
            })
          );
        }
      },
    });

    return issues;
  },
};
