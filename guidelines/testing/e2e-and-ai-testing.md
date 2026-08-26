# Testing: End-to-End (E2E) & AI Model Evaluation

This document defines standards for browser-based end-to-end testing, visual regression, and testing AI/LLM systems.

---

## 1. End-to-End (E2E) Testing (Playwright)

E2E tests verify the critical user journeys through the real browser UI against a staging environment.

### 1.1 Priority Scope
Focus E2E tests strictly on high-value business flows:
1. User registration, authentication, and password reset.
2. Core creation workflow (e.g., creating a project, document, or order).
3. Billing / subscription checkout flow.
4. Primary data export / report generation.

### 1.2 Flakiness Prevention Rules
- **No Arbitrary Sleeps**: Never use `page.waitForTimeout(3000)`. Always wait on deterministic UI states or API responses:
  ```ts
  // ❌ Flaky: arbitrary sleep
  await page.waitForTimeout(2000);

  // ✅ Stable: locator auto-waiting
  await expect(page.getByRole('button', { name: 'Save Project' })).toBeVisible();
  await page.getByRole('button', { name: 'Save Project' }).click();
  await expect(page.getByText('Project saved successfully')).toBeVisible();
  ```
- **Dynamic Test Users**: Each test run creates a fresh, isolated user account to prevent test collision.

---

## 2. Visual Regression Testing

- **Scope**: Components in the design system (`design/`) and key product layouts.
- **Viewport Coverage**: Test at minimum two viewports:
  - Mobile: `390 × 844` (iPhone view)
  - Desktop: `1440 × 900`
- **Theme Testing**: Verify both `data-theme="light"` and `data-theme="dark"` states.

---

## 3. AI & LLM System Evaluation

Traditional assert-equals testing fails on probabilistic LLM responses. Use structured evaluation pipelines:

### 3.1 Golden Evaluation Datasets
Maintain a version-controlled dataset of 50+ diverse test cases containing:
- Sample user inputs (including edge cases, adversarial inputs, and long contexts).
- Expected key information / entities that must be present.
- Disallowed information / hallucination traps that must NOT be present.

### 3.2 Automated Evaluation Rubrics
1. **Deterministic Schema Verification**: Verify the output parses against strict Zod/Pydantic schemas with 100% success.
2. **LLM-as-a-Judge**: Use an automated scoring prompt with a capable evaluation model to grade generated responses against a 1–5 rubric:
   - **Relevance**: Did the model answer the user's specific prompt?
   - **Faithfulness**: Is the answer derived strictly from the provided RAG context?
   - **Safety / Policy**: Did the model refuse malicious or out-of-bounds requests?

### 3.3 Regression Capture
Whenever a user reports a hallucination, safety bypass, or poor AI output:
1. Add the prompt and failure case to the Golden Evaluation Set.
2. Adjust system prompts, temperature, or retrieval logic.
3. Verify the full evaluation set passes before merging the fix.

### 3.4 CI Cost Optimization
- **PR CI**: Run fast deterministic schema tests and a small 5-prompt evaluation smoke test.
- **Nightly CI**: Run the complete 100+ case evaluation matrix and generate trend reports.
