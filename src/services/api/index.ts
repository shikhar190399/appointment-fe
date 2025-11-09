export { httpClient } from '@/lib/http'
export {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointment,
} from './appointments'
export type {
  AvailableSlotsResponse,
  CreateAppointmentPayload,
  AppointmentsResponse,
  AppointmentDto,
  UpdateAppointmentPayload,
} from './appointments'

