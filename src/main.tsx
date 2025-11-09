import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import 'bootstrap/dist/css/bootstrap.min.css'

import { SnackbarProvider } from '@/components/snackbar/snackbar-provider'
import { RootStoreProvider, rootStoreSingleton } from '@/models/root-store-model'
import { App } from '@/pages/app/app'
import '@/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootStoreProvider store={rootStoreSingleton.store}>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </RootStoreProvider>
  </StrictMode>,
)
