import './app.scss'

import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from '@/routes/app-routes'

export const App = () => {
  return (
    <BrowserRouter>
      <main className="app-shell">
        <section className="app-shell__content">
          <AppRoutes />
        </section>
      </main>
    </BrowserRouter>
  )
}

