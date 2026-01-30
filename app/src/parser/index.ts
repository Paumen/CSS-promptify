/**
 * CSS Parser Module
 * Wraps css-tree for CSS parsing with location tracking
 */

import * as csstree from 'css-tree';
import type { CSSNode, ParseError, Position } from '../types';

interface CssTreeParseError {
  message: string;
  line?: number;
  column?: number;
}

/**
 * Parse CSS string into AST
 */
export function parse(css: string): { ast: CSSNode; errors: ParseError[] } {
  const errors: ParseError[] = [];

  const ast = csstree.parse(css, {
    positions: true,
    onParseError: (error: CssTreeParseError) => {
      errors.push({
        message: error.message,
        location: {
          line: error.line ?? 1,
          column: error.column ?? 1,
        } as Position,
      });
    },
  }) as unknown as CSSNode;

  return { ast, errors };
}

/**
 * Generate CSS string from AST
 */
export function generate(ast: CSSNode): string {
  return csstree.generate(ast as csstree.CssNode);
}

/**
 * Walk the AST and call visitor for each node
 */
export function walk(
  ast: CSSNode,
  visitor: (node: CSSNode, parent: CSSNode | null) => void
): void {
  csstree.walk(ast as csstree.CssNode, {
    enter(node: csstree.CssNode) {
      visitor(node as unknown as CSSNode, null);
    },
  });
}

export { csstree };
