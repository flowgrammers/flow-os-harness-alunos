---
description: Restate requirements, assess risks, and create step-by-step implementation plan. WAIT for user CONFIRM before touching any code.
---

# Plan Command

This command invokes the **planner** agent to create a comprehensive implementation plan before writing any code.

## What This Command Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Identify Risks** - Surface potential issues and blockers
3. **Create Step Plan** - Break down implementation into phases
4. **Wait for Confirmation** - MUST receive user approval before proceeding

## When to Use

Use `/plan` when:
- Starting a new feature
- Making significant architectural changes
- Working on complex refactoring
- Multiple files/components will be affected
- Requirements are unclear or ambiguous

## Phase 0 — Socratic Clarification (BEFORE planning)

Before restating requirements or creating any plan, generate 3-5 targeted questions to clarify:

1. **Scope boundaries**: What is explicitly OUT of scope?
2. **Success criteria**: How will we know this is done? What does "working" look like?
3. **Constraints**: Are there technical constraints, deadlines, or dependencies not mentioned?
4. **Prior art**: Has something similar been attempted before? What happened?
5. **Risk appetite**: Is this a "move fast" situation or "measure twice, cut once"?

**How to resolve them depends on the project level (ask → assume):**

- **N1 Bazuca** (default): do NOT block on questions. Answer each point yourself with the most reasonable default and record them as explicit **Assumptions** at the top of the plan (assumption + default + why) for the user to validate by reading. Ask directly (max 2 questions) ONLY if a point is material AND irreversible (data loss, external cost, hard-to-reverse architecture).
- **N2 Enterprise / N3 Legado**: present the questions to the user and WAIT for answers before proceeding to Phase 1. Do NOT skip. Do NOT answer them yourself. Unanswered material points become `[NEEDS CLARIFICATION]` markers in the plan.

## How It Works

The planner agent will:

1. **Analyze the request** and restate requirements in clear terms
2. **Break down into phases** with specific, actionable steps
3. **Identify dependencies** between components
4. **Assess risks** and potential blockers
5. **Estimate complexity** (High/Medium/Low)
6. **Present the plan** and WAIT for your explicit confirmation

## Constitution Check (by project level)

Every plan includes a check against the harness rules (`${CLAUDE_PLUGIN_ROOT}/rules/`), graded by project level:

- **N1 Bazuca** (default): implicit — rules already apply via CLAUDE.md; NO extra section in the plan. Zero friction.
- **N2 Enterprise** (`docs/escopo/editais/` OR `docs/escopo/contratos/` has content — a single contract already qualifies; same logic as the `mode-detector` hook): include a short **"Verificação de Princípios"** section in the plan — relevant rules + how the plan complies with each.
- **N3 Legado** (client stack detected: `CODEBASE_ANALYSIS.md`, `pom.xml`, `build.gradle`, `*.csproj`, `go.mod`, `composer.json`, `Gemfile`): also include a **Complexity Tracking** table — every rule violation "required by the existing codebase" documents: violation | why needed | why the simpler alternative was rejected. Undocumented violations = incomplete plan.

## Example Usage

```
User: /plan I need to add real-time notifications when markets resolve

Agent (planner):
# Implementation Plan: Real-Time Market Resolution Notifications

## Requirements Restatement
- Send notifications to users when markets they're watching resolve
- Support multiple notification channels (in-app, email, webhook)
- Ensure notifications are delivered reliably
- Include market outcome and user's position result

## Implementation Phases

### Phase 1: Database Schema
- Add notifications table with columns: id, user_id, market_id, type, status, created_at
- Add user_notification_preferences table for channel preferences
- Create indexes on user_id and market_id for performance

### Phase 2: Notification Service
- Create notification service in lib/notifications.ts
- Implement notification queue using BullMQ/Redis
- Add retry logic for failed deliveries
- Create notification templates

### Phase 3: Integration Points
- Hook into market resolution logic (when status changes to "resolved")
- Query all users with positions in market
- Enqueue notifications for each user

### Phase 4: Frontend Components
- Create NotificationBell component in header
- Add NotificationList modal
- Implement real-time updates via Supabase subscriptions
- Add notification preferences page

## Dependencies
- Redis (for queue)
- Email service (SendGrid/Resend)
- Supabase real-time subscriptions

## Risks
- HIGH: Email deliverability (SPF/DKIM required)
- MEDIUM: Performance with 1000+ users per market
- MEDIUM: Notification spam if markets resolve frequently
- LOW: Real-time subscription overhead

## Estimated Complexity: MEDIUM
- Backend: 4-6 hours
- Frontend: 3-4 hours
- Testing: 2-3 hours
- Total: 9-13 hours

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

## Important Notes

**CRITICAL**: The planner agent will **NOT** write any code until you explicitly confirm the plan with "yes" or "proceed" or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

## Integration with Other Commands

After planning:
- Use `/tdd` to implement with test-driven development
- Use `/build-fix` if build errors occur
- Use `/code-review` to review completed implementation

> **Need deeper planning?** Use `/prp-plan` for artifact-producing planning with PRD integration, codebase analysis, and pattern extraction. Use `/prp-implement` to execute those plans with rigorous validation loops.

## Related Agents

This command invokes the `planner` agent provided by ECC.

For manual installs, the source file lives at:
`agents/planner.md`
