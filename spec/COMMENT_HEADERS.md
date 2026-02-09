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

## Usage Notes

1. **Placement**: Always at the top of markdown files (before title)
2. **Format**: HTML comments `<!-- -->` (invisible in rendered markdown)
3. **Scope**: All `.md` files in this project, and possibly more.
4. **Updates**: Changes to this governance system strictly by human only. 
