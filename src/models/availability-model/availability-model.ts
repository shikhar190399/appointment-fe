import { cast, flow, types, type SnapshotIn } from 'mobx-state-tree'

import { getAvailableSlots } from '@/services/api'

const TimeSlotModel = types.model('TimeSlot', {
  iso: types.identifier,
  label: types.string,
})

type TimeSlotSnapshotIn = SnapshotIn<typeof TimeSlotModel>

export type TimeSlot = typeof TimeSlotModel.Type

const DayAvailabilityModel = types.model('DayAvailability', {
  isoDate: types.identifier,
  dayLabel: types.string,
  dateLabel: types.string,
  slots: types.array(TimeSlotModel),
})

export type DayAvailability = typeof DayAvailabilityModel.Type

export const AvailabilityStoreModel = types
  .model('AvailabilityStore', {
    days: types.array(DayAvailabilityModel),
    page: types.optional(types.number, 0),
    weekStart: types.maybeNull(types.string),
    weekEnd: types.maybeNull(types.string),
    hasPrevious: types.optional(types.boolean, false),
    hasNext: types.optional(types.boolean, false),
    status: types.optional(
      types.enumeration('RequestStatus', ['idle', 'loading', 'ready', 'error']),
      'idle',
    ),
    error: types.maybeNull(types.string),
  })
  .views((self) => ({
    get hasData() {
      return self.days.length > 0
    },
  }))
  .actions((self) => {
    /**
     * Converts an ISO timestamp (already in local business TZ) into a user-friendly label (e.g. 3:30 PM).
     */
    const formatTimeLabel = (isoString: string) => {
      const timePart = isoString.slice(11, 16) // HH:MM
      const [hourStr, minuteStr] = timePart.split(':')
      const hours = Number(hourStr)
      const period = hours >= 12 ? 'PM' : 'AM'
      const normalizedHour = ((hours + 11) % 12) + 1

      return `${normalizedHour}:${minuteStr} ${period}`
    }

    /**
     * Produces readable day/date labels for the availability calendar.
     */
    const formatDayLabel = (isoDate: string) => {
      const date = new Date(`${isoDate}T00:00:00`)
      return {
        dayLabel: date.toLocaleDateString(undefined, { weekday: 'long' }),
        dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }
    }

    /**
     * Groups raw ISO slots by day so the UI can render a grid of days → slots.
     */
    const groupSlotsByDay = (slots: string[]) => {
      const grouping = new Map<string, TimeSlotSnapshotIn[]>()

      slots.forEach((iso) => {
        const isoDate = iso.slice(0, 10)
        const label = formatTimeLabel(iso)

        if (!grouping.has(isoDate)) {
          grouping.set(isoDate, [])
        }

        grouping.get(isoDate)?.push({
          iso,
          label,
        })
      })

      return Array.from(grouping.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([isoDate, slotsForDay]) => {
          const { dayLabel, dateLabel } = formatDayLabel(isoDate)
          return {
            isoDate,
            dayLabel,
            dateLabel,
            slots: slotsForDay,
          }
        })
    }

    /**
     * Fetches availability for the given week. The backend accepts `page` as the week offset (0 = current week, 1 = next week, ...).
     */
    const fetchAvailableSlots = flow(function* fetchAvailableSlots(page = 0) {
      try {
        self.status = 'loading'
        self.error = null

        const response = yield getAvailableSlots(page)
        const grouped = groupSlotsByDay(response.available_slots)

        self.days = cast(grouped)
        self.page = response.page
        self.weekStart = response.week_start
        self.weekEnd = response.week_end
        if (page === 1 && !response.has_previous) {
          self.hasPrevious = false
        } else if (page <= 0) {
          self.hasPrevious = false
        } else {
          self.hasPrevious = response.has_previous
        }
        self.hasNext = response.next_page !== null
        self.status = 'ready'
      } catch (error) {
        console.error(error)
        self.status = 'error'
        self.error =
          error instanceof Error ? error.message : 'Unexpected error while fetching slots.'
      }
    })

    return {
      fetchAvailableSlots,
    }
  })

  .actions((self) => ({
    reset() {
      self.days = cast([])
      self.page = 0
      self.weekStart = null
      self.weekEnd = null
      self.hasPrevious = false
      self.hasNext = false
      self.status = 'idle'
      self.error = null
    },
  }))

export type AvailabilityStore = typeof AvailabilityStoreModel.Type

