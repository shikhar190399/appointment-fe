import { Route, Routes } from 'react-router-dom'

import { AdminAppointmentsPage } from '@/pages/admin-appointments/admin-appointments'
import { GuestAppointmentPage } from '@/pages/guest-appointment/guest-appointment'
import { HomePage } from '@/pages/home-page/home-page'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/guest/schedule" element={<GuestAppointmentPage />} />
      <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
    </Routes>
  )
}

