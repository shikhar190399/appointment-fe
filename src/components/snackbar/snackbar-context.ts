export type SnackbarVariant = 'success' | 'error' | 'info'

export type SnackbarOptions = {
  message: string
  variant?: SnackbarVariant
  duration?: number
}

export type SnackbarContextValue = {
  showSnackbar: (options: SnackbarOptions) => void
}

import { createContext } from 'react'

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined)

