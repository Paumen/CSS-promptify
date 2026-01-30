/**
 * Rule: safety/misspelled-property
 * Suggests corrections for common CSS property typos
 * Uses LLM prompt (not safe to auto-fix)
 */

import type { Rule, Issue, CSSNode, SessionConfig, LLMPrompt } from '../../types';
import { cssTreeLocToRange, generateIssueId } from '../utils';
import { walk } from '../../parser';

// Common CSS property typos and their corrections
const COMMON_TYPOS: Record<string, string> = {
  // width/height typos
  'widht': 'width',
  'wdith': 'width',
  'widh': 'width',
  'wieth': 'width',
  'heigth': 'height',
  'hieght': 'height',
  'heght': 'height',
  'hight': 'height',

  // margin/padding typos
  'marign': 'margin',
  'margni': 'margin',
  'maring': 'margin',
  'margn': 'margin',
  'paddin': 'padding',
  'paddding': 'padding',
  'pading': 'padding',
  'padidng': 'padding',

  // position typos
  'positon': 'position',
  'postion': 'position',
  'positoin': 'position',
  'posiiton': 'position',

  // display typos
  'dipslay': 'display',
  'dispaly': 'display',
  'diplay': 'display',
  'disply': 'display',
  'dsiplay': 'display',

  // color typos
  'colro': 'color',
  'colur': 'color',
  'clor': 'color',
  'colour': 'color', // British spelling

  // background typos
  'backgorund': 'background',
  'backgroud': 'background',
  'backgrund': 'background',
  'backgroung': 'background',
  'backgroundcolor': 'background-color',
  'backgrond': 'background',

  // font typos
  'fon-size': 'font-size',
  'fontsize': 'font-size',
  'font-szie': 'font-size',
  'font-wieght': 'font-weight',
  'fontweight': 'font-weight',
  'font-wight': 'font-weight',
  'fontfamily': 'font-family',
  'font-famly': 'font-family',

  // border typos
  'bordr': 'border',
  'boarder': 'border',
  'boder': 'border',
  'broder': 'border',
  'border-raduis': 'border-radius',
  'border-radious': 'border-radius',
  'border-raidus': 'border-radius',

  // text typos
  'text-algn': 'text-align',
  'text-algin': 'text-align',
  'textalign': 'text-align',
  'text-deocration': 'text-decoration',
  'text-decoraion': 'text-decoration',
  'textdecoration': 'text-decoration',

  // flex typos
  'flex-dierction': 'flex-direction',
  'flex-direcion': 'flex-direction',
  'flexdirection': 'flex-direction',
  'justify-conent': 'justify-content',
  'justifycontent': 'justify-content',
  'align-itmes': 'align-items',
  'alignitems': 'align-items',

  // grid typos
  'grid-tempalte': 'grid-template',
  'grid-tempate': 'grid-template',
  'gird-template': 'grid-template',

  // transition/animation typos
  'transiton': 'transition',
  'transtion': 'transition',
  'tranistion': 'transition',
  'animaton': 'animation',
  'animaiton': 'animation',
  'anmation': 'animation',

  // overflow typos
  'overlfow': 'overflow',
  'oveflow': 'overflow',
  'overfow': 'overflow',

  // opacity typos
  'opactiy': 'opacity',
  'opaciy': 'opacity',
  'opcaity': 'opacity',

  // z-index typos
  'zindex': 'z-index',
  'z-idnex': 'z-index',
  'z-indx': 'z-index',

  // box-shadow typos
  'boxshadow': 'box-shadow',
  'box-shadwo': 'box-shadow',
  'box-shaodw': 'box-shadow',

  // transform typos
  'transfrom': 'transform',
  'tansform': 'transform',
  'trasnform': 'transform',

  // other common typos
  'visiblity': 'visibility',
  'visibilty': 'visibility',
  'visability': 'visibility',
  'cusor': 'cursor',
  'curser': 'cursor',
  'cursur': 'cursor',
  'outlin': 'outline',
  'outlien': 'outline',
  'backface-visiblity': 'backface-visibility',
  'line-heigth': 'line-height',
  'lineheight': 'line-height',
  'letter-spacng': 'letter-spacing',
  'letterspacing': 'letter-spacing',
  'word-spacng': 'word-spacing',
  'wordspacing': 'word-spacing',
  'white-sapce': 'white-space',
  'whitespace': 'white-space',
  'verticle-align': 'vertical-align',
  'vertical-algn': 'vertical-align',
  'list-sytle': 'list-style',
  'liststyle': 'list-style',
  'min-widht': 'min-width',
  'max-widht': 'max-width',
  'min-heigth': 'min-height',
  'max-heigth': 'max-height',
};

function createLLMPrompt(property: string, suggestion: string, line: number): LLMPrompt {
  return {
    id: `prompt-misspelled-${property}-${line}`,
    title: `Fix typo: ${property} → ${suggestion}`,
    format: 'text',
    copy_text: `The CSS property "${property}" appears to be misspelled. Did you mean "${suggestion}"?

Please review and correct this property name if intended:
- Current: ${property}
- Suggested: ${suggestion}

Note: This is flagged as a prompt-only fix because automatically changing property names could have unintended consequences if the typo was intentional (e.g., for a preprocessor or custom tooling).`,
  };
}

export const misspelledPropertyRule: Rule = {
  meta: {
    rule_id: 'safety/misspelled-property',
    group: 'safety',
    severity: 'warning',
    fixability: 'prompt',
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

        // Check if property matches a known typo
        const suggestion = COMMON_TYPOS[property];
        if (suggestion && node.loc) {
          const issueId = generateIssueId('safety/misspelled-property');
          issues.push({
            id: issueId,
            rule_id: 'safety/misspelled-property',
            group: 'safety',
            severity: 'warning',
            message: `Possible typo: '${property}' should be '${suggestion}'`,
            location: cssTreeLocToRange(node.loc),
            logic: {
              what: `Property '${property}' matches a common typo pattern`,
              why: `Misspelled properties are ignored by browsers, causing styles not to apply`,
              when_safe: 'Review manually - auto-fix not available to prevent unintended changes',
            },
            fixability: 'prompt',
            llm_prompt: createLLMPrompt(property, suggestion, node.loc.start.line),
          });
        }
      }
    });

    return issues;
  },
};
