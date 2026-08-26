# Operations: Git Workflow, PR Sizing & Release Strategy

This document defines standards for branching strategies, pull request hygiene, feature toggles, and version releases.

---

## 1. Branching Strategy: Trunk-Based Development

Adopt **Trunk-Based Development** with short-lived feature branches:

1. **Short-Lived Branches**: Branches should live for $\le 2\text{ days}$. Merge frequently into `main`.
2. **Branch Naming**:
   - `feat/feature-name` (New functionality)
   - `fix/bug-description` (Bug fix)
   - `refactor/component-name` (Refactoring without behavior change)
   - `chore/task-name` (Tooling, deps, configs)

---

## 2. Pull Request Sizing Caps

**Rule:** PR size directly correlates with bug rate and AI review quality. Keep PRs small and focused.

| Size Metric | Recommended Target | Hard Maximum Cap | Action if Exceeded |
|---|---|---|---|
| **Lines Changed** | $\le 300\text{ lines}$ | $500\text{ lines}$ | Split into stacked PRs |
| **Files Modified** | $\le 10\text{ files}$ | $20\text{ files}$ | Split by domain module |
| **Review Time** | $< 15\text{ mins}$ | $30\text{ mins}$ | High risk of rubber-stamping |

*Exceptions: Auto-generated lockfiles, database migration dumps, or initial project scaffolding.*

---

## 3. Feature Flags & Safe Deployment

To decouple code deployment from feature release:

1. **Dark Shipping**: Merge completed code behind a feature toggle flag before turning it on for users.
2. **Flag Lifecycle**:
   ```
   Created → Activated in Development → Beta / Staging → 100% Production → Flag Deleted (Technical Debt Cleanup)
   ```
3. **Delete Stale Flags**: Remove the conditional check and dead branch within 14 days of full rollout.

---

## 4. Conventional Commits

Format all commit messages according to the Conventional Commits specification:

```
<type>(<optional-scope>): <short summary in imperative mood>

[optional body explaining WHY]

[optional footer: Closes #123, BREAKING CHANGE: ...]
```

### Allowed Types
- `feat`: New user-facing feature (bumps MINOR).
- `fix`: Bug fix (bumps PATCH).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance improvement.
- `test`: Adding or correcting tests.
- `docs`: Documentation changes only.
- `chore`: Build process, dependencies, or auxiliary tools.

---

## 5. Semantic Versioning (SemVer)

Versions follow `MAJOR.MINOR.PATCH`:
- **MAJOR** (`1.0.0 → 2.0.0`): Incompatible API changes, breaking DB schema overhauls.
- **MINOR** (`1.1.0 → 1.2.0`): Backwards-compatible new features.
- **PATCH** (`1.1.1 → 1.1.2`): Backwards-compatible bug fixes.
