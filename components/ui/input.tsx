import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * The ONE input treatment in the app (BUILD-SPEC §5.1–5.3, §8.1):
 * 44px min tap height · --radius-md · 15px body text · --border-strong hairline.
 *
 * This used to be shadcn's default (32px / 16px radius / 16px text — a size
 * that isn't even in the type scale) while app screens hand-rolled their own
 * 44px fields alongside it, so two different inputs appeared on one screen.
 * All hand-rolled fields now route through here.
 *
 *   variant="default"  form fields, sheets, line items
 *   variant="pill"     the chat composer only (§6.2 — --radius-full on --surface)
 */
function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: "default" | "pill" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(
        "h-11 w-full min-w-0 bg-transparent px-3 text-[15px] leading-5 font-normal outline-none transition-[border-color,box-shadow] duration-150",
        "placeholder:text-[var(--subtle-foreground)]",
        "focus-visible:border-[var(--accent)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[var(--negative)]",
        variant === "pill"
          ? "rounded-full border border-[var(--border)] bg-[var(--surface)]"
          : "rounded-[var(--radius-md)] border border-[var(--border-strong)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
