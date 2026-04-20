# Next.js template

This is a Next.js template with shadcn/ui.

## Maintenance mode

Set `MAINTENANCE_MODE=true` (or `NEXT_PUBLIC_MAINTENANCE_MODE=true`) in your environment to enable maintenance mode.

When enabled:

- Public routes redirect to `/admin/login`
- The maintenance panel lives at `/admin/maintenance`
- Non-authenticated API requests return `503`
- Logged-in admin users keep normal access

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
