import { httpClient } from '@/services/api'

export type AvailableSlotsResponse = {
  page: number
  week_start: string
  week_end: string
  available_slots: string[]
  count: number
  has_previous: boolean
  previous_page: number | null
  next_page: number | null
}

export const getAvailableSlots = async (page = 0) => {
  return httpClient<AvailableSlotsResponse>(`/api/appointments/available?page=${page}`, {
    headers: { Accept: 'application/json' },
  })
}

export type AppointmentDto = {
  id: number
  start_time: string
  name: string
  email: string
  phone: string | null
  reason: string | null
  created_at: string
}

export type AppointmentsResponse = {
  page: number
  week_start: string
  week_end: string
  appointments: AppointmentDto[]
  count: number
  has_previous: boolean
  previous_page: number | null
  next_page: number | null
}

export const getAppointments = async (page = 0) => {
  return httpClient<AppointmentsResponse>(`/api/appointments?page=${page}`, {
    headers: { Accept: 'application/json' },
  })
}

export type CreateAppointmentPayload = {
  start_time: string
  name: string
  email: string
  phone?: string
  reason?: string
}

export const createAppointment = async (payload: CreateAppointmentPayload) => {
  return httpClient('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}

export const cancelAppointment = async (id: number) => {
  return httpClient(`/api/appointments/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })
}

export type UpdateAppointmentPayload = {
  start_time: string
  reason?: string
}

export const updateAppointment = async (id: number, payload: UpdateAppointmentPayload) => {
  return httpClient(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}

