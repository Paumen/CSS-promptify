/**
 * Rule: safety/unrecognized-property
 * Info-only warning for unknown CSS properties (may be new/experimental)
 * MUST emit info only, never warning/error (per spec)
 * Excludes custom properties (--*)
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createInfoIssue, cssTreeLocToRange } from '../utils';
import { walk } from '../../parser';

// Standard CSS properties (comprehensive list)
// This includes modern CSS properties like container queries, logical properties, etc.
const KNOWN_PROPERTIES = new Set([
  // Content & Generation
  'content', 'quotes', 'counter-reset', 'counter-increment', 'counter-set',

  // Positioning
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
  'inset-inline', 'inset-inline-start', 'inset-inline-end',

  // Display & Box Model
  'display', 'visibility', 'opacity', 'box-sizing',
  'overflow', 'overflow-x', 'overflow-y', 'overflow-block', 'overflow-inline',
  'clip', 'clip-path',

  // Flexbox
  'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
  'flex-direction', 'flex-wrap', 'flex-flow', 'order',

  // Grid
  'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow',
  'grid-area', 'grid-row', 'grid-row-start', 'grid-row-end',
  'grid-column', 'grid-column-start', 'grid-column-end',

  // Alignment
  'place-content', 'place-items', 'place-self',
  'align-content', 'align-items', 'align-self',
  'justify-content', 'justify-items', 'justify-self',
  'gap', 'row-gap', 'column-gap',

  // Dimensions
  'width', 'min-width', 'max-width',
  'height', 'min-height', 'max-height',
  'inline-size', 'min-inline-size', 'max-inline-size',
  'block-size', 'min-block-size', 'max-block-size',
  'aspect-ratio',

  // Margin
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',

  // Padding
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',

  // Border
  'border', 'border-width', 'border-style', 'border-color',
  'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
  'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
  'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
  'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
  'border-block', 'border-block-start', 'border-block-end', 'border-block-width', 'border-block-style', 'border-block-color',
  'border-inline', 'border-inline-start', 'border-inline-end', 'border-inline-width', 'border-inline-style', 'border-inline-color',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-right-radius', 'border-bottom-left-radius',
  'border-start-start-radius', 'border-start-end-radius',
  'border-end-start-radius', 'border-end-end-radius',
  'border-image', 'border-image-source', 'border-image-slice',
  'border-image-width', 'border-image-outset', 'border-image-repeat',

  // Background
  'background', 'background-color', 'background-image', 'background-repeat',
  'background-position', 'background-position-x', 'background-position-y',
  'background-size', 'background-attachment', 'background-origin',
  'background-clip', 'background-blend-mode',

  // Typography
  'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'font-variant', 'font-stretch', 'font-size-adjust', 'font-synthesis',
  'font-kerning', 'font-optical-sizing', 'font-variation-settings',
  'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-align-last', 'text-justify',
  'text-decoration', 'text-decoration-line', 'text-decoration-style',
  'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset',
  'text-underline-position', 'text-transform', 'text-indent', 'text-shadow',
  'text-overflow', 'text-wrap', 'text-wrap-mode', 'text-wrap-style',
  'white-space', 'white-space-collapse', 'word-break', 'word-wrap',
  'overflow-wrap', 'hyphens', 'hyphenate-character', 'hyphenate-limit-chars',
  'vertical-align', 'direction', 'unicode-bidi', 'writing-mode',
  'text-orientation', 'text-combine-upright',

  // Color
  'color', 'accent-color', 'caret-color', 'color-scheme',
  'forced-color-adjust', 'print-color-adjust',

  // List
  'list-style', 'list-style-type', 'list-style-position', 'list-style-image',

  // Table
  'table-layout', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',

  // Transform
  'transform', 'transform-origin', 'transform-style', 'transform-box',
  'perspective', 'perspective-origin', 'backface-visibility',
  'rotate', 'scale', 'translate',

  // Transition & Animation
  'transition', 'transition-property', 'transition-duration',
  'transition-timing-function', 'transition-delay', 'transition-behavior',
  'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
  'animation-delay', 'animation-iteration-count', 'animation-direction',
  'animation-fill-mode', 'animation-play-state', 'animation-composition',
  'animation-timeline', 'animation-range', 'animation-range-start', 'animation-range-end',

  // Interaction
  'cursor', 'pointer-events', 'touch-action', 'user-select', 'resize',
  'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align', 'scroll-snap-stop',
  'scroll-margin', 'scroll-margin-top', 'scroll-margin-right', 'scroll-margin-bottom', 'scroll-margin-left',
  'scroll-margin-block', 'scroll-margin-block-start', 'scroll-margin-block-end',
  'scroll-margin-inline', 'scroll-margin-inline-start', 'scroll-margin-inline-end',
  'scroll-padding', 'scroll-padding-top', 'scroll-padding-right', 'scroll-padding-bottom', 'scroll-padding-left',
  'scroll-padding-block', 'scroll-padding-block-start', 'scroll-padding-block-end',
  'scroll-padding-inline', 'scroll-padding-inline-start', 'scroll-padding-inline-end',
  'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y',
  'overscroll-behavior-block', 'overscroll-behavior-inline',

  // Container Queries
  'container', 'container-name', 'container-type',

  // Other / Misc
  'appearance', 'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'box-shadow', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation',
  'will-change', 'contain', 'contain-intrinsic-size', 'contain-intrinsic-width', 'contain-intrinsic-height',
  'contain-intrinsic-block-size', 'contain-intrinsic-inline-size',
  'content-visibility',
  'object-fit', 'object-position', 'image-rendering', 'image-orientation',
  'shape-outside', 'shape-margin', 'shape-image-threshold',
  'float', 'clear', 'orphans', 'widows', 'page-break-before', 'page-break-after', 'page-break-inside',
  'break-before', 'break-after', 'break-inside', 'box-decoration-break',
  'columns', 'column-count', 'column-width', 'column-gap', 'column-rule',
  'column-rule-width', 'column-rule-style', 'column-rule-color',
  'column-span', 'column-fill',
  'all', 'initial', 'inherit', 'unset', 'revert', 'revert-layer',

  // Modern CSS functions/properties
  'mask', 'mask-image', 'mask-mode', 'mask-position', 'mask-size',
  'mask-repeat', 'mask-origin', 'mask-clip', 'mask-composite', 'mask-type',
  'offset', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor', 'offset-position',
  'view-transition-name',
  'anchor-name', 'position-anchor', 'position-visibility',
  'field-sizing',
  'ruby-position', 'ruby-align',
  'math-style', 'math-depth', 'math-shift',

  // Vendor prefixes commonly used
  '-webkit-appearance', '-moz-appearance',
  '-webkit-font-smoothing', '-moz-osx-font-smoothing',
  '-webkit-tap-highlight-color', '-webkit-text-fill-color', '-webkit-text-stroke',
  '-webkit-line-clamp', '-webkit-box-orient',
  '-webkit-overflow-scrolling', '-webkit-touch-callout',
  '-ms-overflow-style', '-ms-high-contrast-adjust',
]);

export const unrecognizedPropertyRule: Rule = {
  meta: {
    rule_id: 'safety/unrecognized-property',
    group: 'safety',
    severity: 'info', // MUST be info only per spec
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'all CSS declarations',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    walk(ast, (node) => {
      if (node.type === 'Declaration') {
        const property = String(node.property || '').toLowerCase();

        // Skip custom properties (--*)
        if (property.startsWith('--')) {
          return;
        }

        // Check if property is known
        if (!KNOWN_PROPERTIES.has(property)) {
          if (node.loc) {
            issues.push(
              createInfoIssue({
                ruleId: 'safety/unrecognized-property',
                group: 'safety',
                severity: 'info', // MUST be info only
                message: `Unrecognized property '${property}' (may be new or experimental)`,
                location: cssTreeLocToRange(node.loc),
                logic: {
                  what: `Property '${property}' is not in the standard CSS property list`,
                  why: 'This could be a typo, a vendor-specific property, or a new CSS feature',
                  when_safe: 'No fix available - verify the property name is correct',
                },
              })
            );
          }
        }
      }
    });

    return issues;
  },
};
