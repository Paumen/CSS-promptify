/**
 * Rule: format/sort-properties
 * Deterministic property ordering within blocks
 * Supports grouped (default) and alphabetical modes
 */

import type { Rule, Issue, CSSNode, SessionConfig, Range } from '../../types';
import { createSafeIssue, createPatch } from '../utils';
import { walk } from '../../parser';

// Property sort order for grouped mode (from PROPERTY_SORT_ORDER.md)
const GROUPED_ORDER: string[] = [
  // Group 1: Content & Generation
  'content', 'quotes', 'counter-reset', 'counter-increment', 'counter-set',

  // Group 2: Positioning
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
  'inset-inline', 'inset-inline-start', 'inset-inline-end',

  // Group 3: Display & Box Model
  'display', 'visibility', 'opacity', 'box-sizing',
  'overflow', 'overflow-x', 'overflow-y', 'overflow-block', 'overflow-inline',
  'clip', 'clip-path',

  // Group 4: Flexbox
  'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
  'flex-direction', 'flex-wrap', 'flex-flow', 'order',

  // Group 5: Grid
  'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow',
  'grid-area', 'grid-row', 'grid-row-start', 'grid-row-end',
  'grid-column', 'grid-column-start', 'grid-column-end',

  // Group 6: Alignment (Flex/Grid)
  'place-content', 'place-items', 'place-self',
  'align-content', 'align-items', 'align-self',
  'justify-content', 'justify-items', 'justify-self',
  'gap', 'row-gap', 'column-gap',

  // Group 7: Dimensions
  'width', 'min-width', 'max-width',
  'height', 'min-height', 'max-height',
  'inline-size', 'min-inline-size', 'max-inline-size',
  'block-size', 'min-block-size', 'max-block-size',
  'aspect-ratio',

  // Group 8: Margin
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',

  // Group 9: Padding
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',

  // Group 10: Border
  'border', 'border-width', 'border-style', 'border-color',
  'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
  'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
  'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
  'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
  'border-block', 'border-block-start', 'border-block-end',
  'border-inline', 'border-inline-start', 'border-inline-end',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-right-radius', 'border-bottom-left-radius',
  'border-start-start-radius', 'border-start-end-radius',
  'border-end-start-radius', 'border-end-end-radius',
  'border-image', 'border-image-source', 'border-image-slice',
  'border-image-width', 'border-image-outset', 'border-image-repeat',

  // Group 11: Background
  'background', 'background-color', 'background-image', 'background-repeat',
  'background-position', 'background-position-x', 'background-position-y',
  'background-size', 'background-attachment', 'background-origin',
  'background-clip', 'background-blend-mode',

  // Group 12: Typography
  'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'font-variant', 'font-stretch', 'font-size-adjust',
  'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-align-last',
  'text-decoration', 'text-decoration-line', 'text-decoration-style',
  'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset',
  'text-transform', 'text-indent', 'text-shadow', 'text-overflow', 'text-wrap',
  'white-space', 'word-break', 'word-wrap', 'overflow-wrap', 'hyphens',
  'vertical-align',

  // Group 13: Color
  'color', 'accent-color', 'caret-color', 'color-scheme',

  // Group 14: List
  'list-style', 'list-style-type', 'list-style-position', 'list-style-image',

  // Group 15: Table
  'table-layout', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',

  // Group 16: Transform
  'transform', 'transform-origin', 'transform-style',
  'perspective', 'perspective-origin', 'backface-visibility',

  // Group 17: Transition & Animation
  'transition', 'transition-property', 'transition-duration',
  'transition-timing-function', 'transition-delay',
  'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
  'animation-delay', 'animation-iteration-count', 'animation-direction',
  'animation-fill-mode', 'animation-play-state',

  // Group 18: Interaction
  'cursor', 'pointer-events', 'touch-action', 'user-select', 'resize',
  'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align',
  'scroll-margin', 'scroll-padding',

  // Group 19: Container Queries
  'container', 'container-name', 'container-type',

  // Group 20: Other / Misc
  'appearance', 'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'box-shadow', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation',
  'will-change', 'contain', 'object-fit', 'object-position', 'image-rendering',
];

// Create index map for fast lookup
const groupedOrderIndex = new Map<string, number>();
GROUPED_ORDER.forEach((prop, index) => {
  groupedOrderIndex.set(prop, index);
});

interface Declaration {
  property: string;
  value: string;
  important: boolean;
  originalText: string;
  loc: { start: { line: number; column: number; offset: number }; end: { line: number; column: number; offset: number } };
}

function getPropertySortIndex(property: string, mode: 'grouped' | 'alphabetical'): number | string {
  const normalizedProp = property.toLowerCase();

  // Custom properties always go last
  if (normalizedProp.startsWith('--')) {
    return mode === 'alphabetical' ? `zzz${normalizedProp}` : 99999;
  }

  if (mode === 'alphabetical') {
    return normalizedProp;
  }

  // Grouped mode
  const index = groupedOrderIndex.get(normalizedProp);
  if (index !== undefined) {
    return index;
  }

  // Unknown properties go to the end of Group 20, sorted alphabetically
  return 9000 + normalizedProp.charCodeAt(0);
}

function sortDeclarations(declarations: Declaration[], mode: 'grouped' | 'alphabetical'): Declaration[] {
  return [...declarations].sort((a, b) => {
    const aIndex = getPropertySortIndex(a.property, mode);
    const bIndex = getPropertySortIndex(b.property, mode);

    if (typeof aIndex === 'string' && typeof bIndex === 'string') {
      return aIndex.localeCompare(bIndex);
    }
    if (typeof aIndex === 'number' && typeof bIndex === 'number') {
      return aIndex - bIndex;
    }
    // Numbers before strings (standard props before custom)
    return typeof aIndex === 'number' ? -1 : 1;
  });
}

function areDeclarationsSorted(declarations: Declaration[], mode: 'grouped' | 'alphabetical'): boolean {
  const sorted = sortDeclarations(declarations, mode);
  return declarations.every((decl, i) => decl.property === sorted[i].property);
}

export const sortPropertiesRule: Rule = {
  meta: {
    rule_id: 'format/sort-properties',
    group: 'format',
    severity: 'info',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'all CSS rule blocks',
    params: {
      mode: 'grouped', // 'grouped' | 'alphabetical'
      keepCustomPropsFirst: false,
    },
    autofix_notes: 'Reorder properties within each rule block according to the configured sort order',
  },

  run(ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const mode = 'grouped'; // Default mode; could be made configurable via config

    walk(ast, (node) => {
      if (node.type === 'Block' && node.children) {
        const declarations: Declaration[] = [];
        let blockStart: { line: number; column: number; offset: number } | null = null;
        let blockEnd: { line: number; column: number; offset: number } | null = null;

        // Collect all declarations in this block
        for (const child of node.children as CSSNode[]) {
          if (child.type === 'Declaration' && child.loc) {
            const property = String(child.property || '');
            const important = Boolean(child.important);

            // Get the original text from source
            const startOffset = child.loc.start.offset;
            const endOffset = child.loc.end.offset;
            const originalText = source.slice(startOffset, endOffset);

            // Reconstruct value from the original text
            const colonIndex = originalText.indexOf(':');
            const value = colonIndex >= 0 ? originalText.slice(colonIndex + 1).trim() : '';

            declarations.push({
              property,
              value,
              important,
              originalText,
              loc: child.loc,
            });

            // Track block bounds
            if (!blockStart || child.loc.start.offset < blockStart.offset) {
              blockStart = child.loc.start;
            }
            if (!blockEnd || child.loc.end.offset > blockEnd.offset) {
              blockEnd = child.loc.end;
            }
          }
        }

        // Skip if less than 2 declarations
        if (declarations.length < 2 || !blockStart || !blockEnd) {
          return;
        }

        // Check if already sorted
        if (areDeclarationsSorted(declarations, mode)) {
          return;
        }

        // Sort declarations by their position in source
        const sortedByPosition = [...declarations].sort(
          (a, b) => a.loc.start.offset - b.loc.start.offset
        );
        const firstDecl = sortedByPosition[0];
        const lastDecl = sortedByPosition[sortedByPosition.length - 1];

        // Sort declarations by property order
        const sorted = sortDeclarations(declarations, mode);

        // Find the indentation of the first declaration
        const lines = source.split('\n');
        const firstDeclLine = lines[firstDecl.loc.start.line - 1];
        const indentMatch = firstDeclLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '  ';

        // Generate sorted output - each declaration on its own line with proper indentation
        const sortedText = sorted
          .map((decl) => {
            // Normalize each declaration
            const importantStr = decl.important ? ' !important' : '';
            const cleanValue = decl.value.replace(/\s*!important\s*;?\s*$/, '').replace(/;$/, '');
            return `${indent}${decl.property}: ${cleanValue}${importantStr};`;
          })
          .join('\n');

        // Calculate the range from start of first declaration to end of last
        // css-tree uses 1-based lines and columns, same as our Range type
        const location: Range = {
          start: {
            line: firstDecl.loc.start.line,
            column: firstDecl.loc.start.column,
          },
          end: {
            line: lastDecl.loc.end.line,
            column: lastDecl.loc.end.column,
          },
        };

        issues.push(
          createSafeIssue({
            ruleId: 'format/sort-properties',
            group: 'format',
            severity: 'info',
            message: `Properties not in ${mode} order (${declarations.length} properties)`,
            location,
            logic: {
              what: `Found ${declarations.length} properties that are not in ${mode} sort order`,
              why: 'Consistent property ordering improves readability and makes CSS easier for LLMs to parse',
              when_safe: 'Always safe - property order within a block does not affect computed styles',
            },
            preview: sortedText,
            patches: [createPatch(location, sortedText)],
            commentText: `format/sort-properties: reordered to ${mode} order`,
          })
        );
      }
    });

    return issues;
  },
};
