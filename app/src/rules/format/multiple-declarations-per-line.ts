/**
 * Rule: format/multiple-declarations-per-line
 * Detects when multiple CSS declarations are on the same line
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { csstree } from '../../parser';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

interface Declaration {
  property: string;
  value: string;
  line: number;
  startColumn: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

export const multipleDeclarationsPerLineRule: Rule = {
  meta: {
    rule_id: 'format/multiple-declarations-per-line',
    group: 'format',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'declaration blocks with multiple declarations on the same line',
    autofix_notes: 'Split declarations to one per line with proper indentation',
  },

  run(ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const lines = source.split('\n');

    // Walk through all declaration blocks
    csstree.walk(ast as csstree.CssNode, {
      visit: 'Block',
      enter(blockNode: csstree.CssNode) {
        const block = blockNode as csstree.Block;
        if (!block.children || !block.loc) return;

        // Collect all declarations in this block
        const declarations: Declaration[] = [];

        block.children.forEach((child) => {
          if (child.type === 'Declaration' && child.loc) {
            const decl = child as csstree.Declaration;
            declarations.push({
              property: decl.property,
              value: csstree.generate(decl.value),
              line: child.loc.start.line,
              startColumn: child.loc.start.column + 1, // 1-based
              endColumn: child.loc.end.column + 1,
              startOffset: child.loc.start.offset,
              endOffset: child.loc.end.offset,
            });
          }
        });

        // Group declarations by line
        const byLine = new Map<number, Declaration[]>();
        for (const decl of declarations) {
          const existing = byLine.get(decl.line) || [];
          existing.push(decl);
          byLine.set(decl.line, existing);
        }

        // Find lines with multiple declarations
        for (const [lineNum, decls] of byLine) {
          if (decls.length > 1) {
            // Determine the base indentation
            const lineContent = lines[lineNum - 1];
            const indentMatch = lineContent.match(/^(\s*)/);
            const existingIndent = indentMatch ? indentMatch[1] : '';

            // Use 2-space indent, or preserve existing if it's reasonable
            const baseIndent = existingIndent.includes('\t')
              ? '  '
              : (existingIndent.length > 0 ? existingIndent : '  ');

            // Build the replacement: each declaration on its own line
            const replacement = decls
              .map((d, i) => {
                const line = `${baseIndent}${d.property}: ${d.value};`;
                return i === 0 ? line : `\n${line}`;
              })
              .join('');

            // Find the range covering all declarations on this line
            const firstDecl = decls[0];
            const lastDecl = decls[decls.length - 1];

            // Get the full line range from first decl start to last decl end
            const location = rangeFromCoords(
              lineNum,
              firstDecl.startColumn,
              lineNum,
              lastDecl.endColumn + 1 // Include semicolon
            );

            issues.push(
              createSafeIssue({
                ruleId: 'format/multiple-declarations-per-line',
                group: 'format',
                severity: 'warning',
                message: `${decls.length} declarations on one line, split for clarity`,
                location,
                logic: {
                  what: `Found ${decls.length} declarations on line ${lineNum}`,
                  why: 'One declaration per line improves readability and makes diffs cleaner',
                  when_safe: 'Always safe - only affects whitespace and line breaks',
                },
                preview: replacement,
                patches: [createPatch(location, replacement)],
                commentText: 'format/multiple-declarations-per-line: split declarations',
              })
            );
          }
        }
      },
    });

    return issues;
  },
};
