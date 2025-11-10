import { cast, flow, types } from 'mobx-state-tree'

import { AppointmentModel } from '@/models/appointment-model/appointment-model'
import { cancelAppointment, getAppointments } from '@/services/api'

const RequestStatusModel = types.enumeration('RequestStatus', ['idle', 'loading', 'ready', 'error'])

/**
 * Normalises a backend ISO timestamp to a canonical UTC ISO string.
 * The admin UI then formats this consistently regardless of viewer timezone.
 */

export const AppointmentsStoreModel = types
  .model('AppointmentsStore', {
    items: types.array(AppointmentModel),
    status: types.optional(RequestStatusModel, 'idle'),
    error: types.maybeNull(types.string),
    page: types.optional(types.number, 1),
    hasPrevious: types.optional(types.boolean, false),
    hasNext: types.optional(types.boolean, false),
    weekStart: types.maybeNull(types.string),
    weekEnd: types.maybeNull(types.string),
  })
  .actions((self) => {
    const mapAppointment = (dto: {
      id: number
      start_time: string
      name: string
      email: string
      phone: string | null
      reason: string | null
      created_at: string
    }) => ({
      id: dto.id,
      startTime: dto.start_time,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      reason: dto.reason,
      createdAt: dto.created_at,
    })

    /**
     * Loads appointments for the requested week (page maps to backend pagination).
     */
    const fetchAppointments = flow(function* fetchAppointments(page = 1) {
      try {
        self.status = 'loading'
        self.error = null

        const response = yield getAppointments(page)

        self.items = cast(response.appointments.map(mapAppointment))
        self.page = response.page
        self.hasPrevious = response.has_previous
        self.hasNext = response.next_page !== null
        self.weekStart = response.week_start
        self.weekEnd = response.week_end
        self.status = 'ready'
      } catch (error) {
        console.error(error)
        self.status = 'error'
        self.error = error instanceof Error ? error.message : 'Unable to load appointments.'
      }
    })

    /**
     * Cancels an appointment and refreshes the current page to keep the view in sync.
     */
    const cancelAndRefresh = flow(function* cancelAndRefresh(id: number) {
      yield cancelAppointment(id)
      yield fetchAppointments(self.page)
    })

    const reset = () => {
      self.items = cast([])
      self.status = 'idle'
      self.error = null
      self.page = 1
      self.hasPrevious = false
      self.hasNext = false
      self.weekStart = null
      self.weekEnd = null
    }

    return {
      fetchAppointments,
      cancelAndRefresh,
      reset,
    }
  })

export type AppointmentsStore = typeof AppointmentsStoreModel.Type

