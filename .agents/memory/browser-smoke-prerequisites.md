---
name: Browser smoke prerequisites
description: Environment requirements for running Playwright browser checks in this workspace
---

Playwright browser checks require both the Chromium binary and the shared browser libraries declared in the workspace Nix configuration.

**Why:** A fresh browser install initially failed before any test code ran because the Nix image did not provide GLib, GBM, and related graphics/X11 libraries.

**How to apply:** Keep the Nix package list alongside the browser test setup, and install the Playwright Chromium binary before running the browser suite in a new environment.