/**
 * Rule: consolidate/deduplicate-last-wins
 * Removes duplicate properties in the same block, keeping the last one
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { csstree } from '../../parser';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

interface DeclarationInfo {
  property: string;
  value: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  index: number;
}

export const deduplicateLastWinsRule: Rule = {
  meta: {
    rule_id: 'consolidate/deduplicate-last-wins',
    group: 'consolidation',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'declaration blocks with duplicate properties',
    autofix_notes: 'Remove earlier declarations, keeping only the last one (CSS last-wins semantics)',
  },

  run(ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const lines = source.split('\n');

    csstree.walk(ast as csstree.CssNode, {
      visit: 'Block',
      enter(blockNode: csstree.CssNode) {
        const block = blockNode as csstree.Block;
        if (!block.children) return;

        // Collect all declarations with their positions
        const declarations: DeclarationInfo[] = [];
        let index = 0;

        block.children.forEach((child) => {
          if (child.type === 'Declaration' && child.loc) {
            const decl = child as csstree.Declaration;
            // css-tree uses 1-based lines and columns
            declarations.push({
              property: decl.property.toLowerCase(),
              value: csstree.generate(decl.value),
              startLine: child.loc.start.line,
              startColumn: child.loc.start.column,
              endLine: child.loc.end.line,
              endColumn: child.loc.end.column,
              index: index++,
            });
          }
        });

        // Group by property name
        const byProperty = new Map<string, DeclarationInfo[]>();
        for (const decl of declarations) {
          const existing = byProperty.get(decl.property) || [];
          existing.push(decl);
          byProperty.set(decl.property, existing);
        }

        // Find properties with duplicates
        for (const [property, decls] of byProperty) {
          if (decls.length > 1) {
            // All but the last are duplicates to remove
            const duplicates = decls.slice(0, -1);
            const lastDecl = decls[decls.length - 1];

            for (const dup of duplicates) {
              // Check if the line contains ONLY this declaration (considering whitespace)
              const lineContent = lines[dup.startLine - 1] || '';
              const lineBeforeDecl = lineContent.substring(0, dup.startColumn - 1).trim();
              const lineAfterDecl = lineContent.substring(dup.endColumn - 1).trim();
              const isOnlyThingOnLine = lineBeforeDecl === '' && (lineAfterDecl === '' || lineAfterDecl === ';');

              let location;
              let replacement = '';

              if (isOnlyThingOnLine && dup.startLine === dup.endLine) {
                // Remove from start of line to start of next line (entire line including newline)
                location = rangeFromCoords(
                  dup.startLine,
                  1,
                  dup.startLine + 1,
                  1
                );
              } else {
                // Declaration shares line with other content, just remove the declaration
                location = rangeFromCoords(
                  dup.startLine,
                  dup.startColumn,
                  dup.endLine,
                  dup.endColumn
                );
              }

              issues.push(
                createSafeIssue({
                  ruleId: 'consolidate/deduplicate-last-wins',
                  group: 'consolidation',
                  severity: 'warning',
                  message: `Duplicate '${property}' will be overridden by later value`,
                  location,
                  logic: {
                    what: `Found duplicate '${property}' with value '${dup.value}'`,
                    why: `CSS uses last-wins semantics; this value is overridden by '${lastDecl.value}'`,
                    when_safe: 'Safe because CSS already ignores this declaration',
                  },
                  preview: '', // Empty string = remove
                  patches: [createPatch(location, replacement)],
                  commentText: `consolidate/deduplicate-last-wins: removed earlier overridden value ${dup.value}`,
                })
              );
            }
          }
        }
      },
    });

    return issues;
  },
};
