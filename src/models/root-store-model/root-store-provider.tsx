import { type FC, type PropsWithChildren } from 'react'

import { RootStoreContext } from './root-store-context'
import type { RootStore } from './root-store'

type RootStoreProviderProps = PropsWithChildren<{
  store: RootStore
}>

export const RootStoreProvider: FC<RootStoreProviderProps> = ({ store, children }) => {
  return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>
}

