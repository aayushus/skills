---
name: incident-response
description: The binding operational contract for when things go wrong. Covers severity levels, response roles, incident lifecycle, communication protocols, security-incident specifics, and the post-mortem process. Applies to everyone on-call or shipping to production.
---

# Incident Response Standards

**Version 2.0** · Last updated 1 July 2026

This document is the operational contract for when things go wrong. It defines how we detect, triage, and resolve incidents — whether they are security breaches, performance degradations, or total outages. The goal is to move from "chaos" to "coordinated response" as fast as possible to minimise impact on customers.

This is a **companion** to [Security.md](Security.md) (threat models) and [Performance.md](Performance.md) (SLOs/SLIs). When an SLO is breached or a threat is realised, this doc takes over.

> **See also:** [Security.md](Security.md) §15 — security incident specifics referenced from §6 | [Performance.md](Performance.md) — SLO breach signals that trigger incident declaration | [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.9 — reviewer checklist for incident-readiness of new features | [README.md](README.md) — pack stance and ADR process

---

## Changelog

**v2.0 (1 July 2026):**

* **Renamed to "Incident Response Standards"** for terminology consistency with the rest of the pack.
* **Added the reviewer-checklist cross-link** — Code-Review-Playbook §4.9 covers "new feature has a rollback plan, emits enough observability for on-call, runbook updated for new failure modes". Those are author responsibilities checked at PR time; this doc is what happens when the safety net is used.
* **Added §9 (deviation via ADR)** — pack-wide clause. Incident response is one of the areas where a deviation from the standard (e.g., a smaller team that can't staff distinct IC/Scribe/Comms roles) is legitimate but must be documented.
* **§8 runbook list stayed as-is.** Every entry is still project-specific ("add one if this project ..."). Some incident-response docs list runbooks as if they are universal; they aren't, and pretending they are is worse than acknowledging the gap.
* **§5.1 cadence tightened.** Previous version said IC provides a summary "every 20 mins" but the principle in §1.3 says "every 10–15 minutes". Reconciled to 15 min for internal, matching the principle.
* **Added YAML frontmatter** for skill loading.

---

## Table of contents

1. [Principles](#1-principles)
2. [Severity levels](#2-severity-levels)
3. [Response roles](#3-response-roles)
4. [Incident lifecycle](#4-incident-lifecycle)
5. [Communication protocols](#5-communication-protocols)
6. [Security incidents](#6-security-incidents)
7. [Post-mortem process](#7-post-mortem-process)
8. [Runbooks (Quick links)](#8-runbooks-quick-links)
9. [Deviating from this standard](#9-deviating-from-this-standard)

---

## 1. Principles

**1.1 Resolution over blame.** During an incident, the only thing that matters is restoring service. "Who did this?" is not a question we ask until the post-mortem.

**1.2 One commander, many workers.** Every incident has exactly one Incident Commander (IC). The IC does not write code; they coordinate. If you are told to do something by the IC, it is your top priority.

**1.3 Over-communicate internally, calibrate externally.** Keep the team updated in the incident channel every 15 minutes. Keep customers updated according to SLA, with vetted, calm language.

**1.4 Evidence preservation.** Especially for security incidents, don't "wipe and restart." Capture logs, memory snapshots, and disk state before remediation where possible.

---

## 2. Severity levels

| Level | Impact | Target Response | Target Resolution |
| --- | --- | --- | --- |
| **SEV-1 (Critical)** | Production down, data loss, or major security breach affecting multiple tenants. | < 15 mins | < 4 hours |
| **SEV-2 (High)** | Major feature broken, significant performance degradation, or single-tenant breach. | < 30 mins | < 12 hours |
| **SEV-3 (Normal)** | Minor feature broken, intermittent errors, or low-risk security finding. | < 4 hours | < 3 days |
| **SEV-4 (Low)** | UI bugs, documentation errors, or non-functional issues. | < 24 hours | Next release |

---

## 3. Response roles

For SEV-1 and SEV-2 incidents, roles are explicitly assigned:

* **Incident Commander (IC):** the single point of decision-making. Responsible for the strategy, assigning tasks, and declaring the incident resolved.
* **Scribe:** records the timeline in real-time (in team chat or a shared doc). Key for the post-mortem.
* **Communications Lead (Comms):** manages the status page and coordinates with Customer Success. Prevents engineers from being interrupted by stakeholders.
* **Operations/Security Lead:** the "boots on the ground" leading the technical investigation or remediation.

Smaller teams may combine roles — one person as IC + Comms is common at low scale. Combining IC + Ops is a review flag; the IC should not also be the person elbow-deep in the code.

---

## 4. Incident lifecycle

### 4.1 Detection & declaration

Anyone can flag a potential incident. If it looks like SEV-1 or SEV-2, declare it in the `#incidents` channel:
`@here SEV-1 Incident Declared: Database connection pool exhausted. IC is [Name].`

### 4.2 Triage & containment

Identify the blast radius. Can we stop the bleeding? (Disable a buggy feature flag, roll back a deploy, block an attacking IP.)

### 4.3 Investigation & eradication

Find the root cause. Once contained, remove the cause (fix the code, patch the vuln, scale the DB).

### 4.4 Recovery

Restore service gradually. Monitor metrics for "false recovery" — where the system looks fine but is failing silently.

---

## 5. Communication protocols

### 5.1 Internal

* All talk happens in the specific `#incident-[date]-[brief-desc]` channel.
* IC provides a "Current State" summary every 15 minutes:
  * **Status:** (Investigating / Containing / Recovering)
  * **Impact:** (Which tenants? Which features?)
  * **Next Steps:** (What are we doing right now?)

### 5.2 External

* **Status page:** update within 15 minutes for SEV-1. "We are investigating reports of [Issue]. We will provide an update in 30 minutes."
* **Direct outreach:** for SEV-1 security breaches, the IC and Legal coordinate direct notification to affected partners within the contractually mandated window (usually 24–72h).

---

## 6. Security incidents

Special rules for security (see [Security.md](Security.md) §15.4):

* **Silence is key:** do not discuss the vulnerability in public channels or commit messages. Attackers watch.
* **Isolation:** if a tenant is breached, isolate that tenant's resources immediately.
* **Legal:** IC must involve the legal lead if PII is confirmed to be exfiltrated.

---

## 7. Post-mortem process

**Mandatory for SEV-1 and SEV-2.** Held within 48 hours of resolution.

* **Format:** blame-free. Focus on "How did the system allow this?" not "Why did the person do this?"
* **Output:** a document containing:
  1. Timeline
  2. Root cause (the "5 Whys" or equivalent structured analysis)
  3. Successes (what went well?)
  4. Action items (P0/P1 tasks to prevent recurrence)
* **Review:** all action items enter the issue tracker and are tracked to completion. Post-mortems where action items are never closed lose the trust of the team.

---

## 8. Runbooks (Quick links)

* Database recovery runbook — add one if this project owns persistent data.
* Rollback procedure — add one if this project has deployable services.
* DDoS mitigation runbook — add one if this project exposes public endpoints.
* Secret rotation runbook — add one if this project stores credentials or API keys.

Runbooks are project-specific by design. A project that ships to production without at least a rollback runbook is not ready to ship.

---

## 9. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). If a project has good reason to deviate — for example, a small team that combines roles differently, or a project where the severity thresholds don't map cleanly (an internal tool with no external-tenant impact) — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). Deviations without an ADR are review blockers.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026 · Update after every SEV-1 post-mortem.*
