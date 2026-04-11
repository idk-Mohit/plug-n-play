# UI theme & layout (agent guide)

This document is the **canonical visual language** for Plug & Play: dense, modern, “pro dashboard” panels that match the chart **settings drawer** and shadcn/ui defaults. Use it whenever you add or refactor UI in `src/components/`, `src/containers/`, or settings-style surfaces.

**Stack:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) primitives under `src/components/ui/` + Lucide icons.

---

## Principles

1. **Semantic tokens first** — Use `background`, `foreground`, `muted`, `border`, `card`, `destructive`, `ring` (theme variables), not raw grays, unless you need a one-off alpha (e.g. `border-border/70`).
2. **Compact but readable** — Prefer slightly smaller type and tighter vertical rhythm in panels; keep touch targets usable (min ~32px height for primary controls where appropriate).
3. **One clear hierarchy** — Section title → field label → hint text; don’t compete with multiple “large” headings in the same panel.
4. **Icons clarify structure** — Small Lucide icons (3.5–4px grid) beside section titles or list rows; don’t decorate every label.
5. **shadcn composition** — Build from `Button`, `Input`, `Select`, `Switch`, `Slider`, `ScrollArea`, `Collapsible`, `Separator`, `Field` primitives; extend with `className` + `cn()`, don’t fork primitives for small tweaks.

---

## Typography

| Role | Tailwind (typical) | Notes |
|------|-------------------|--------|
| Panel title | `text-sm font-semibold tracking-tight text-foreground` | One per sheet/drawer header |
| Panel subtitle / helper under title | `text-[11px] leading-tight text-muted-foreground` | Single line when possible |
| Section header (collapsible bar) | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` | GitBook-style; short labels |
| Field label | `text-xs font-medium leading-snug text-foreground` | Default for dense forms |
| Hint / description | `text-[11px] leading-snug text-muted-foreground` | Under label or inline |
| Numeric readouts (slider value) | `text-[11px] tabular-nums text-muted-foreground` | Keeps columns aligned |

Avoid mixing `text-lg` titles inside the same panel as the compact scale unless it’s a true page hero.

---

## Spacing & density

| Context | Pattern |
|---------|---------|
| Drawer / narrow panel max width | `max-w-[min(100vw,19rem)]` or similar; cap width on mobile |
| Panel outer padding | `px-3 py-3` or `p-3` for body; header often `px-3 py-3` |
| Stack between sections | `space-y-2` or `space-y-3` |
| Stack between fields | `space-y-2.5` in `FieldGroup`; field internal `space-y-1.5` |
| Gaps in rows (icon + label + control) | `gap-2.5` or `gap-3` |

---

## Controls (dense defaults)

- **Text / color inputs:** `h-8 w-full text-xs`; color swatch: add `cursor-pointer p-0.5` where needed.
- **Select trigger:** `h-8 w-full text-xs` on `SelectTrigger` (see chart `FieldRenderer`).
- **Primary icon buttons** (close, etc.): shadcn `Button` `size="icon-sm"` where available.
- **Toggles in panels:** Prefer a single horizontal row: label + optional hint on the left, `Switch` on the right, inside a subtle bordered row (`rounded-md border border-border/50 bg-muted/20 px-2.5 py-2`) — same idea as `layout: "inline"` in chart settings.

---

## Surfaces & borders

- **Drawer / floating panel:** `border-l border-border/80 bg-background/95 shadow-2xl backdrop-blur-sm supports-[backdrop-filter]:bg-background/90`
- **Scrim:** `bg-black/60` (tweak opacity for emphasis)
- **Section card (collapsible block):** `rounded-lg border border-border/70 bg-muted/15 shadow-sm`; open state can add `border-b` on trigger
- **Inset content under section header:** `border-t border-border/40 bg-background/40 px-3 pb-3 pt-2.5`
- **Icon tile in panel header (optional):** `h-8 w-8 rounded-md bg-muted/60` wrapping a `h-4 w-4` Lucide icon

---

## Scroll

Long panel content should use **`ScrollArea`** (`src/components/ui/scroll-area.tsx`):

- Wrap the scrollable region in a flex child with `min-h-0 flex-1`.
- Inner padding on the content div (`p-3 pb-4`), not on the root viewport, keeps scrollbars aligned.

---

## Sections & collapsibles

Pattern used in `FormWrapper` + chart settings:

- Optional **`LucideIcon`** per section (`icon` in config) at `h-3.5 w-3.5 text-muted-foreground`.
- **Collapsible** trigger: full width, `hover:bg-muted/40`, chevron with `group-data-[state=open]:rotate-180` on the trigger.
- Keep section titles **short**; put detail in `description` (muted, 11px).

---

## Field component (`Field`)

`Field` is a **`<div>` stack** (label + control + description + error), not Radix `Slot`, so **multiple children are valid**. Do not wrap `Field` usage in `Slot` patterns that require a single child.

---

## Forms & config-driven UI

- **Nested state:** Use dotted paths (`animation.duration`) with shared helpers in `src/utils/object-path.ts` (`getNested` / `setNested`) when binding to config-driven forms.
- **FormWrapper** (`src/components/form-wrapper/`) is the reference for multi-section forms: collapsible sections, icons, and field rendering.

---

## Icons (Lucide)

- **Section / list:** `h-3.5 w-3.5` or `h-4 w-4`, `text-muted-foreground`, `shrink-0`, `aria-hidden` when decorative.
- **Header tile:** `h-4 w-4` inside `h-8 w-8` rounded container.
- Prefer stroke icons consistent with the rest of the app; avoid mixing filled and outline arbitrarily in one panel.

---

## Accessibility (baseline)

- **Close / icon-only buttons:** `aria-label` (e.g. “Close settings”).
- **Scrim:** `aria-hidden` on backdrop click targets when appropriate.
- **Collapsible triggers:** Native button behavior from Radix; ensure visible focus ring (`focus-visible:ring-2` already in patterns).
- **Labels:** Keep `htmlFor` / `id` wired for inputs and switches.

---

## What to reuse in code

| Need | Start here |
|------|------------|
| Chart-style settings drawer | `src/components/charts/settings/ChartSettingsFormWrapper.tsx` |
| Collapsible form sections | `src/components/form-wrapper/FormWrapper.tsx` |
| Field rendering (dense) | `src/components/form-wrapper/FieldRenderer.tsx` |
| Section config + icons | `src/components/form-wrapper/configs/chart-settings.config.ts` |
| `Field` primitive | `src/components/ui/field.tsx` |

---

## Anti-patterns

- Raw `Slot` on container components that render **multiple** children (causes `React.Children.only` errors).
- Inconsistent control heights in the same panel (mix of `h-10` and `h-8` without reason).
- Full-width clutter: prefer collapsible sections over endless vertical lists.
- One-off colors outside the theme tokens for non-brand UI.

---

*When in doubt, match new panels to the chart settings drawer: same type scale, spacing, borders, and shadcn building blocks.*
