import { cn } from "@/lib/utils"
import { forwardRef, useEffect } from "react"

// ─── Button ─────────────────────────────────────────────────────────────────
export const Button = forwardRef(({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"

  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 brand-glow hover:brand-glow",
    secondary: "glass glass-hover text-white",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    outline: "border border-white/10 text-white/80 hover:border-brand-500/50 hover:text-white hover:bg-white/5",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
    icon: "p-2.5",
  }

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
})
Button.displayName = "Button"

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-white/10 text-white/70",
    brand: "bg-brand-500/15 text-brand-400 border border-brand-500/25",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, hover = false }) {
  return (
    <div className={cn("glass rounded-xl p-5", hover && "glass-hover cursor-pointer", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-base font-display font-semibold text-white", className)}>{children}</h3>
}

export function CardDescription({ children, className }) {
  return <p className={cn("text-sm text-white/50 mt-0.5", className)}>{children}</p>
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25",
            "px-4 py-2.5 text-sm",
            "focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30",
            "transition-all duration-200",
            Icon && "pl-9",
            error && "border-red-500/50 focus:border-red-500/70",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})
Input.displayName = "Input"

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }
  return (
    <span className={cn("border-2 border-white/20 border-t-brand-500 rounded-full animate-spin inline-block", sizes[size])} />
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <hr className="border-white/8" />
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-xs text-white/30 font-medium">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
          <Icon size={24} className="text-white/30" />
        </div>
      )}
      <h3 className="text-base font-medium text-white/70 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Status Badge (order specific) ───────────────────────────────────────────
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  loading = false,
  tone = "danger",
}) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [loading, onClose, open])

  if (!open) {
    return null
  }

  const confirmVariant = tone === "danger" ? "danger" : "primary"
  const badgeClassName = tone === "danger"
    ? "bg-red-500/12 text-red-300 border border-red-500/20"
    : "bg-brand-500/12 text-brand-300 border border-brand-500/20"

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => { if (!loading) onClose?.() }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(10,10,10,0.96))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start gap-4">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold", badgeClassName)}>
            !
          </div>
          <div className="min-w-0">
            <p id="confirm-dialog-title" className="text-xl font-display font-bold text-white">
              {title}
            </p>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const config = {
    pending:    { label: "Pending",    cls: "status-pending" },
    paid:       { label: "Paid",       cls: "status-paid" },
    failed:     { label: "Failed",     cls: "status-failed" },
    refunded:   { label: "Refunded",   cls: "status-refunded" },
    processing: { label: "Processing", cls: "status-processing" },
    completed:  { label: "Completed",  cls: "status-completed" },
    cancelled:  { label: "Cancelled",  cls: "status-cancelled" },
  }
  const { label, cls } = config[status] || config.pending
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cls)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label}
    </span>
  )
}
