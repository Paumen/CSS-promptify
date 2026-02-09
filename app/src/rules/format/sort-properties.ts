/**
 * Rule: format/sort-properties
 * Deterministic property ordering within blocks
 * Supports grouped (default) and alphabetical modes
 */

import type { Rule, Issue, CSSNode, SessionConfig, Range } from '../../types';
import { createSafeIssue, createPatch } from '../utils';
import { walk } from '../../parser';

// Property sort order for grouped mode (canonical order defined here)
const GROUPED_ORDER: string[] = [
    // Group 1: Cascade
  'all',                           'composes',

  // Group 2: Position
  'position',                      'inset',
  'inset-block',                   'inset-block-start',              'inset-block-end',
  'inset-inline',                  'inset-inline-start',             'inset-inline-end',

  'top',                           'right',                          'bottom',                        'left',

  'z-index',                       'float',                          'clear',

  'anchor-name',                   'anchor-scope',                   'anchor-center',
  'position-area',                 'position-anchor',                'position-try',                  'position-try-order',            'position-try-fallbacks',
  'position-visibility',

  // Group 3: Layout
  'box-sizing',                    'display',                        'visibility',

  'flex',                          'flex-grow',                      'flex-shrink',                   'flex-basis',
  'flex-flow',                     'flex-direction',                 'flex-wrap',                     '-webkit-box-orient',

  'grid',                          'grid-area',                      'grid-template',                 'grid-template-areas',
  'grid-template-rows',            'grid-template-columns',

  'grid-row',                      'grid-row-start',                 'grid-row-end',
  'grid-column',                   'grid-column-start',              'grid-column-end',
  'grid-auto-rows',                'grid-auto-columns',              'grid-auto-flow',

  'gap',                           'row-gap',                        'column-gap',
  'grid-gap',                      'grid-row-gap',                   'grid-column-gap',

  'place-content',                 'place-items',                    'place-self',
  'align-content',                 'align-items',                    'align-self',
  'justify-content',               'justify-items',                  'justify-self',

  'order',

  // Group 4: Size & Space
  'contain',
  'container',                     'container-name',                 'container-type',                'content-visibility',

  'inline-size',                   'min-inline-size',                'max-inline-size',
  'width',                         'min-width',                      'max-width',
  'block-size',                    'min-block-size',                 'max-block-size',
  'height',                        'min-height',                     'max-height',

  'aspect-ratio',

  'contain-intrinsic-size',        'contain-intrinsic-width',        'contain-intrinsic-height',
  'contain-intrinsic-inline-size', 'contain-intrinsic-block-size',

  'padding',
  'padding-block',                 'padding-block-start',            'padding-block-end',
  'padding-inline',                'padding-inline-start',           'padding-inline-end',
  'padding-top',                   'padding-right',                  'padding-bottom',                'padding-left',

  'margin',
  'margin-block',                  'margin-block-start',             'margin-block-end',
  'margin-inline',                 'margin-inline-start',            'margin-inline-end',
  'margin-top',                    'margin-right',                   'margin-bottom',                 'margin-left',

  // Group 5: Overflow & Scroll
  'overflow',                      'overflow-block',                 'overflow-inline',               'overflow-x',                    'overflow-y',
  'scrollbar-gutter',              '-webkit-overflow-scrolling',
  '-ms-overflow-x',                '-ms-overflow-y',                 '-ms-overflow-style',
  'text-overflow',                 'line-clamp',                     '-webkit-line-clamp',

  'overscroll-behavior',           'overscroll-behavior-block',      'overscroll-behavior-inline',    'overscroll-behavior-x',         'overscroll-behavior-y',

  'scroll-snap-type',              'scroll-snap-align',              'scroll-snap-stop',

  'scroll-padding',                'scroll-padding-block',           'scroll-padding-block-start',    'scroll-padding-block-end',
  'scroll-padding-inline',         'scroll-padding-inline-start',    'scroll-padding-inline-end',
  'scroll-padding-top',            'scroll-padding-right',           'scroll-padding-bottom',         'scroll-padding-left',

  'scroll-margin',                 'scroll-margin-block',            'scroll-margin-block-start',     'scroll-margin-block-end',
  'scroll-margin-inline',          'scroll-margin-inline-start',     'scroll-margin-inline-end',
  'scroll-margin-top',             'scroll-margin-right',            'scroll-margin-bottom',          'scroll-margin-left',

  'scrollbar-color',               'scrollbar-width',

  // Group 6: Font
  'font',                          'font-family',                    'font-size',                     'font-style',                    'font-weight',
  'font-stretch',                  'font-variation-settings',        'font-optical-sizing',           'font-size-adjust',              'font-feature-settings',
  'font-kerning',                  'font-variant',                   'font-variant-ligatures',        'font-variant-caps',             'font-variant-alternates',
  'font-variant-numeric',          'font-variant-east-asian',         'font-variant-position',

  '-webkit-font-smoothing',        '-moz-osx-font-smoothing',        'font-smooth',
  'font-synthesis',                'font-synthesis-weight',          'font-synthesis-style',          'font-synthesis-small-caps',

  'line-height',
  'vertical-align',                'alignment-baseline',             'baseline-shift',                'dominant-baseline',             

  'src',                           'font-display',                   'unicode-range',                 'size-adjust',
  'ascent-override',               'descent-override',               'line-gap-override',

  // Group 7: Text
  'base-palette',                  'override-colors',                'font-palette',

  'color',
  '-webkit-text-fill-color',       '-webkit-text-stroke',            '-webkit-text-stroke-width',     '-webkit-text-stroke-color',

  'text-align',                    'text-align-last',                'text-justify',                  'text-indent',                   'text-transform',
  'word-spacing',                  'letter-spacing',                 'hyphens',                       'hyphenate-character',           'line-break',
  'word-break',                    'text-wrap',                      'text-wrap-mode',                'text-wrap-style',
  'word-wrap',                     'overflow-wrap',                  'tab-size',                      'white-space',                   'white-space-collapse',

  'text-decoration',               'text-decoration-line',           'text-decoration-thickness',     'text-decoration-style',         'text-decoration-color',
  'text-decoration-skip-ink',      'text-underline-position',        'text-underline-offset',
  'text-emphasis',                 'text-emphasis-color',            'text-emphasis-style',           'text-emphasis-position',
  'text-shadow',

  'ruby-position',                 'ruby-align',

  'direction',                     'unicode-bidi',                   'writing-mode',                  'text-orientation',
  'text-combine-upright',

  // Group 8: UI
  'appearance',                    'accent-color',                   'pointer-events',                '-ms-touch-action',              'touch-action',
  'cursor',                        'caret-color',                    'zoom',
  'resize',                        'user-select',                    '-webkit-user-select',

  'nav-index',
  'nav-up',                        'nav-right',                      'nav-down',                      'nav-left',

  'outline',                       'outline-width',                  'outline-style',                 'outline-color',                 'outline-offset',

  'color-scheme',                  'forced-color-adjust',            'print-color-adjust',

  // Group 9: Content & Lists
  'content',                       'quotes',

  'list-style',                    'list-style-position',            'list-style-type',               'list-style-image',
  'counter-reset',                 'counter-set',                    'counter-increment',

  'table-layout',                  'empty-cells',                    'caption-side',
  'border-spacing',                'border-collapse',

  // Group 10: Media
  'object-fit',                    'object-position',                '-ms-interpolation-mode',
  'image-orientation',             'image-rendering',                'image-resolution',

  // Group 11: Background & Border
  'background',                    'background-color',               'background-image',

  String.raw`-ms-filter:\'progid:DXImageTransform.Microsoft.gradient`,
  'filter:progid:DXImageTransform.Microsoft.gradient',
  'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader',

  'background-repeat',             'background-attachment',          'background-position',           'background-position-x',         'background-position-y',
  'background-clip',               'background-origin',              'background-size',

  'border',                        'border-color',                   'border-style',                  'border-width',

  'border-block',                  'border-block-start',             'border-block-start-color',      'border-block-start-style',      'border-block-start-width',
  'border-block-end',              'border-block-end-color',         'border-block-end-style',        'border-block-end-width',

  'border-inline',                 'border-inline-start',            'border-inline-start-color',     'border-inline-start-style',     'border-inline-start-width',
  'border-inline-end',             'border-inline-end-color',        'border-inline-end-style',       'border-inline-end-width',

  'border-top',                    'border-top-color',               'border-top-style',              'border-top-width',
  'border-right',                  'border-right-color',             'border-right-style',            'border-right-width',
  'border-bottom',                 'border-bottom-color',            'border-bottom-style',           'border-bottom-width',
  'border-left',                   'border-left-color',              'border-left-style',             'border-left-width',

  'corner',
  'corner-block-start',            'corner-block-end',               'corner-inline-start',           'corner-inline-end',
  'corner-start-start',            'corner-start-end',               'corner-end-start',              'corner-end-end',
  'corner-top',                    'corner-right',                   'corner-bottom',                 'corner-left',
  'corner-top-left',               'corner-top-right',               'corner-bottom-right',           'corner-bottom-left',

  'border-radius',                 'border-start-start-radius',      'border-start-end-radius',       'border-end-start-radius',       'border-end-end-radius',
  'border-top-left-radius',        'border-top-right-radius',        'border-bottom-right-radius',    'border-bottom-left-radius',

  'corner-shape',                  'corner-block-start-shape',       'corner-block-end-shape',        'corner-inline-start-shape',     'corner-inline-end-shape',
  'corner-start-start-shape',      'corner-start-end-shape',         'corner-end-start-shape',        'corner-end-end-shape',
  'corner-top-shape',              'corner-right-shape',             'corner-bottom-shape',           'corner-left-shape',
  'corner-top-left-shape',         'corner-top-right-shape',         'corner-bottom-right-shape',     'corner-bottom-left-shape',

  'border-image',                  'border-image-source',            'border-image-slice',            'border-image-width',            'border-image-outset',
  'border-image-repeat',

  'box-shadow',

  // Group 12: Effects
  'background-blend-mode',         'isolation',                      'mix-blend-mode',

  'filter:progid:DXImageTransform.Microsoft.Alpha(Opacity',
  String.raw`-ms-filter:\'progid:DXImageTransform.Microsoft.Alpha`,

  'opacity',

  'filter',                        'backdrop-filter',

  'clip',                          'clip-path',                      'clip-rule',

  'mask',                          'mask-image',                     'mask-mode',                     'mask-repeat',
  'mask-position',                 'mask-clip',                      'mask-origin',                   'mask-size',
  'mask-composite',                'mask-type',

  'mask-border',                   'mask-border-source',             'mask-border-slice',             'mask-border-width',
  'mask-border-outset',            'mask-border-repeat',             'mask-border-mode',

  'shape-outside',                 'shape-image-threshold',          'shape-margin',

  // Group 13: SVG
  'text-anchor',

  'fill',                          'fill-rule',                      'fill-opacity',
  'stroke',                        'stroke-opacity',                 'stroke-width',                  'stroke-linecap',                'stroke-linejoin',
  'stroke-miterlimit',             'stroke-dasharray',               'stroke-dashoffset',

  'color-interpolation',           'color-interpolation-filters',
  'flood-color',                   'flood-opacity',                  'lighting-color',

  'marker',                        'marker-start',                   'marker-mid',                    'marker-end',
  'stop-color',                    'stop-opacity',

  'paint-order',                   'shape-rendering',                'text-rendering',

  // Group 14: Motion
  'transform',                     'transform-origin',               'transform-box',                 'transform-style',
  'rotate',                        'scale',                          'translate',                     'perspective',                   'perspective-origin',
  'backface-visibility',

  'transition',
  'transition-delay',              'transition-timing-function',     'transition-duration',           'transition-property',
  'view-transition-name',          'view-transition-class',

  'animation',                     'animation-name',                 'animation-duration',            'animation-timing-function',
  'animation-delay',               'animation-iteration-count',      'animation-direction',           'animation-fill-mode',
  'animation-play-state',          'animation-composition',

  'offset',                        'offset-position',                'offset-path',                   'offset-distance',
  'offset-rotate',                 'offset-anchor',

  'will-change',

  // Group 15: Fragmentation
  'break-before',                  'break-after',                    'break-inside',
  'widows',                        'orphans',
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
