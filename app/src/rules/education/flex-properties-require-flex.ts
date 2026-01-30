/**
 * Rule: layout/flex-properties-require-flex
 * Warn if flex properties are used but display: flex|inline-flex is not present
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createInfoIssue, cssTreeLocToRange } from '../utils';
import { walk, csstree } from '../../parser';

// Flex child properties that require a flex container parent
const FLEX_CHILD_PROPERTIES = new Set([
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',
  'align-self',
]);

// Flex container properties
const FLEX_CONTAINER_PROPERTIES = new Set([
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'gap',
  'row-gap',
  'column-gap',
]);

// Combined set for quick lookup
const ALL_FLEX_PROPERTIES = new Set([
  ...FLEX_CHILD_PROPERTIES,
  ...FLEX_CONTAINER_PROPERTIES,
]);

interface DeclarationInfo {
  property: string;
  value: string;
  loc: NonNullable<CSSNode['loc']>;
}

export const flexPropertiesRequireFlexRule: Rule = {
  meta: {
    rule_id: 'layout/flex-properties-require-flex',
    group: 'education',
    severity: 'info',
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'CSS rules using flexbox properties',
  },

  run(ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    walk(ast, (node) => {
      if (node.type === 'Rule' && node.block) {
        const block = node.block as CSSNode;
        if (!block.children) return;

        const declarations: DeclarationInfo[] = [];
        let hasFlexDisplay = false;

        // Collect declarations and check for display: flex
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

            // Check for display: flex or display: inline-flex
            if (property === 'display' && (value.includes('flex') || value.includes('inline-flex'))) {
              hasFlexDisplay = true;
            }
          }
        }

        // If no display: flex, check for flex properties
        if (!hasFlexDisplay) {
          for (const decl of declarations) {
            if (ALL_FLEX_PROPERTIES.has(decl.property)) {
              const isContainerProp = FLEX_CONTAINER_PROPERTIES.has(decl.property);

              issues.push(
                createInfoIssue({
                  ruleId: 'layout/flex-properties-require-flex',
                  group: 'education',
                  severity: 'info',
                  message: `'${decl.property}' used without 'display: flex' in same rule`,
                  location: cssTreeLocToRange(decl.loc),
                  logic: {
                    what: `Found flex property '${decl.property}' without display: flex`,
                    why: isContainerProp
                      ? `'${decl.property}' is a flex container property that only works when display is set to flex or inline-flex`
                      : `'${decl.property}' is a flex item property that only works on children of flex containers`,
                    when_safe: 'No auto-fix - verify display: flex is set on this element or a parent (for child properties)',
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
