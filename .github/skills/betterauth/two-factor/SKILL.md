---
name: betterauth-2fa
description: Two-Factor Authentication configuration for Better Auth — TOTP authenticator apps, OTP via email/SMS, backup codes, and trusted devices. Reference when implementing MFA.
---

# Better Auth Two-Factor Authentication

## Setup

**Server:**

```ts
import { twoFactor } from "better-auth/plugins";

plugins: [
  twoFactor({
    issuer: "My App", // Required: shows in authenticator
    
    totpOptions: {
      digits: 6, // 6 or 8
      period: 30, // seconds
    },
    
    otpOptions: {
      sendOTP: async ({ user, otp }) => {
        await sendEmail({
          to: user.email,
          subject: "Your code",
          text: `Code: ${otp}`,
        });
      },
      period: 5, // minutes
      allowedAttempts: 5,
      storeOTP: "encrypted", // "plain" | "encrypted" | "hashed"
    },
    
    backupCodeOptions: {
      amount: 10,
      length: 10,
      storeBackupCodes: "encrypted",
    },
    
    twoFactorCookieMaxAge: 600, // 10 min verification window
    trustDeviceMaxAge: 30 * 24 * 60 * 60, // 30 days
  }),
]
```

**Client:**

```ts
import { twoFactorClient } from "better-auth/client/plugins";

plugins: [
  twoFactorClient({
    onTwoFactorRedirect() {
      window.location.href = "/2fa";
    },
  }),
]
```

## Enable 2FA

```ts
const { data } = await authClient.twoFactor.enable({ password });
// data.totpURI — generate QR code
// data.backupCodes — display to user
```

## TOTP Verification

```ts
await authClient.twoFactor.verifyTotp({
  code,
  trustDevice: true,
});
```

## OTP Flow

```ts
await authClient.twoFactor.sendOtp();
await authClient.twoFactor.verifyOtp({ code, trustDevice: true });
```

## Backup Code Recovery

```ts
await authClient.twoFactor.verifyBackupCode({ code, trustDevice: true });
```

## Regenerate Backup Codes

```ts
const { data } = await authClient.twoFactor.generateBackupCodes({ password });
```

## Sign-In Flow

```ts
await authClient.signIn.email(
  { email, password },
  {
    onSuccess(ctx) {
      if (ctx.data.twoFactorRedirect) {
        window.location.href = "/2fa";
      }
    },
  }
);
```

## Disable 2FA

```ts
await authClient.twoFactor.disable({ password });
```

## Notes

- Only works for email/password accounts
- `twoFactorEnabled` becomes `true` after first TOTP verification
- Run `npx @better-auth/cli migrate` after adding plugin
