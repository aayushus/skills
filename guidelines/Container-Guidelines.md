---
name: container-standards
description: The binding standards for containerised development and deployment. Covers Compose configuration, storage and volumes, environment and secrets, networking, image build and versioning, and operational settings. Applies wherever the project ships or runs in containers.
---

# Container Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding standard for containerised development and deployment. Container orchestration ensures every environment — local dev, CI, staging, production — is consistent, reproducible, and isolated. Deviations require an ADR ([README.md](README.md) §3).

> **See also:** [Architecture.md](Architecture.md) §2 — service topology and deployment boundaries | [Security.md](Security.md) §5 — secrets management (referenced from §4 here) | [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.8 — reviewer checklist for container changes

**Scope note.** This document covers containerisation at the project / Compose level. Kubernetes-level standards (Helm charts, HPA, network policies) live in the platform / infrastructure standards, not here. If your project uses only Kubernetes (no local Compose file), most of §2 does not apply; §3–§7 still do.

---

## Changelog

**v2.0 (1 July 2026):**

* **Added the scope note.** The previous version was Compose-focused but titled generically ("Container Guidelines"). Kubernetes users were reasonably confused about what applied. The scope note clarifies the split: this doc = Compose + image; Kubernetes-native concerns live elsewhere.
* **Renamed to "Container Standards"** to match the pack terminology.
* **Added §8 (deviation via ADR)** — pack-wide pattern.
* **Added the See-also cross-references** — links to Architecture.md, Security.md, and the reviewer checklist.
* **Added YAML frontmatter** for skill loading.
* **§4.3 (secrets) reworded** to explicitly cross-reference Security.md §5 as the source of truth. This doc doesn't restate secret-management policy; it just says how it applies in the container layer.

---

## 1. Principles

**1.1 Parity is paramount.** The environment on your laptop mirrors production as closely as possible. When it doesn't, the divergence is documented.

**1.2 Explicit over implicit.** Every dependency, port, and volume is declared explicitly. No "magic" host configurations, no reliance on ambient state.

**1.3 Fast feedback.** Container builds and startup times are optimised to keep the development loop tight. A dev iteration slower than 30 seconds is a bug.

**1.4 Security by isolation.** Networks and resource limits contain the blast radius of any single service.

---

## 2. Compose configuration

Use the modern Compose specification for orchestration.

* **Filenames:** `compose.yaml` (the modern canonical filename). Do not use the legacy `docker-compose.yml`.
* **Startup ordering:** every service defines a `healthcheck`. `depends_on` uses `condition: service_healthy` to enforce correct startup order. Startup ordering that relies on "wait long enough" is a review blocker.
* **Resource limits:** `deploy.resources.limits` is set even in development. This catches memory leaks early and prevents one runaway container from starving the host.

---

## 3. Storage & volumes

* **Persistence in dev:** use bind mounts (`./volumes/...`) for persistent data so it's visible, inspectable, and backupable.
* **Hot-reloading:** bind mounts for source code enable instant feedback in development.
* **Named volumes:** avoid for development data unless there is a specific performance reason (e.g., anonymous volume for `node_modules` on macOS/Windows to avoid osxfs slowdown).

---

## 4. Environment & secrets

**4.1 Substitution.** Use a `.env` file for Compose variable substitution.

**4.2 Explicitness.** Do NOT use `env_file` to bulk-import environment into containers. Instead, declare container environment variables under `environment:` using `${VAR}` syntax. This makes the container's contract visible in the YAML — a reviewer can see what a container consumes without opening a separate file.

**4.3 Secrets.** Secrets are never baked into images. Secret management (rotation, scoping, storage) is owned by [Security.md](Security.md) §5. In the container layer, this means:

* Secrets are injected at runtime through the environment or a mounted secrets file.
* `.env` files with real secrets are never committed. `.env.example` (with placeholder values) is committed to document the shape.
* CI-only secrets are injected from the CI's secrets manager, never checked in.

---

## 5. Networking

* **Isolation:** use custom networks to isolate service groups (e.g., a `frontend` network for the app + proxy, a `backend` network for the app + database). Cross-network communication is explicit.
* **No host networking:** `network_mode: host` is a review blocker. It breaks isolation and causes port conflicts across projects.
* **Port exposure:** only expose ports that need to be reachable from the host. Internal service-to-service communication uses the Docker network, not host ports.

---

## 6. Build & images

* **Version pinning:** pin image versions in `compose.yaml`. `:latest` tags are a review blocker — they produce non-deterministic environments and break "works on my machine" reasoning.
* **Multi-stage builds:** use `build.target` to target specific stages (`dev`, `test`, `prod`) from a single Dockerfile.
* **Caching:** use `build.cache_from` (or the equivalent BuildKit inline cache) to speed CI builds by pulling previous image layers.
* **Base image discipline:** base images come from a small allowlist (project-defined). Prefer distroless or minimal-base images for production stages to reduce attack surface.

---

## 7. Operational standards

* **Restart policies:**
  * `restart: unless-stopped` for long-running services.
  * `restart: "no"` for one-off migration or setup tasks (the "one-shot" pattern).
* **Logging:** define explicit logging configurations (`driver` and `options`). Uncapped logs are how disks fill up at 3am.
* **DRY:** use YAML anchors or `extends` to reduce duplication across similar service definitions.
* **Healthcheck design:** healthchecks test the service's real readiness (does it accept connections? Can it reach its database?), not just "is the process alive?". A container that starts but can't serve is worse than one that fails to start.

---

## 8. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). If a project has good reason to deviate — for example, a project that uses only Kubernetes and has no Compose file, or a legacy service using `docker-compose.yml` while a migration is planned — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). Deviations without an ADR are review blockers.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
