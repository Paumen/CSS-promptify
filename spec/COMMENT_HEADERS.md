<!--
CLAUDE_PERMISSIONS: READ | FOLLOW
CLAUDE_UPDATE_POLICY: STRICTLY_DISALLOWED
PURPOSE: Authoritative Reference
AUTHORITY: None
IF_CONFLICT: N/A
IF_OUTDATED: Flag human
PRIORITY: CRITICAL
-->

# Comment Headers Governance

This document defines the comment header system used across all documentation in this repository.

## Template

```html
<!--
CLAUDE_PERMISSIONS: [READ | SUGGEST | EDIT | FOLLOW | REFUSE_MODIFY]
CLAUDE_UPDATE_POLICY: [STRICTLY_DISALLOWED | ALLOWED_AND_INFORM | ALLOWED_WITH_HUMAN_PR_REVIEW | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL]
PURPOSE: [Authoritative Reference | Instructions | Human-Only | Deprecated]
AUTHORITY: [Parent document | "None" if root]
IF_CONFLICT: [Resolution rule | "see parent document at authority" | "request HUMAN if unclear"]
IF_OUTDATED: [Flag human | Ignore | Update with note]
PRIORITY: [CRITICAL | HIGH | MEDIUM | LOW]
-->
```

## Definitions

### CLAUDE_PERMISSIONS

| Permission | Meaning |
|-----------|---------|
| **READ** | Can read and reference only. Cannot propose changes. |
| **SUGGEST** | Can propose changes as diff/patch. Cannot apply directly. |
| **EDIT** | Can modify directly (subject to CLAUDE_UPDATE_POLICY). |
| **FOLLOW** | Mandatory guideline. Non-compliance = error. |
| **REFUSE_MODIFY** | Cannot edit/write/delete under any circumstances. |

### CLAUDE_UPDATE_POLICY

| Policy | Meaning |
|--------|---------|
| **STRICTLY_DISALLOWED** | Never modify. If HUMAN requests, instruct them to change policy manually. If they persist, refuse always. Subagents: always forbidden. |
| **ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL** | Forbidden unless HUMAN provides exact code `YES_HUMAN_APPROVED`. Request approval with: change type, specific details, and reason. Token is single-use only. HUMAN_PR_REVIEW still required. Subagents: forbidden. |
| **ALLOWED_AND_INFORM** | Can update/edit freely. Mandatory: inform HUMAN after. FILE_DELETE/REWRITE: requires PR review. Subagents: forbidden. |
| **ALLOWED_WITH_HUMAN_PR_REVIEW** | Can update/edit. All changes require PR review before merge. Subagents: permitted. |

### PURPOSE

| Purpose | Meaning |
|---------|---------|
| **Authoritative Reference** | Single source of truth. Conflicts resolved via AUTHORITY field. |
| **Instructions** | Guidelines Claude must follow. Non-compliance = error. |
| **Human-Only** | For human decision-making only. Claude reads/references only. |
| **Deprecated** | Outdated. Reference only; ignore if conflicts with active specs. |

### IF_OUTDATED Actions

| Action | Meaning |
|--------|---------|
| **Flag human** | Notify HUMAN in chat with evidence + suggestion. |
| **Ignore** | Treat as-is. Don't raise concerns. (Use case: archived records) |
| **Update with note** | Update directly (if policy allows). Add: `<!-- UPDATED: [date] [reason] -->`. |

### IF_CONFLICT Resolution

| Strategy | Meaning |
|----------|---------|
| **"Defer to [Doc] §X.Y"** | Follow that section. Cite in decisions. |
| **"see parent document at authority"** | Resolve via AUTHORITY chain recursively. |
| **"request HUMAN if unclear"** | Ask HUMAN for clarification. Provide: what conflicts + why it matters. |

### Agent Scope

| Agent | Scope |
|-------|-------|
| **CLAUDE_MAIN_AGENT** | Main conversation agent. Can request explicit approval + interact with HUMAN. |
| **CLAUDE_SUBAGENTS** | Task-spawned agents (Explore, Bash, etc.). More restrictive policies. Cannot request interactive approval. |

### PRIORITY Levels

| Priority | Meaning | Examples |
|----------|---------|----------|
| **CRITICAL** | Core system governance. Affects all decisions. Changes cascade. | PRD_BUILD_SPEC, DATA_CONTRACTS, AUTHORITY, DECISIONS, SYSTEM_PROMPT |
| **HIGH** | Directly affects implementation quality/correctness. Must be followed closely. | UI_BEHAVIOR, RULEBOOK_INDEX, EXAMPLES, TYPES, TERMINOLOGY |
| **MEDIUM** | Important but not blocking. Provides guidance or context. | CLAUDE.md, README, WORKFLOW, validation reports |
| **LOW** | Reference material. Nice to have but not essential. | app/README |

## Usage Notes

1. **Placement**: Always at the top of markdown files (before title)
2. **Format**: HTML comments `<!-- -->` (invisible in rendered markdown)
3. **Scope**: All `.md` files in this project, and possibly more.
4. **Updates**: Changes to this governance system strictly by human only.

---

## Document Inventory

Complete inventory of all documentation files with their governance headers.

| # | Document | Purpose | Permissions | Update Policy | Authority | Priority | Key Value |
|---|----------|---------|-------------|---------------|-----------|----------|-----------|
| 1 | `spec/PRD_BUILD_SPEC.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | None | **CRITICAL** | Primary source of truth; requirements + constraints |
| 2 | `spec/DATA_CONTRACTS.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **CRITICAL** | Canonical data shapes, enums, invariants, recompute model |
| 3 | `spec/DECISIONS.md` | Human-Only | READ | STRICTLY_DISALLOWED | None | **CRITICAL** | Human decision log; ADR-lite format; read-only |
| 4 | `spec/AUTHORITY.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | STRICTLY_DISALLOWED | None | **CRITICAL** | Document hierarchy; conflict resolution rules |
| 5 | `spec/TYPES.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | DATA_CONTRACTS.md | **HIGH** | TypeScript interfaces; must match DATA_CONTRACTS |
| 6 | `spec/UI_BEHAVIOR.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | UI state, interactions, user flows |
| 7 | `spec/RULEBOOK_INDEX.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | PRD_BUILD_SPEC.md | **HIGH** | Catalog of 20 rules; rule IDs, grouping, defaults |
| 8 | `spec/EXAMPLES.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Test cases; before/after examples for all rules |
| 9 | `spec/UI_STYLE_GUIDE.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Visual styling rules; CSS maintainability |
| 10 | `spec/TERMINOLOGY.md` | Authoritative Reference | READ \| FOLLOW \| SUGGEST | ALLOWED_WITH_HUMAN_PR_REVIEW | PRD_BUILD_SPEC.md | **HIGH** | Standardized terms; consistent usage across codebase |
| 11 | `spec/COMMENT_HEADERS.md` | Authoritative Reference | READ \| FOLLOW | STRICTLY_DISALLOWED | None | **CRITICAL** | Governance system definitions; template + policies |
| 12 | `prompts/SYSTEM_PROMPT.md` | Instructions | READ \| FOLLOW | STRICTLY_DISALLOWED | None | **CRITICAL** | LLM working instructions; takes precedence in sessions |
| 13 | `prompts/IMPLEMENTATION_CHECKLIST.md` | Instructions | READ \| FOLLOW \| SUGGEST \| EDIT | ALLOWED_AND_INFORM | None | **HIGH** | Phased development guide; must follow phases in order |
| 14 | `prompts/WORKFLOW.md` | Instructions | READ \| SUGGEST | ALLOWED_AND_INFORM | None | **MEDIUM** | LLM workflow guide; how to use LLM with repo |
| 15 | `prompts/CHANGE_REQUEST_PROMPT.md` | Instructions | READ \| SUGGEST | ALLOWED_AND_INFORM | None | **MEDIUM** | Change request template; prevents scope creep |
| 16 | `CLAUDE.md` | Instructions | READ \| FOLLOW \| SUGGEST | ALLOWED_AND_INFORM | None | **CRITICAL** | Claude Code entry point; quick-start + architecture |
| 17 | `README.md` | Authoritative Reference | READ \| SUGGEST \| EDIT | ALLOWED_AND_INFORM | None | **MEDIUM** | Project overview; public-facing guide |
| 18 | `app/README.md` | Authoritative Reference | READ \| EDIT | ALLOWED_AND_INFORM | None | **LOW** | React/TypeScript/Vite setup guide |
| 19 | `docs/ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md` | Human-Only | READ \| SUGGEST | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | None | **MEDIUM** | Human analysis document; RCA + action items |
| 20 | `tests/RULES_VALIDATION_REPORT.md` | Authoritative Reference | READ \| SUGGEST \| EDIT | ALLOWED_AND_INFORM | None | **MEDIUM** | Generated validation report; can be updated by Claude |
| 21 | `tests/RULES_VALIDATION_REPORT_HUMAN.md` | Human-Only | READ | STRICTLY_DISALLOWED | None | **LOW** | Human validation report; read-only reference |

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
| **STRICTLY_DISALLOWED** | 5 | DECISIONS.md, AUTHORITY.md, SYSTEM_PROMPT.md, COMMENT_HEADERS.md, RULES_VALIDATION_REPORT_HUMAN.md |
| **ALLOWED_AND_INFORM** | 7 | README.md, CLAUDE.md, app/README.md, IMPLEMENTATION_CHECKLIST.md, WORKFLOW.md, CHANGE_REQUEST_PROMPT.md, RULES_VALIDATION_REPORT.md |
| **ALLOWED_WITH_HUMAN_PR_REVIEW** | 6 | DATA_CONTRACTS.md, TYPES.md, UI_BEHAVIOR.md, EXAMPLES.md, UI_STYLE_GUIDE.md, TERMINOLOGY.md |
| **ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL** | 3 | PRD_BUILD_SPEC.md, RULEBOOK_INDEX.md, ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md |

### Purpose Distribution

| Purpose | Count | Documents |
|---------|-------|-----------|
| **Authoritative Reference** | 13 | All 10 spec files + README, app/README, RULES_VALIDATION_REPORT |
| **Instructions** | 5 | CLAUDE.md, SYSTEM_PROMPT.md, IMPLEMENTATION_CHECKLIST.md, WORKFLOW.md, CHANGE_REQUEST_PROMPT.md |
| **Human-Only** | 3 | DECISIONS.md, ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md, RULES_VALIDATION_REPORT_HUMAN.md |

---

## Usage Guide by Role

### For Claude (LLM)
- **Must FOLLOW**: `prompts/SYSTEM_PROMPT.md`, `CLAUDE.md`, `spec/AUTHORITY.md`, `spec/COMMENT_HEADERS.md`, all prescriptive specs (UI_BEHAVIOR, RULEBOOK_INDEX, EXAMPLES, etc.)
- **Must READ**: All spec files and instructions
- **Can SUGGEST on**: All Authoritative References
- **Can EDIT**: README.md, app/README.md, IMPLEMENTATION_CHECKLIST.md, RULES_VALIDATION_REPORT.md
- **Requires explicit approval for**: PRD_BUILD_SPEC.md, RULEBOOK_INDEX.md, ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md
- **Cannot TOUCH**: DECISIONS.md, AUTHORITY.md, SYSTEM_PROMPT.md, COMMENT_HEADERS.md, RULES_VALIDATION_REPORT_HUMAN.md

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
- Check update policy in the Document Inventory table
- Follow authority chain (AUTHORITY column)
- If PR review needed, use `prompts/CHANGE_REQUEST_PROMPT.md`
- If human approval needed, provide exact context
