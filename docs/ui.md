# UI Coding Standards

## Component Library

**All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com/) components.**

- Do NOT create custom UI components under any circumstances.
- Do NOT use any other component library (MUI, Chakra, Radix primitives directly, etc.).
- Do NOT write bespoke HTML/CSS structures for things shadcn/ui already covers (buttons, inputs, dialogs, cards, tables, etc.).
- If a shadcn/ui component does not exist for a use case, compose the required UI from existing shadcn/ui components.

### Adding Components

Install components via the shadcn CLI:

```bash
npx shadcn@latest add <component-name>
```

Components are installed into `src/components/ui/` and are owned by this project — they can be edited to adjust variants or styles, but their fundamental structure must remain shadcn/ui-based.

---

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/).

### Required Format

Dates must display with an ordinal day suffix, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
9th Jun 2026
```

### Implementation

Use `format` together with `getDate` and a helper to produce the ordinal suffix:

```ts
import { format } from "date-fns";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(date: Date): string {
  return `${ordinal(date.getDate())} ${format(date, "MMM yyyy")}`;
}
```

- Never use `toLocaleDateString`, `Intl.DateTimeFormat`, or hand-rolled string concatenation for date display.
- Never use any date library other than date-fns.
- Apply `formatDate` (or an equivalent utility) consistently across all date displays in the app.
