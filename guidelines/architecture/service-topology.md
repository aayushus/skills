# Architecture: Service Topology & Boundaries

This document defines the structural organization of services and modules. Local project rules and actual stack choices take precedence over examples here.

---

## 1. Core Principles

1. **Modular Monolith First**: Start with a single deployable application organized into strict domain modules. Do not split into microservices until team boundaries or distinct scaling requirements demand it.
2. **Domain-Driven Organization**: Organize code by business domain (e.g., `modules/projects/`, `modules/billing/`), never by technical layer (`controllers/`, `models/`, `views/`).
3. **Explicit Seams**: Every module exposes an explicit public API (e.g., `public.ts` or `__init__.py`). Other modules must only import from public exports, never internal private files.

---

## 2. Directory Layout

```
src/
├── modules/
│   ├── auth/                       # Domain module
│   │   ├── routes.ts               # HTTP routes / controllers
│   │   ├── service.ts              # Business logic
│   │   ├── repository.ts           # Database queries
│   │   ├── types.ts                # Domain types
│   │   └── public.ts               # Public exports for other modules
│   ├── projects/
│   │   ├── ...
│   │   └── public.ts
│   └── billing/
│       ├── ...
│       └── public.ts
└── shared/                         # Cross-cutting infrastructure only
    ├── db/                         # Database client connection
    ├── http/                       # HTTP client wrappers, error handlers
    ├── logger/                     # Structured JSON logging
    └── errors/                     # App-wide error classes & Result types
```

---

## 3. Module Communication & Boundary Rules

### 3.1 Public Seams
```ts
// modules/projects/public.ts
export { ProjectsService } from './service';
export type { Project, ProjectId, CreateProjectInput } from './types';
// Private implementations (repository, internal helpers) are NOT exported.
```

### 3.2 ESLint Boundary Enforcement
Enforce module isolation using ESLint's `no-restricted-imports`:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["**/modules/*/!(public)", "**/modules/*/!(public)/**"],
        "message": "Import from the module's public.ts seam only."
      }]
    }]
  }
}
```

---

## 4. When to Extract a Separate Service

Extract a module into a dedicated service only when:
- **Heterogeneous Runtime Requirements**: The task requires a specialized runtime (e.g., Python AI service for embeddings/PyTorch vs. Node.js web server).
- **Independent Scaling Profile**: The workload is compute-heavy (e.g., video transcoding, vector indexing, batch PDF generation) and starves the main HTTP event loop.
- **Strict Blast-Radius Isolation**: Untrusted third-party script execution or sandboxed code evaluation.

---

## 5. Anti-Patterns to Avoid

- ❌ **The `utils/` Dumping Ground**: Generic utility folders accrete dead code. Keep helpers scoped inside the domain module or inside a typed `shared/{concern}/` folder.
- ❌ **Circular Dependencies**: Modules importing each other circularly indicate missing domain boundaries. Extract shared entities to a shared submodule or domain event.
- ❌ **Shared Database Tables Without Owner**: Each table in the database should belong to exactly one domain module. Other modules access that data via the owner module's service methods.
