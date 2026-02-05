/**
 * Rule: consolidate/shorthand-margin-padding
 * Consolidates margin/padding longhands into shorthand when all 4 sides are specified
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { csstree } from '../../parser';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

const LONGHAND_GROUPS = {
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
};

interface DeclarationInfo {
  property: string;
  value: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

/**
 * Build shorthand value from 4 values (top, right, bottom, left)
 * Optimizes: 4 same -> 1, top/bottom + left/right -> 2, etc.
 */
function buildShorthand(top: string, right: string, bottom: string, left: string): string {
  if (top === right && right === bottom && bottom === left) {
    return top; // All same: just one value
  }
  if (top === bottom && right === left) {
    return `${top} ${right}`; // vertical horizontal
  }
  if (right === left) {
    return `${top} ${right} ${bottom}`; // top horizontal bottom
  }
  return `${top} ${right} ${bottom} ${left}`; // all four
}

export const shorthandMarginPaddingRule: Rule = {
  meta: {
    rule_id: 'consolidate/shorthand-margin-padding',
    group: 'consolidation',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'declaration blocks with all 4 margin or padding longhands',
    autofix_notes: 'Replace longhands with shorthand (margin: top right bottom left)',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    csstree.walk(ast as csstree.CssNode, {
      visit: 'Block',
      enter(blockNode: csstree.CssNode) {
        const block = blockNode as csstree.Block;
        if (!block.children) return;

        // Collect all declarations by property
        const declarations = new Map<string, DeclarationInfo>();

        block.children.forEach((child) => {
          if (child.type === 'Declaration' && child.loc) {
            const decl = child as csstree.Declaration;
            // css-tree uses 1-based lines and columns
            declarations.set(decl.property.toLowerCase(), {
              property: decl.property,
              value: csstree.generate(decl.value),
              startLine: child.loc.start.line,
              startColumn: child.loc.start.column,
              endLine: child.loc.end.line,
              endColumn: child.loc.end.column,
              startOffset: child.loc.start.offset,
              endOffset: child.loc.end.offset,
            });
          }
        });

        // Check each group (margin, padding)
        for (const [shorthand, longhands] of Object.entries(LONGHAND_GROUPS)) {
          const found = longhands.map((prop) => declarations.get(prop));

          // Only proceed if all 4 longhands are present
          if (found.every((d) => d !== undefined)) {
            const [top, right, bottom, left] = found as DeclarationInfo[];

            // Build the shorthand value
            const shorthandValue = buildShorthand(
              top.value,
              right.value,
              bottom.value,
              left.value
            );

            // Sort declarations by their position in the source (by startOffset)
            const allDecls = [top, right, bottom, left].sort(
              (a, b) => a.startOffset - b.startOffset
            );
            const firstDecl = allDecls[0];
            const lastDecl = allDecls[allDecls.length - 1];

            // Create a single patch that replaces from start of first to end of last
            // This removes all 4 longhands and replaces with shorthand
            const location = rangeFromCoords(
              firstDecl.startLine,
              firstDecl.startColumn,
              lastDecl.endLine,
              lastDecl.endColumn
            );

            // Build the replacement: shorthand with same indentation as first declaration
            const shorthandDecl = `${shorthand}: ${shorthandValue};`;

            issues.push(
              createSafeIssue({
                ruleId: 'consolidate/shorthand-margin-padding',
                group: 'consolidation',
                severity: 'warning',
                message: `${shorthand} longhands can be consolidated to: ${shorthand}: ${shorthandValue}`,
                location,
                logic: {
                  what: `Found all 4 ${shorthand} longhands (top, right, bottom, left)`,
                  why: 'Shorthand is more concise and saves tokens',
                  when_safe: 'Safe when all 4 longhands are present in the same block',
                },
                preview: `${shorthand}: ${shorthandValue}`,
                patches: [createPatch(location, shorthandDecl)],
                commentText: `consolidate/shorthand-margin-padding: was ${shorthand}-top/right/bottom/left`,
              })
            );
          }
        }
      },
    });

    return issues;
  },
};
