---
name: betterauth-organization
description: Multi-tenancy configuration for Better Auth — organizations, teams, members, invitations, roles, and RBAC. Reference when implementing org management or access control.
---

# Better Auth Organization Plugin

## Setup

**Server:**

```ts
import { organization } from "better-auth/plugins";

plugins: [
  organization({
    allowUserToCreateOrganization: true,
    organizationLimit: 5,
    membershipLimit: 100,
    creatorRole: "owner",
    
    invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
    invitationLimit: 100,
    sendInvitationEmail: async (data) => {
      await sendEmail({
        to: data.email,
        subject: `Join ${data.organization.name}`,
        html: `<a href="https://app.com/invite/${data.invitation.id}">Accept</a>`,
      });
    },
    
    teams: {
      enabled: true,
      maximumTeams: 20,
      maximumMembersPerTeam: 50,
    },
    
    dynamicAccessControl: { enabled: true },
  }),
]
```

**Client:**

```ts
import { organizationClient } from "better-auth/client/plugins";

plugins: [organizationClient()]
```

## Create Organization

```ts
await authClient.organization.create({
  name: "My Company",
  slug: "my-company",
  metadata: { plan: "pro" },
});
```

## Set Active Organization

```ts
await authClient.organization.setActive({ organizationId });
const { data } = await authClient.organization.getFullOrganization();
```

## Invite Members

```ts
await authClient.organization.inviteMember({
  email: "user@example.com",
  role: "member",
});
```

## Check Permissions

```ts
const { data } = await authClient.organization.hasPermission({
  permission: "member:write",
});
```

## Default Roles

| Role   | Permissions                           |
|--------|---------------------------------------|
| owner  | Full access                           |
| admin  | Manage members, invitations, settings |
| member | Basic access                          |

## Teams

```ts
await authClient.organization.createTeam({ name: "Engineering" });
await authClient.organization.addTeamMember({ teamId, userId });
await authClient.organization.setActiveTeam({ teamId });
```

## Custom Roles

```ts
await authClient.organization.createRole({
  role: "moderator",
  permission: {
    member: ["read"],
    invitation: ["read"],
  },
});
```

## Notes

- Last owner cannot be removed or leave
- Deleting org removes all members/teams/invitations
- Run `npx @better-auth/cli migrate` after adding plugin
