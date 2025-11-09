import { useEffect } from 'react'

import './snackbar.scss'

type SnackbarVariant = 'success' | 'error' | 'info'

type SnackbarProps = {
  open: boolean
  message: string
  variant: SnackbarVariant
  duration: number
  onClose: () => void
}

const variantIcon: Record<SnackbarVariant, string> = {
  success: '✔',
  error: '!',
  info: 'ℹ',
}

export const Snackbar = ({ open, message, variant, duration, onClose }: SnackbarProps) => {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [open, duration, onClose])

  if (!open) {
    return null
  }

  return (
    <div className={`snackbar snackbar--${variant}`} role="status">
      <span className="snackbar__icon" aria-hidden="true">
        {variantIcon[variant]}
      </span>
      <span>{message}</span>
      <button type="button" aria-label="Close" className="snackbar__close" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

