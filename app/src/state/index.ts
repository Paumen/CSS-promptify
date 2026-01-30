/**
 * State Management Module
 * Uses Zustand for session state
 */

import { create } from 'zustand';
import type {
  SessionState,
  SessionConfig,
  AnalysisResult,
  RuleGroup,
  Severity,
} from '../types';
import { analyze, applyFixes } from '../engine';

// Re-export calculateStats for components to use
export { calculateStats } from '../engine';

/**
 * Default session configuration
 */
const defaultConfig: SessionConfig = {
  rules: {},
  groups: {
    modern: { enabled: true, severity: null },
    consolidation: { enabled: true, severity: null },
    format: { enabled: true, severity: null },
    tokens: { enabled: true, severity: null },
    safety: { enabled: true, severity: null },
    education: { enabled: true, severity: null },
  },
};

/**
 * Application store interface
 */
interface AppStore {
  // Session state
  session: SessionState;
  config: SessionConfig;

  // Analysis results
  analysisResult: AnalysisResult | null;
  outputCss: string;

  // Actions
  setOriginalCss: (css: string) => void;
  analyzeInput: () => void;
  toggleFix: (fixId: string) => void;
  selectAllFixes: () => void;
  unselectAllFixes: () => void;
  toggleComments: () => void;
  setRuleEnabled: (ruleId: string, enabled: boolean) => void;
  setRuleSeverity: (ruleId: string, severity: Severity | null) => void;
  setGroupEnabled: (group: RuleGroup, enabled: boolean) => void;
  reset: () => void;
}

/**
 * Create the application store
 */
export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  session: {
    original_css: '',
    selected_fix_ids: [],
    comments_enabled: false,
  },
  config: defaultConfig,
  analysisResult: null,
  outputCss: '',

  // Actions
  setOriginalCss: (css: string) => {
    set((state) => ({
      session: {
        ...state.session,
        original_css: css,
        selected_fix_ids: [],
      },
      analysisResult: null,
      outputCss: '',
    }));
  },

  analyzeInput: () => {
    const { session, config } = get();
    if (!session.original_css) return;

    const result = analyze(session.original_css, config);
    set({
      analysisResult: result,
      outputCss: session.original_css,
    });
  },

  toggleFix: (fixId: string) => {
    const { session, analysisResult } = get();
    if (!analysisResult) return;

    const isSelected = session.selected_fix_ids.includes(fixId);
    const newSelectedIds = isSelected
      ? session.selected_fix_ids.filter((id) => id !== fixId)
      : [...session.selected_fix_ids, fixId];

    // Recompute output
    const result = applyFixes(
      session.original_css,
      analysisResult.issues,
      newSelectedIds,
      session.comments_enabled
    );

    set((state) => ({
      session: {
        ...state.session,
        selected_fix_ids: newSelectedIds,
      },
      outputCss: result.css,
    }));
  },

  selectAllFixes: () => {
    const { session, analysisResult } = get();
    if (!analysisResult) return;

    const allFixIds = analysisResult.issues
      .filter((issue) => issue.fix)
      .map((issue) => issue.fix!.id);

    const result = applyFixes(
      session.original_css,
      analysisResult.issues,
      allFixIds,
      session.comments_enabled
    );

    set((state) => ({
      session: {
        ...state.session,
        selected_fix_ids: allFixIds,
      },
      outputCss: result.css,
    }));
  },

  unselectAllFixes: () => {
    const { session } = get();

    set((state) => ({
      session: {
        ...state.session,
        selected_fix_ids: [],
      },
      outputCss: session.original_css,
    }));
  },

  toggleComments: () => {
    const { session, analysisResult } = get();
    if (!analysisResult) return;

    const newCommentsEnabled = !session.comments_enabled;

    const result = applyFixes(
      session.original_css,
      analysisResult.issues,
      session.selected_fix_ids,
      newCommentsEnabled
    );

    set((state) => ({
      session: {
        ...state.session,
        comments_enabled: newCommentsEnabled,
      },
      outputCss: result.css,
    }));
  },

  setRuleEnabled: (ruleId: string, enabled: boolean) => {
    set((state) => ({
      config: {
        ...state.config,
        rules: {
          ...state.config.rules,
          [ruleId]: {
            ...state.config.rules[ruleId],
            enabled,
            severity: state.config.rules[ruleId]?.severity ?? null,
          },
        },
      },
    }));
  },

  setRuleSeverity: (ruleId: string, severity: Severity | null) => {
    set((state) => ({
      config: {
        ...state.config,
        rules: {
          ...state.config.rules,
          [ruleId]: {
            ...state.config.rules[ruleId],
            enabled: state.config.rules[ruleId]?.enabled ?? true,
            severity,
          },
        },
      },
    }));
  },

  setGroupEnabled: (group: RuleGroup, enabled: boolean) => {
    set((state) => ({
      config: {
        ...state.config,
        groups: {
          ...state.config.groups,
          [group]: {
            ...state.config.groups[group],
            enabled,
          },
        },
      },
    }));
  },

  reset: () => {
    set({
      session: {
        original_css: '',
        selected_fix_ids: [],
        comments_enabled: false,
      },
      config: defaultConfig,
      analysisResult: null,
      outputCss: '',
    });
  },
}));

// Note: Custom selector hooks removed to avoid React 18 infinite loop issues
// Components should use useAppStore with individual selectors directly
