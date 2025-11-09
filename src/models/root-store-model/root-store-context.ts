import { createContext, useContext } from 'react'

import type { RootStore } from './root-store'

export const RootStoreContext = createContext<RootStore | null>(null)

export const useRootStore = () => {
  const store = useContext(RootStoreContext)
  if (!store) {
    throw new Error('useRootStore must be used within a RootStoreProvider')
  }
  return store
}

