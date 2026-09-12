---
name: Workspace dependency checks
description: Dependency-install prerequisite for trustworthy repository-wide checks
---

When a workspace-wide check reports a missing declared tool, restore dependencies from the checked-in lockfile before interpreting the remaining compiler output.

**Why:** A partially populated `node_modules` can stop one package before later packages run, masking independent source errors and making the first failure misleading.

**How to apply:** Use the repository lockfile to restore dependencies, then rerun the complete check rather than narrowing validation to the package that failed first.