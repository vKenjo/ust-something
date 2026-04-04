---
name: supabase-storage-auth
description: Supabase storage and authentication workflows — bucket creation, file uploads, signed URLs, RLS policies, auth setup, and Better Auth integration. Triggers on "supabase bucket", "supabase upload", "supabase auth", "add storage rls", "create signed url".
license: CC-BY-4.0
metadata:
  author: Copilot
  version: 1.0.0
---

# Supabase Storage & Auth Skill

Procedural workflows for Supabase Storage operations, authentication setup, and RLS policies.

## Trigger Patterns

| Pattern | Action |
|---------|--------|
| `supabase bucket`, `create bucket` | Bucket creation workflow |
| `supabase upload`, `file upload` | Upload implementation |
| `supabase signed url`, `create signed url` | Signed URL generation |
| `supabase auth`, `setup auth` | Authentication setup |
| `add storage rls`, `storage policy` | RLS policy creation |
| `supabase client`, `setup supabase` | Client initialization |

---

## Workflow 1: Project Setup

**Trigger**: "setup supabase", "supabase client"

### Steps

1. **Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

1. **Create environment variables**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-only, never expose!
```

1. **Create client utilities**

**Browser Client** — `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server Client** — `lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

**Admin Client** — `lib/supabase/admin.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

// Only use on server! Never import in client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

1. **Create middleware** — `middleware.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

---

## Workflow 2: Bucket Creation

**Trigger**: "create bucket", "supabase bucket"

### Steps

1. **Determine bucket type**

| Type | Public URL? | RLS Required | Use Case |
|------|-------------|--------------|----------|
| Public | Yes | Optional | Avatars, public assets |
| Private | No (signed URLs) | Yes | Documents, sensitive files |

1. **Create bucket via Dashboard or SQL**

```sql
-- Via SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '{{bucketName}}',
  '{{bucketName}}',
  {{isPublic}}, -- true or false
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);
```

1. **Add RLS policies** (see Workflow 5)

2. **Generate TypeScript types** (optional)

```bash
npx supabase gen types typescript --project-id your-project > lib/supabase/database.types.ts
```

---

## Workflow 3: File Upload Implementation

**Trigger**: "supabase upload", "file upload"

### Client-Side Upload (with auth)

```typescript
// components/FileUpload.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function FileUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("{{bucketName}}")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;
      console.log("Uploaded:", data.path);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <input
      type="file"
      onChange={handleUpload}
      disabled={uploading}
      accept="image/*,application/pdf"
    />
  );
}
```

### Server-Side Upload (API Route)

```typescript
// app/api/upload/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify auth (use your auth solution)
  const userId = "..."; // Get from session/token
  
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from("{{bucketName}}")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: data.path });
}
```

### Resumable Upload (Large Files)

```typescript
// For files > 6MB
const { data, error } = await supabase.storage
  .from("{{bucketName}}")
  .uploadToSignedUrl(signedUploadUrl, file, {
    // Resumable upload options
  });
```

---

## Workflow 4: Signed URL Generation

**Trigger**: "signed url", "create signed url"

### Generate Signed URL for Download

```typescript
// Server Component or API Route
import { createClient } from "@/lib/supabase/server";

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from("{{bucketName}}")
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}
```

### Signed URL with Download Filename

```typescript
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("reports/q1-2024.pdf", 3600, {
    download: "Q1-Report-2024.pdf", // Custom download name
  });
```

### Batch Signed URLs

```typescript
const { data, error } = await supabase.storage
  .from("{{bucketName}}")
  .createSignedUrls(
    ["path/file1.pdf", "path/file2.pdf"],
    3600
  );
```

### Public URL (for public buckets)

```typescript
const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl("user123/avatar.jpg");

// With image transformation
const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl("user123/avatar.jpg", {
    transform: {
      width: 200,
      height: 200,
      resize: "cover",
      format: "webp",
    },
  });
```

---

## Workflow 5: Storage RLS Policies

**Trigger**: "storage rls", "add storage policy", "storage policy"

### Standard User-Owned Files Pattern

```sql
-- Enable RLS on storage.objects (usually already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- INSERT: Users can upload to their folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = '{{bucketName}}' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = '{{bucketName}}' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = '{{bucketName}}' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = '{{bucketName}}' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Public Read, Auth Write Pattern

```sql
-- Anyone can view
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = '{{bucketName}}');

-- Only authenticated can upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '{{bucketName}}');
```

### Better Auth Integration Pattern

```sql
-- When using Better Auth with synced profiles table
CREATE POLICY "Users can access own files via profile"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = '{{bucketName}}' AND
  (storage.foldername(name))[1] IN (
    SELECT id FROM profiles WHERE id = (
      SELECT current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);
```

---

## Workflow 6: Authentication Setup

**Trigger**: "supabase auth", "setup auth"

### Email + Password Auth

```typescript
// Sign Up
export async function signUp(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        // Custom user metadata
        full_name: "",
      },
    },
  });
  
  return { data, error };
}

// Sign In
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Sign Out
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
```

### OAuth Provider

```typescript
export async function signInWithGoogle() {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  
  return { data, error };
}
```

### Auth Callback Route

```typescript
// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
```

### Protected Server Component

```typescript
// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome {user.email}</h1>
    </div>
  );
}
```

### Protected Route Middleware

```typescript
// Add to middleware.ts
const protectedRoutes = ["/dashboard", "/settings", "/profile"];

// Inside middleware function, after getUser():
const isProtectedRoute = protectedRoutes.some((route) =>
  request.nextUrl.pathname.startsWith(route)
);

if (isProtectedRoute && !user) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}
```

---

## Output Checklist

After any storage or auth setup:

- [ ] Environment variables set in `.env.local`
- [ ] Client utilities created (browser, server, admin)
- [ ] Middleware refreshes sessions
- [ ] Buckets created with correct public/private setting
- [ ] RLS policies applied to storage.objects
- [ ] Auth callback route handles OAuth redirects
- [ ] Protected routes check authentication

---

## Quick Reference: Storage Methods

```typescript
// Upload
.upload(path, file, options?)
.uploadToSignedUrl(path, token, file, options?)

// Download
.download(path, options?)
.createSignedUrl(path, expiresIn, options?)
.createSignedUrls(paths, expiresIn, options?)
.getPublicUrl(path, options?)

// List
.list(path?, options?)

// Delete
.remove(paths)

// Move/Copy
.move(fromPath, toPath)
.copy(fromPath, toPath)
```

## Quick Reference: Auth Methods

```typescript
// Session
.getSession()
.getUser()
.refreshSession()
.setSession(access_token, refresh_token)

// Sign In
.signInWithPassword({ email, password })
.signInWithOAuth({ provider, options? })
.signInWithOtp({ email, options? })
.signInWithIdToken({ provider, token })

// Sign Up
.signUp({ email, password, options? })

// Sign Out
.signOut()

// Password
.resetPasswordForEmail(email, options?)
.updateUser({ password })

// Listeners
.onAuthStateChange((event, session) => {})
```
