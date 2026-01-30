/**
 * Rule: format/one-selector-per-line
 * Put each comma-separated selector on its own line
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createSafeIssue, cssTreeLocToRange, createPatch } from '../utils';
import { walk, csstree } from '../../parser';

export const oneSelectorPerLineRule: Rule = {
  meta: {
    rule_id: 'format/one-selector-per-line',
    group: 'format',
    severity: 'info',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'CSS rules with multiple comma-separated selectors',
    autofix_notes: 'Split selectors onto separate lines',
  },

  run(ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    walk(ast, (node) => {
      if (node.type === 'Rule' && node.prelude && node.loc) {
        const prelude = node.prelude as CSSNode;

        // Check if this is a SelectorList with multiple selectors
        if (prelude.type === 'SelectorList' && prelude.children) {
          const selectors = prelude.children as CSSNode[];

          // Only flag if there are multiple selectors
          if (selectors.length < 2) {
            return;
          }

          // Generate the selector text and check if they're on the same line
          const preludeLoc = prelude.loc;
          if (!preludeLoc) return;

          // Get the original selector text
          const startOffset = preludeLoc.start.offset;
          const endOffset = preludeLoc.end.offset;
          const originalText = source.slice(startOffset, endOffset);

          // Check if all selectors are on the same line (contains comma but no newlines between selectors)
          const hasNewlines = originalText.includes('\n');
          const commaCount = (originalText.match(/,/g) || []).length;

          // If there are already newlines after each comma, it's likely already formatted
          if (hasNewlines) {
            // Count newlines vs commas - if roughly equal, probably already formatted
            const newlineCount = (originalText.match(/\n/g) || []).length;
            if (newlineCount >= commaCount) {
              return;
            }
          }

          // Generate selectors each on their own line
          const selectorTexts: string[] = [];
          for (const selector of selectors) {
            const selectorText = csstree.generate(selector as csstree.CssNode);
            selectorTexts.push(selectorText.trim());
          }

          const fixedText = selectorTexts.join(',\n');

          issues.push(
            createSafeIssue({
              ruleId: 'format/one-selector-per-line',
              group: 'format',
              severity: 'info',
              message: `Multiple selectors on same line (${selectors.length} selectors)`,
              location: cssTreeLocToRange(preludeLoc),
              logic: {
                what: `Found ${selectors.length} comma-separated selectors not each on their own line`,
                why: 'One selector per line improves readability and makes diffs cleaner',
                when_safe: 'Always safe - formatting only, does not change selector specificity or matching',
              },
              preview: fixedText,
              patches: [createPatch(cssTreeLocToRange(preludeLoc), fixedText)],
              commentText: 'format/one-selector-per-line: split selectors to separate lines',
            })
          );
        }
      }
    });

    return issues;
  },
};
