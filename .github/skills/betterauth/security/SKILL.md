---
name: betterauth-security
description: Security configuration for Better Auth — rate limiting, CSRF protection, secrets management, session security, OAuth encryption, IP tracking, and audit logging. Reference when hardening auth deployments.
---

# Better Auth Security Configuration

## Secret Management

```ts
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET, // 32+ chars, high entropy
});
```

**Requirements:**

- Minimum 32 characters, 120+ bits entropy
- Generate: `openssl rand -base64 32`
- Never commit to version control

## Rate Limiting

```ts
rateLimit: {
  enabled: true,
  window: 10, // seconds
  max: 100, // requests per window
  storage: "secondary-storage", // "memory" | "database" | "secondary-storage"
  
  customRules: {
    "/api/auth/sign-in/email": { window: 60, max: 5 },
    "/api/auth/sign-up/email": { window: 60, max: 3 },
    "/api/auth/change-password": { window: 60, max: 3 },
    "/api/auth/request-password-reset": { window: 60, max: 3 },
  },
}
```

## Trusted Origins

```ts
trustedOrigins: [
  "https://app.example.com",
  "https://*.preview.example.com", // Wildcards supported
]

// Dynamic
trustedOrigins: async (request) => {
  const tenant = getTenantFromRequest(request);
  return [`https://${tenant}.myapp.com`];
}
```

## Session Security

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Refresh every 24h
  freshAge: 60 * 60, // 1 hour for sensitive actions
  
  cookieCache: {
    enabled: true,
    maxAge: 300, // 5 minutes
    strategy: "jwe", // "compact" | "jwt" | "jwe" (encrypted)
  },
}
```

## Cookie Security

```ts
advanced: {
  useSecureCookies: true,
  cookiePrefix: "myapp",
  defaultCookieAttributes: {
    sameSite: "strict",
    path: "/auth",
  },
  
  crossSubDomainCookies: {
    enabled: true,
    domain: ".example.com",
  },
}
```

## OAuth Security

```ts
account: {
  encryptOAuthTokens: true, // AES-256-GCM
  storeStateStrategy: "cookie", // or "database"
}
```

## IP Tracking

```ts
advanced: {
  ipAddress: {
    ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    disableIpTracking: false,
    ipv6Subnet: 64,
    trustedProxyHeaders: true, // Only behind trusted proxy
  },
}
```

## Audit Logging

```ts
databaseHooks: {
  session: {
    create: {
      after: async ({ data, ctx }) => {
        await auditLog("session.created", {
          userId: data.userId,
          ip: ctx?.request?.headers.get("x-forwarded-for"),
          userAgent: ctx?.request?.headers.get("user-agent"),
        });
      },
    },
  },
  user: {
    update: {
      after: async ({ data, oldData }) => {
        if (oldData?.email !== data.email) {
          await auditLog("user.email_changed", {
            userId: data.id,
            oldEmail: oldData?.email,
            newEmail: data.email,
          });
        }
      },
    },
  },
}
```

## Background Tasks (Serverless)

```ts
advanced: {
  backgroundTasks: {
    handler: (promise) => waitUntil(promise),
  },
}
```

## Password Security

```ts
emailAndPassword: {
  minPasswordLength: 12,
  maxPasswordLength: 256,
  revokeSessionsOnPasswordReset: true,
  resetPasswordTokenExpiresIn: 60 * 30, // 30 min
}
```

## Security Checklist

- [ ] Secret: 32+ chars, high entropy, not in VCS
- [ ] HTTPS: `baseURL` uses HTTPS
- [ ] Trusted Origins: All valid origins configured
- [ ] Rate Limiting: Enabled with limits
- [ ] CSRF: Enabled (`disableCSRFCheck: false`)
- [ ] Secure Cookies: Enabled in production
- [ ] OAuth Tokens: Encrypted if stored
- [ ] Background Tasks: Configured for serverless
- [ ] Audit Logging: Implemented via hooks
