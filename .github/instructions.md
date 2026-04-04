# Template Setup Guide

This workspace is a **template** for projects that use a Next.js Web App with Convex and Supabase. When a user asks for help setting up this template or filling in placeholders, follow the guide below.

---

## Quick Setup Checklist

1. **Copy the config file** — `local-dev-config.json.example` → `local-dev-config.json`
2. **Fill in config values** — Set your WA repo folder name and project name.
3. **Fill in copilot-instructions.md placeholders** — Replace all `{{PLACEHOLDER}}` markers in `.github/copilot-instructions.md`
4. **Clone/create your sub-repo** — Place your WA repo in the workspace root.
5. **Test local dev** — Run `npm install` and `npm run dev` in the web application folder.

---

## Placeholder Reference

When helping users fill in `.github/copilot-instructions.md`, use this reference:

| Placeholder | Where to Find the Value | Example |
|-------------|------------------------|---------|
| `{{PROJECT_NAME}}` | User's project name — ask them | "Shelf Quality Audit (SQA)" |
| `{{PROJECT_SHORT_NAME}}` | Abbreviation of above | "SQA" |
| `{{WORKSPACE_DIR}}` | The parent folder name containing this template | "02-shelf-quality-audit" |
| `{{WA_REPO_NAME}}` | Must match `waRepoPath` in `local-dev-config.json` | "cqa-sqa-web" |
| `{{SUPABASE_URL}}` | The deployed Supabase URL | "<https://xxxx.supabase.co>" |
| `{{CONVEX_URL}}` | The deployed Convex URL | "<https://xxxx.convex.cloud>" |
| `{{DOMAIN_DESCRIPTION}}` | One-line summary of what the app does | "store shelf quality auditing" |

---

## Config File Reference

`local-dev-config.json` contains:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `projectName` | No | Human-readable project name (for display only) | "my-project" |
| `waRepoPath` | Yes | Folder name of the WA repo (relative to workspace root) | "my-project-web" |

---

## Recommended Fill-In Order

When helping a user set up the template, follow this order:

1. **Ask for the project name** — This determines `{{PROJECT_NAME}}`, `{{PROJECT_SHORT_NAME}}`, and `{{DOMAIN_DESCRIPTION}}`
2. **Ask for repo folder name** — This determines `{{WA_REPO_NAME}}`
3. **Ask for URLs** — Supabase URL and Convex URL if available.
4. **Create `local-dev-config.json`** — Fill in the config from the `.example` file.
5. **Replace placeholders in copilot-instructions.md** — Do a find-and-replace for each `{{PLACEHOLDER}}`
6. **Fill in the content tables** — Help populate:
   - Key API routes / mutations (§ 1)
   - Frontend dependencies (§ 1)
   - Sub-repo instruction references (§ 2)
   - Domain model table (§ 3)
   - Environment variables (§ 3)
   - Database tables/schemas (§ 9)

---

## Tech Stack Assumptions

This template assumes:

- **Frontend**: Next.js TypeScript Web App (App Router)
- **Backend / Real-time Database**: Convex
- **Relational DB / Auth / Storage**: Supabase (PostgreSQL)
- **Local Tooling**: Node.js + npm, Convex Dev
