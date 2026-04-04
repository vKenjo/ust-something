`---
name: betterauth-email-password
description: Email/password authentication configuration for Better Auth — email verification, password reset, password policies, and secure hashing. Reference when implementing login flows
---

# Better Auth Email & Password

## Configuration

```ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  minPasswordLength: 12,
  maxPasswordLength: 256,
  resetPasswordTokenExpiresIn: 60 * 30, // 30 min
  revokeSessionsOnPasswordReset: true,
  
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<a href="${url}">Reset Password</a>`,
    });
  },
},

emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${url}">Verify Email</a>`,
    });
  },
  sendOnSignUp: true,
},

user: {
  changeEmail: {
    enabled: true,
    sendChangeEmailVerification: async ({ user, newEmail, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm email change",
        html: `<a href="${url}">Confirm change to ${newEmail}</a>`,
      });
    },
  },
},
```

## Sign Up

```ts
await authClient.signUp.email({
  email,
  password,
  name, // Required
  callbackURL: "https://example.com/dashboard", // Absolute URL
});
```

## Sign In

```ts
await authClient.signIn.email({
  email,
  password,
  callbackURL: "https://example.com/dashboard",
});
```

## Password Reset

```ts
// Request reset
await authClient.requestPasswordReset({
  email,
  redirectTo: "https://example.com/reset-password",
});

// Submit new password (token from URL)
await authClient.resetPassword({ token, newPassword });
```

## Change Password

```ts
await authClient.changePassword({
  currentPassword,
  newPassword,
  revokeOtherSessions: true,
});
```

## Change Email

```ts
await authClient.changeEmail({
  newEmail,
  callbackURL: "https://example.com/settings",
});
// Flow: current email verify → new email verify → changed
```

## Custom Hashing (Argon2id)

```ts
import { hash, verify } from "@node-rs/argon2";

emailAndPassword: {
  password: {
    hash: (password) => hash(password, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    }),
    verify: ({ password, hash }) => verify(hash, password),
  },
}
```

## Have I Been Pwned

```ts
import { haveIBeenPwned } from "better-auth/plugins";

plugins: [
  haveIBeenPwned({ blockCompromisedPasswords: true }),
]
```
