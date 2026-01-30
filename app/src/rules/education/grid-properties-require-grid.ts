/**
 * Rule: layout/grid-properties-require-grid
 * Warn if grid properties are used but display: grid|inline-grid is not present
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createInfoIssue, cssTreeLocToRange } from '../utils';
import { walk, csstree } from '../../parser';

// Grid container properties
const GRID_CONTAINER_PROPERTIES = new Set([
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'justify-items',
  'align-items',
  'place-items',
  'justify-content',
  'align-content',
  'place-content',
  'gap',
  'row-gap',
  'column-gap',
]);

// Properties that only make sense for grid (not shared with flex)
const GRID_ONLY_PROPERTIES = new Set([
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'grid-area',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
]);

interface DeclarationInfo {
  property: string;
  value: string;
  loc: NonNullable<CSSNode['loc']>;
}

export const gridPropertiesRequireGridRule: Rule = {
  meta: {
    rule_id: 'layout/grid-properties-require-grid',
    group: 'education',
    severity: 'info',
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'CSS rules using grid properties',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    walk(ast, (node) => {
      if (node.type === 'Rule' && node.block) {
        const block = node.block as CSSNode;
        if (!block.children) return;

        const declarations: DeclarationInfo[] = [];
        let hasGridDisplay = false;
        let hasFlexDisplay = false;

        // Collect declarations and check for display: grid
        for (const child of block.children as CSSNode[]) {
          if (child.type === 'Declaration' && child.loc) {
            const property = String(child.property || '').toLowerCase();
            // Generate value string from the value node
            const valueNode = child.value as csstree.CssNode | undefined;
            const value = valueNode ? csstree.generate(valueNode).toLowerCase() : '';

            declarations.push({
              property,
              value,
              loc: child.loc,
            });

            // Check for display: grid or display: inline-grid
            if (property === 'display') {
              if (value.includes('grid') || value.includes('inline-grid')) {
                hasGridDisplay = true;
              }
              if (value.includes('flex') || value.includes('inline-flex')) {
                hasFlexDisplay = true;
              }
            }
          }
        }

        // If no display: grid, check for grid properties
        if (!hasGridDisplay) {
          for (const decl of declarations) {
            // Only flag grid-only properties (not shared properties like gap)
            if (GRID_ONLY_PROPERTIES.has(decl.property)) {
              const isContainerProp = GRID_CONTAINER_PROPERTIES.has(decl.property);

              issues.push(
                createInfoIssue({
                  ruleId: 'layout/grid-properties-require-grid',
                  group: 'education',
                  severity: 'info',
                  message: `'${decl.property}' used without 'display: grid' in same rule`,
                  location: cssTreeLocToRange(decl.loc),
                  logic: {
                    what: `Found grid property '${decl.property}' without display: grid`,
                    why: isContainerProp
                      ? `'${decl.property}' is a grid container property that only works when display is set to grid or inline-grid`
                      : `'${decl.property}' is a grid item property that only works on children of grid containers`,
                    when_safe: 'No auto-fix - verify display: grid is set on this element or a parent (for child properties)',
                  },
                })
              );
            }

            // For shared properties like gap, only flag if neither flex nor grid display
            if (
              !hasFlexDisplay &&
              (decl.property === 'justify-items' || decl.property === 'place-items')
            ) {
              issues.push(
                createInfoIssue({
                  ruleId: 'layout/grid-properties-require-grid',
                  group: 'education',
                  severity: 'info',
                  message: `'${decl.property}' used without 'display: grid' in same rule`,
                  location: cssTreeLocToRange(decl.loc),
                  logic: {
                    what: `Found '${decl.property}' without display: grid`,
                    why: `'${decl.property}' is primarily a grid container property (also works in some block contexts)`,
                    when_safe: 'No auto-fix - verify display: grid is set if grid behavior is intended',
                  },
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
