---
name: convex-db
description: Convex database operations — schema definition, CRUD mutations, queries, and Better Auth integration. Use for "create table", "add CRUD for X", "add query for Y", "protect with auth". Triggers on "convex schema", "convex table", "convex crud", "convex query", "convex mutation", "add auth check".
license: CC-BY-4.0
metadata:
  author: Copilot
  version: 1.0.0
---

# Convex Database Skill

Procedural workflows for Convex schema definition, CRUD operations, and auth-protected functions.

## Trigger Patterns

| Pattern | Action |
|---------|--------|
| `convex schema`, `define schema`, `create table` | Schema definition workflow |
| `convex crud`, `add crud for X` | Full CRUD generation |
| `convex query`, `add query for X` | Query function generation |
| `convex mutation`, `add mutation for X` | Mutation function generation |
| `protect with auth`, `add auth check` | Add authentication to existing functions |
| `convex index`, `add index` | Index optimization |

---

## Workflow 1: Schema Definition

**Trigger**: "create table", "define schema", "convex schema"

### Steps

1. **Gather requirements**
   - Entity name (singular, e.g., "item", "post", "comment")
   - Fields with types
   - Relationships (belongs to, has many)
   - Expected query patterns (for index design)

2. **Generate or update schema.ts**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  {{entityPlural}}: defineTable({
    // If user-owned
    userId: v.string(),
    
    // Fields
    {{#each fields}}
    {{name}}: {{convexType}},
    {{/each}}
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Indexes based on query patterns
    .index("by_user", ["userId"])
    {{#each additionalIndexes}}
    .index("{{name}}", [{{fields}}])
    {{/each}},
});
```

1. **Type mapping reference**

| User says | Convex validator |
|-----------|------------------|
| string, text | `v.string()` |
| number, int, integer | `v.number()` |
| boolean, bool | `v.boolean()` |
| optional X | `v.optional(v.X())` |
| enum, status | `v.union(v.literal("a"), v.literal("b"))` |
| array of X | `v.array(v.X())` |
| reference to Y | `v.id("Y")` |
| object | `v.object({ ... })` |
| any | `v.any()` |

1. **Verify**: Run `npx convex dev` to push schema

---

## Workflow 2: CRUD Generation

**Trigger**: "add crud for X", "convex crud"

### Generates 5 functions

1. **create** — Insert new document
2. **get** — Get single by ID
3. **list** — List with filters/pagination
4. **update** — Patch existing document
5. **remove** — Delete document

### Template: `convex/{{entityPlural}}.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Auth helper
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  return identity;
}

// CREATE
export const create{{Entity}} = mutation({
  args: {
    {{#each createFields}}
    {{name}}: {{validator}},
    {{/each}}
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    const now = Date.now();
    
    return await ctx.db.insert("{{entityPlural}}", {
      userId: identity.subject,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// GET
export const get{{Entity}} = query({
  args: { id: v.id("{{entityPlural}}") },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    const doc = await ctx.db.get(args.id);
    
    if (!doc) {
      throw new ConvexError("{{Entity}} not found");
    }
    if (doc.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }
    
    return doc;
  },
});

// LIST
export const list{{EntityPlural}} = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthenticatedUser(ctx);
    
    return await ctx.db
      .query("{{entityPlural}}")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// UPDATE
export const update{{Entity}} = mutation({
  args: {
    id: v.id("{{entityPlural}}"),
    {{#each updateFields}}
    {{name}}: v.optional({{validator}}),
    {{/each}}
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    const doc = await ctx.db.get(args.id);
    
    if (!doc) {
      throw new ConvexError("{{Entity}} not found");
    }
    if (doc.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }
    
    const { id, ...updates } = args;
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    await ctx.db.patch(id, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });
  },
});

// DELETE
export const remove{{Entity}} = mutation({
  args: { id: v.id("{{entityPlural}}") },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    const doc = await ctx.db.get(args.id);
    
    if (!doc) {
      throw new ConvexError("{{Entity}} not found");
    }
    if (doc.userId !== identity.subject) {
      throw new ConvexError("Not authorized");
    }
    
    await ctx.db.delete(args.id);
  },
});
```

---

## Workflow 3: Query Generation

**Trigger**: "add query for X", "convex query"

### Steps

1. **Determine query type**

| Type | Use case | Pattern |
|------|----------|---------|
| Get by ID | Single document fetch | `.get(id)` |
| List all | User's documents | `.query().withIndex().collect()` |
| Filtered | By status, date range, etc. | `.withIndex().filter()` |
| Paginated | Large lists | `.paginate(paginationOpts)` |
| Aggregation | Count, sum | Manual iteration (no native aggregates) |

1. **Check index exists** — Query must use index or will scan entire table

2. **Generate query function**

```typescript
export const {{queryName}} = query({
  args: {
    {{#each args}}
    {{name}}: {{validator}},
    {{/each}}
  },
  handler: async (ctx, args) => {
    {{#if requiresAuth}}
    const identity = await getAuthenticatedUser(ctx);
    {{/if}}
    
    return await ctx.db
      .query("{{table}}")
      .withIndex("{{indexName}}", (q) => 
        {{#each indexFields}}
        q.eq("{{field}}", {{value}}){{#unless @last}}.{{/unless}}
        {{/each}}
      )
      {{#if hasFilter}}
      .filter((q) => {{filterExpression}})
      {{/if}}
      {{#if hasOrder}}
      .order("{{order}}")
      {{/if}}
      {{#if paginated}}
      .paginate(args.paginationOpts);
      {{else}}
      .collect();
      {{/if}}
  },
});
```

---

## Workflow 4: Auth Integration

**Trigger**: "protect with auth", "add auth check"

### For existing unprotected functions

1. **Add auth helper** (if not present)

```typescript
import { ConvexError } from "convex/values";

async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  return identity;
}
```

1. **Wrap handler with auth check**

Before:

```typescript
export const myQuery = query({
  args: { ... },
  handler: async (ctx, args) => {
    // ... function body
  },
});
```

After:

```typescript
export const myQuery = query({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedUser(ctx);
    // ... function body with identity.subject available
  },
});
```

1. **Add ownership checks for mutations**

```typescript
const doc = await ctx.db.get(args.id);
if (!doc) {
  throw new ConvexError("Not found");
}
if (doc.userId !== identity.subject) {
  throw new ConvexError("Not authorized");
}
```

---

## Workflow 5: Index Optimization

**Trigger**: "add index", "convex index", "optimize query"

### Steps

1. **Identify query pattern** — What fields are being filtered/sorted?

2. **Design compound index** — Most selective field first

```typescript
// For query: "get user's items with status = 'active' ordered by createdAt"
.index("by_user_status_created", ["userId", "status", "createdAt"])
```

1. **Update schema.ts** — Add index to table definition

2. **Update query** — Use `.withIndex()` instead of `.filter()`

### Index Rules

- **Equality fields first**: Fields used with `eq()` go first in index
- **Range field last**: Field used with `gt()`, `lt()`, `gte()`, `lte()` goes last
- **Order must match**: `.order()` requires index to support that order
- **No skipping**: Can't skip fields in a compound index

---

## Better Auth Setup Reference

### 1. Install dependencies

```bash
npm install @better-auth/core @better-auth/convex
```

### 2. Configure `convex/auth.config.ts`

```typescript
export default {
  providers: [
    // Configure your Better Auth provider here
  ],
};
```

### 3. Use in frontend

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Queries automatically get auth context
const items = useQuery(api.items.listItems);

// Mutations automatically get auth context
const createItem = useMutation(api.items.createItem);
```

---

## Output Checklist

After any schema or function change:

- [ ] Schema pushed: `npx convex dev` shows no errors
- [ ] Types generated: `convex/_generated/` updated
- [ ] Indexes support all query patterns
- [ ] Auth checks present on user-facing functions
- [ ] Ownership checks present on update/delete mutations
- [ ] Error handling uses `ConvexError` for user-facing errors

---

## Quick Reference: Convex Validators

```typescript
import { v } from "convex/values";

v.string()              // string
v.number()              // number (float64)
v.boolean()             // boolean
v.null()                // null
v.id("tableName")       // document reference
v.array(v.string())     // string[]
v.object({ ... })       // nested object
v.optional(v.string())  // string | undefined
v.union(v.literal("a"), v.literal("b"))  // "a" | "b"
v.any()                 // any (avoid if possible)
```

## Quick Reference: Query Operators

```typescript
// In .withIndex() callback
q.eq("field", value)      // field === value
q.neq("field", value)     // field !== value (requires index)
q.lt("field", value)      // field < value
q.lte("field", value)     // field <= value
q.gt("field", value)      // field > value
q.gte("field", value)     // field >= value

// In .filter() callback
q.eq(q.field("field"), value)
q.and(condition1, condition2)
q.or(condition1, condition2)
q.not(condition)
```
