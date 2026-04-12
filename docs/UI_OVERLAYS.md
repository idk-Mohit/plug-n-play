# Global overlays (toast & confirm dialog)

Singleton UI driven by Jotai atoms. **Mount once** in the app root: [`AppToast`](../src/components/AppToast.tsx) and [`AppConfirmDialog`](../src/components/AppConfirmDialog.tsx).

Visual language matches [`UI_THEME.md`](./UI_THEME.md): compact type scale, semantic tokens, dense controls.

## Toast — bottom-right

- **Atom:** `toastAtom` — [`src/state/ui/toast.ts`](../src/state/ui/toast.ts)
- **Hook:** `useToast()` — [`src/hooks/useToast.ts`](../src/hooks/useToast.ts)

```ts
const { show, dismiss } = useToast();

show({
  title: "Saved",
  description: "Changes applied.",
  variant: "success", // info | success | warning | error
  duration: 4000,     // 0 = until dismissed
  action: { label: "Undo", onClick: () => { /* … */ } },
});
```

## Confirm / info modal

- **Atom:** `confirmDialogAtom` — [`src/state/ui/dialog.ts`](../src/state/ui/dialog.ts)
- **Hook:** `useConfirmDialog()` — [`src/hooks/useConfirmDialog.ts`](../src/hooks/useConfirmDialog.ts)

```ts
const { open, close } = useConfirmDialog();

open({
  title: "Delete item?",
  subheading: "This cannot be undone.",
  description: "The item will be removed from this project.",
  note: "Tip: you can restore from trash within 30 days.",
  variant: "destructive", // info | confirm | destructive
  dismissible: true,      // false = block ESC / programmatic close only
  primaryButton: { label: "Delete", variant: "destructive", onClick: async () => { close(); /* … */ } },
  secondaryButton: { label: "Cancel", variant: "outline", onClick: () => close() },
});
```

Call `close()` inside button handlers when the modal should dismiss.

## Custom body (future)

For arbitrary React content, add a separate host (e.g. `Dialog` + atom) when needed; keep this confirm flow for structured title/description/actions only.
