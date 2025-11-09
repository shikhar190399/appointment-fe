import { useCallback, useMemo, useState, type FC, type PropsWithChildren } from 'react'

import { Snackbar } from './snackbar'
import {
  SnackbarContext,
  type SnackbarContextValue,
  type SnackbarOptions,
  type SnackbarVariant,
} from './snackbar-context'

const DEFAULT_DURATION = 3500

export const SnackbarProvider: FC<PropsWithChildren> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    variant: SnackbarVariant
    duration: number
  }>({
    open: false,
    message: '',
    variant: 'info',
    duration: DEFAULT_DURATION,
  })

  const showSnackbar = useCallback(({ message, variant = 'info', duration }: SnackbarOptions) => {
    if (!message) return
    setSnackbar({
      open: true,
      message,
      variant,
      duration: duration ?? DEFAULT_DURATION,
    })
  }, [])

  const handleClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }, [])

  const value = useMemo<SnackbarContextValue>(() => ({ showSnackbar }), [showSnackbar])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        variant={snackbar.variant}
        duration={snackbar.duration}
        onClose={handleClose}
      />
    </SnackbarContext.Provider>
  )
}

