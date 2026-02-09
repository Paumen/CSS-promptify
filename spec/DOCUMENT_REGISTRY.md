<!--
CLAUDE_PERMISSIONS: READ | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_AND_INFORM
PURPOSE: Authoritative Reference
AUTHORITY: spec/COMMENT_HEADERS.md
IF_CONFLICT: Defer to spec/COMMENT_HEADERS.md
IF_OUTDATED: Flag human
PRIORITY: MEDIUM
-->

# Document Registry

Complete inventory of all documentation files with governance headers, policies, and value summary.

## All Documents Summary Table

| # | Document | Purpose | Permissions | Update Policy | Authority | Priority | Key Value |
|---|----------|---------|-------------|---------------|-----------|----------|-----------|
| 1 | `spec/PRD_BUILD_SPEC.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | None | **CRITICAL** | Primary source of truth; requirements + constraints |
| 2 | `spec/DATA_CONTRACTS.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **CRITICAL** | Canonical data shapes, enums, invariants, recompute model |
| 3 | `spec/DECISIONS.md` | Human-Only | READ | STRICTLY_DISALLOWED | None | **CRITICAL** | Human decision log; ADR-lite format; read-only |
| 4 | `spec/AUTHORITY.md` | Authoritative Reference | READ \| FOLLOW | STRICTLY_DISALLOWED | None | **CRITICAL** | Document hierarchy; conflict resolution rules |
| 5 | `spec/TYPES.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | DATA_CONTRACTS.md | **HIGH** | TypeScript interfaces; must match DATA_CONTRACTS |
| 6 | `spec/UI_BEHAVIOR.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | UI state, interactions, user flows |
| 7 | `spec/RULEBOOK_INDEX.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Catalog of 20 rules; rule IDs, grouping, defaults |
| 8 | `spec/EXAMPLES.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Test cases; before/after examples for all rules |
| 9 | `spec/UI_STYLE_GUIDE.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Visual styling rules; CSS maintainability |
| 10 | `spec/TERMINOLOGY.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **MEDIUM** | Standardized terms; consistent usage across codebase |
| 11 | `spec/COMMENT_HEADERS.md` | Instructions | READ \| SUGGEST | ALLOWED_AND_INFORM | None | **HIGH** | Governance system definitions; template + policies |
| 12 | `prompts/SYSTEM_PROMPT.md` | Instructions | READ \| FOLLOW | STRICTLY_DISALLOWED | None | **CRITICAL** | LLM working instructions; takes precedence in sessions |
| 13 | `prompts/IMPLEMENTATION_CHECKLIST.md` | Instructions | READ \| FOLLOW | ALLOWED_AND_INFORM | None | **HIGH** | Phased development guide; must follow phases in order |
| 14 | `prompts/WORKFLOW.md` | Instructions | READ | ALLOWED_AND_INFORM | None | **MEDIUM** | LLM workflow guide; how to use LLM with repo |
| 15 | `prompts/CHANGE_REQUEST_PROMPT.md` | Instructions | READ | ALLOWED_AND_INFORM | None | **MEDIUM** | Change request template; prevents scope creep |
| 16 | `CLAUDE.md` | Instructions | READ \| FOLLOW | ALLOWED_AND_INFORM | None | **CRITICAL** | Claude Code entry point; quick-start + architecture |
| 17 | `README.md` | Authoritative Reference | READ | ALLOWED_AND_INFORM | None | **MEDIUM** | Project overview; public-facing guide |
| 18 | `app/README.md` | Authoritative Reference | READ \| EDIT | ALLOWED_AND_INFORM | None | **LOW** | React/TypeScript/Vite setup guide |
| 19 | `docs/ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md` | Human-Only | READ \| SUGGEST | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | None | **MEDIUM** | Human analysis document; RCA + action items |
| 20 | `tests/RULES_VALIDATION_REPORT.md` | Authoritative Reference | READ \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | None | **MEDIUM** | Automated validation report; all 20 rules tested |
| 21 | `tests/RULES_VALIDATION_REPORT_HUMAN.md` | Human-Only | READ | STRICTLY_DISALLOWED | None | **LOW** | Human validation report; read-only reference |

---

## Key Insights

### Critical Priority (4 documents)
These are **non-negotiable** and form the foundation:
- `spec/PRD_BUILD_SPEC.md` – Root source of truth
- `spec/DATA_CONTRACTS.md` – Data invariants
- `spec/DECISIONS.md` – Human decisions (read-only)
- `spec/AUTHORITY.md` – Hierarchy + conflict rules
- `prompts/SYSTEM_PROMPT.md` – LLM instructions (follows these always)
- `CLAUDE.md` – Claude Code entry point

### Authority Chain
```
PRD_BUILD_SPEC.md (root)
├── DATA_CONTRACTS.md
├── TYPES.md
├── UI_BEHAVIOR.md
├── RULEBOOK_INDEX.md
├── EXAMPLES.md
├── UI_STYLE_GUIDE.md
└── TERMINOLOGY.md
```

### Update Policies Distribution
| Policy | Count | Documents |
|--------|-------|-----------|
| **STRICTLY_DISALLOWED** | 4 | DECISIONS.md, AUTHORITY.md, SYSTEM_PROMPT.md, RULES_VALIDATION_REPORT_HUMAN.md |
| **ALLOWED_AND_INFORM** | 8 | README.md, CLAUDE.md, app/README.md, IMPLEMENTATION_CHECKLIST.md, WORKFLOW.md, CHANGE_REQUEST_PROMPT.md, COMMENT_HEADERS.md, RULES_VALIDATION_REPORT.md |
| **ALLOWED_WITH_HUMAN_PR_REVIEW** | 8 | PRD_BUILD_SPEC.md, DATA_CONTRACTS.md, TYPES.md, UI_BEHAVIOR.md, RULEBOOK_INDEX.md, EXAMPLES.md, UI_STYLE_GUIDE.md, TERMINOLOGY.md |
| **ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL** | 1 | ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md |

### Purpose Distribution
| Purpose | Count | Documents |
|---------|-------|-----------|
| **Authoritative Reference** | 11 | All spec files + README, app/README, RULES_VALIDATION_REPORT |
| **Instructions** | 5 | CLAUDE.md, SYSTEM_PROMPT.md, IMPLEMENTATION_CHECKLIST.md, WORKFLOW.md, CHANGE_REQUEST_PROMPT.md, COMMENT_HEADERS.md |
| **Human-Only** | 3 | DECISIONS.md, ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md, RULES_VALIDATION_REPORT_HUMAN.md |

---

## Usage Guide by Role

### For Claude (LLM)
- **Must FOLLOW**: `prompts/SYSTEM_PROMPT.md`, `CLAUDE.md`, `spec/AUTHORITY.md`
- **Must READ**: All spec files (PRD_BUILD_SPEC.md through TERMINOLOGY.md)
- **Can SUGGEST on**: All Authoritative References with PR review
- **Cannot TOUCH**: DECISIONS.md, AUTHORITY.md, SYSTEM_PROMPT.md, human-only reports

### For Humans
- **Start Here**: `CLAUDE.md` → `spec/AUTHORITY.md` → `spec/PRD_BUILD_SPEC.md`
- **Decision Records**: `spec/DECISIONS.md` (read and update as needed)
- **For Implementation**: `spec/EXAMPLES.md` + `spec/RULEBOOK_INDEX.md`
- **When Requesting Changes**: Use `prompts/CHANGE_REQUEST_PROMPT.md` template

---

## Quick Lookup

**Need to understand a specific concept?**
- Rules behavior → `spec/RULEBOOK_INDEX.md` + `spec/EXAMPLES.md`
- Data formats → `spec/DATA_CONTRACTS.md` + `spec/TYPES.md`
- UI design → `spec/UI_BEHAVIOR.md` + `spec/UI_STYLE_GUIDE.md`
- Terminology → `spec/TERMINOLOGY.md`
- Why a decision was made → `spec/DECISIONS.md`
- Architecture overview → `CLAUDE.md`

**Need to make a change?**
- Check update policy in this table
- Follow authority chain (AUTHORITY column)
- If PR review needed, use `prompts/CHANGE_REQUEST_PROMPT.md`
- If human approval needed, provide exact context
