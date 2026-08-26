# Operations: Incident Response & Post-Mortems

This document defines standards for triaging, coordinating, and resolving production incidents.

---

## 1. Core Principles

1. **Resolution Over Blame**: During an active incident, all focus is on restoring service. Retrospectives and root-cause analysis happen only after resolution.
2. **One Incident Commander (IC)**: Every SEV-1/SEV-2 incident has exactly one IC who directs the response and coordinates actions.
3. **Preserve Evidence**: Before rebooting or purging resources, snapshot memory, capture logs, and preserve database state for post-incident analysis.

---

## 2. Severity Levels

| Severity | Definition & Impact | Response SLA | Target Resolution |
|---|---|---|---|
| **SEV-1 (Critical)** | Core service down, data loss, or active security breach affecting multiple tenants. | $< 15\text{ mins}$ | $< 4\text{ hours}$ |
| **SEV-2 (High)** | Major feature broken or severe degradation without immediate workaround. | $< 30\text{ mins}$ | $< 12\text{ hours}$ |
| **SEV-3 (Normal)** | Minor feature bug or intermittent failure with workaround available. | $< 4\text{ hours}$ | $< 3\text{ days}$ |
| **SEV-4 (Low)** | Cosmetic UI defects, minor documentation errors. | $< 24\text{ hours}$ | Next scheduled release |

---

## 3. Incident Lifecycle

```
1. Detection  → Monitoring alert or customer report triggers incident declaration.
2. Triage     → Assign Severity Level (SEV-1 to SEV-4) and designate Incident Commander.
3. Mitigate   → Roll back recent deployments, apply rate limits, or scale infrastructure.
4. Resolve    → Verify metric stability across 30 minutes of normal traffic.
5. Post-Mortem→ Conduct blameless retrospective and publish action items within 48 hours.
```

---

## 4. Roles for SEV-1 and SEV-2 Incidents

- **Incident Commander (IC)**: Holds the decision-making authority; directs tasks; declares resolution.
- **Operations Lead**: Technical lead investigating logs, metrics, code diffs, and executing rollbacks/fixes.
- **Communications Lead**: Updates customer status page every 15–30 minutes with calm, factual status notes.
- **Scribe**: Records real-time timestamped events, hypotheses, and actions in the incident channel.

---

## 5. Blameless Post-Mortem Template

Every SEV-1 or SEV-2 requires a blameless post-mortem document within 48 hours:

```markdown
# Incident Post-Mortem: [Incident Title]
**Date**: YYYY-MM-DD · **Severity**: SEV-1 · **Duration**: 42 mins

## Executive Summary
Brief paragraph explaining what occurred, customer impact, and how it was resolved.

## Timeline (UTC)
- 14:02 - Automated alert fired for API 500 error spike.
- 14:08 - Incident Commander declared SEV-1.
- 14:15 - Identified faulty migration deployed in release v1.4.2.
- 14:22 - Executed rollback to v1.4.1.
- 14:35 - Error rates normalized; incident declared resolved.

## Root Cause
Detailed technical explanation of the failure mechanism.

## Action Items (Prevent Recurrence)
- [ ] Add pre-merge migration lock test (Owner: Jane, Due: May 1)
- [ ] Improve synthetic health check alerts (Owner: Alex, Due: May 3)
```
