/**
 * Rule: modern/prefer-hex-colors
 * Convert rgb() to hex when exact conversion is possible
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createSafeIssue, cssTreeLocToRange, createPatch } from '../utils';
import { walk, csstree } from '../../parser';

/**
 * Convert RGB values to hex color
 * Returns null if conversion is not exact (e.g., has alpha or non-integer values)
 */
function rgbToHex(r: number, g: number, b: number): string | null {
  // Validate values are integers in range 0-255
  if (
    !Number.isInteger(r) || r < 0 || r > 255 ||
    !Number.isInteger(g) || g < 0 || g > 255 ||
    !Number.isInteger(b) || b < 0 || b > 255
  ) {
    return null;
  }

  const hex = [r, g, b]
    .map((val) => val.toString(16).padStart(2, '0'))
    .join('');

  return `#${hex}`;
}

/**
 * Try to shorten hex color (#ffffff -> #fff)
 */
function shortenHex(hex: string): string {
  // Check if it's a 6-char hex that can be shortened
  if (hex.length === 7) {
    const r1 = hex[1], r2 = hex[2];
    const g1 = hex[3], g2 = hex[4];
    const b1 = hex[5], b2 = hex[6];

    if (r1 === r2 && g1 === g2 && b1 === b2) {
      return `#${r1}${g1}${b1}`;
    }
  }
  return hex;
}

/**
 * Parse rgb/rgba function and extract values
 */
function parseRgbFunction(node: CSSNode): { r: number; g: number; b: number; a?: number } | null {
  const name = String(node.name || '').toLowerCase();
  if (name !== 'rgb' && name !== 'rgba') {
    return null;
  }

  const children = node.children as CSSNode[] | undefined;
  if (!children) {
    return null;
  }

  // Collect numeric values
  const values: number[] = [];
  let hasAlpha = false;

  for (const child of children) {
    if (child.type === 'Number') {
      values.push(parseFloat(String(child.value)));
    } else if (child.type === 'Percentage') {
      // Convert percentage to 0-255 range
      values.push(Math.round(parseFloat(String(child.value)) * 255 / 100));
    } else if (child.type === 'Dimension' && String(child.unit) === '%') {
      values.push(Math.round(parseFloat(String(child.value)) * 255 / 100));
    }
  }

  // rgb() should have 3 values, rgba() should have 4
  if (values.length < 3) {
    return null;
  }

  const r = values[0];
  const g = values[1];
  const b = values[2];
  const a = values.length >= 4 ? values[3] : undefined;

  // If there's an alpha that's not 1, we can't convert to simple hex
  if (a !== undefined && a !== 1) {
    hasAlpha = true;
  }

  if (hasAlpha) {
    return null;
  }

  return { r, g, b };
}

export const preferHexColorsRule: Rule = {
  meta: {
    rule_id: 'modern/prefer-hex-colors',
    group: 'modern',
    severity: 'info',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'CSS color values using rgb() function',
    autofix_notes: 'Convert rgb() to hex when exact conversion is possible',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    walk(ast, (node) => {
      if (node.type === 'Function') {
        const name = String(node.name || '').toLowerCase();

        // Only handle rgb() - not rgba() with actual alpha, or other color functions
        if (name === 'rgb' || name === 'rgba') {
          const rgb = parseRgbFunction(node);

          if (rgb && node.loc) {
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

            if (hex) {
              const shortHex = shortenHex(hex);
              const originalText = csstree.generate(node as csstree.CssNode);

              // Don't flag if it's already a reasonable length
              if (originalText.length <= shortHex.length) {
                return;
              }

              issues.push(
                createSafeIssue({
                  ruleId: 'modern/prefer-hex-colors',
                  group: 'modern',
                  severity: 'info',
                  message: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) can be written as ${shortHex}`,
                  location: cssTreeLocToRange(node.loc),
                  logic: {
                    what: `Found rgb() color that can be converted to hex`,
                    why: 'Hex colors are more compact and widely supported',
                    when_safe: 'Always safe when RGB values are integers 0-255 and no alpha channel',
                  },
                  preview: shortHex,
                  patches: [createPatch(cssTreeLocToRange(node.loc), shortHex)],
                  commentText: `modern/prefer-hex-colors: converted from ${originalText}`,
                })
              );
            }
          }
        }
      }
    });

    return issues;
  },
};
