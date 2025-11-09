import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'

import './admin-appointments.scss'

import { Loader } from '@/components/loader/loader'
import { useSnackbar } from '@/components/snackbar/use-snackbar'
import { useRootStore } from '@/models/root-store-model'
import { getAvailableSlots, updateAppointment } from '@/services/api'

// Formatters centralised so rendering rows stays lean and predictable.
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
})

const formatDate = (iso: string) => dateFormatter.format(new Date(iso))
const formatTime = (iso: string) => timeFormatter.format(new Date(iso))
const formatTimestamp = (iso: string) => timestampFormatter.format(new Date(iso))

export const AdminAppointmentsPage = observer(() => {
  const {
    appointments: {
      items,
      status,
      error,
      page,
      hasPrevious,
      hasNext,
      weekStart,
      weekEnd,
      fetchAppointments,
      cancelAndRefresh,
    },
  } = useRootStore()

  const [cancelTarget, setCancelTarget] = useState<number | null>(null)
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<typeof items[number] | null>(null)
  const [editStatus, setEditStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [editError, setEditError] = useState<string | null>(null)
  const [editWeekPage, setEditWeekPage] = useState(0)
  const [editHasNext, setEditHasNext] = useState(false)
  const [editHasPrevious, setEditHasPrevious] = useState(false)
  const [editDays, setEditDays] = useState<
    Array<{
      isoDate: string
      dayLabel: string
      dateLabel: string
      slots: { iso: string; label: string }[]
    }>
  >([])
  const [editSelectedDayIndex, setEditSelectedDayIndex] = useState(0)
  const [editSelectedSlot, setEditSelectedSlot] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    if (status === 'idle') {
      void fetchAppointments(1)
    }
  }, [status, fetchAppointments])

  const weekRange = useMemo(() => {
    if (!weekStart || !weekEnd) {
      return null
    }
    const start = new Date(weekStart).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const end = new Date(weekEnd).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    return `${start} – ${end}`
  }, [weekStart, weekEnd])

  const selectedAppointment = cancelTarget
    ? items.find((appointment) => appointment.id === cancelTarget)
    : null

  const editAppointment = editTarget
    ? items.find((appointment) => appointment.id === editTarget.id) ?? editTarget
    : null

  const getStartOfWeek = (date: Date) => {
    const cloned = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const day = cloned.getUTCDay()
    const diff = (day === 0 ? -6 : 1) - day
    cloned.setUTCDate(cloned.getUTCDate() + diff)
    return cloned
  }

  const getWeekOffsetFromToday = (dateIso: string) => {
    const todayMonday = getStartOfWeek(new Date())
    const targetMonday = getStartOfWeek(new Date(dateIso))
    const diffMs = targetMonday.getTime() - todayMonday.getTime()
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
    return diffWeeks < 0 ? 0 : diffWeeks
  }

  const groupSlotsByDay = (slots: string[]) => {
    const grouping = new Map<
      string,
      {
        isoDate: string
        dayLabel: string
        dateLabel: string
        slots: { iso: string; label: string }[]
      }
    >()

    slots.forEach((iso) => {
      const date = iso.slice(0, 10)
      if (!grouping.has(date)) {
        const labelDate = new Date(`${date}T00:00:00`)
        grouping.set(date, {
          isoDate: date,
          dayLabel: labelDate.toLocaleDateString(undefined, { weekday: 'long' }),
          dateLabel: labelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          slots: [],
        })
      }
      const [hourStr, minuteStr] = iso.slice(11, 16).split(':')
      const hours = Number(hourStr)
      const period = hours >= 12 ? 'PM' : 'AM'
      const normalizedHour = ((hours + 11) % 12) + 1
      grouping.get(date)?.slots.push({
        iso,
        label: `${normalizedHour}:${minuteStr} ${period}`,
      })
    })

    const sortedDays = Array.from(grouping.values()).sort((a, b) =>
      a.isoDate < b.isoDate ? -1 : 1,
    )

    sortedDays.forEach((day) => {
      day.slots.sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0))
    })

    return sortedDays
  }

  const loadEditAvailability = async (pageToLoad: number, currentSlot?: string) => {
    setEditStatus('loading')
    setEditError(null)
    try {
      const response = await getAvailableSlots(pageToLoad)
      const slots = [...response.available_slots]
      if (currentSlot && !slots.includes(currentSlot)) {
        slots.push(currentSlot)
      }
      slots.sort()
      const grouped = groupSlotsByDay(slots)

      setEditDays(grouped)
      setEditWeekPage(response.page)
      setEditHasPrevious(response.has_previous)
      setEditHasNext(response.next_page !== null)
      const defaultDayIndex = (() => {
        if (!currentSlot) return 0
        const targetDate = currentSlot.slice(0, 10)
        const index = grouped.findIndex((day) => day.isoDate === targetDate)
        return index >= 0 ? index : 0
      })()
      const defaultSlot =
        currentSlot ??
        grouped[defaultDayIndex]?.slots[0]?.iso ??
        grouped[0]?.slots[0]?.iso ??
        null

      setEditSelectedDayIndex(defaultDayIndex)
      setEditSelectedSlot(defaultSlot)
      setEditStatus('ready')
    } catch (error) {
      console.error(error)
      setEditStatus('error')
      setEditError(
        error instanceof Error ? error.message : 'Unable to load available slots for editing.',
      )
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    setCancelStatus('loading')
    setCancelError(null)
    try {
      await cancelAndRefresh(selectedAppointment.id)
      setCancelStatus('idle')
      setCancelTarget(null)
      showSnackbar({ message: 'Appointment cancelled successfully.', variant: 'success' })
    } catch (error) {
      setCancelStatus('error')
      const message =
        error instanceof Error ? error.message : 'Failed to cancel the appointment.'
      setCancelError(message)
      showSnackbar({ message, variant: 'error' })
    }
  }

  const handleEditSubmit = async () => {
    if (!editAppointment || !editSelectedSlot) {
      setEditError('Please pick a date and time slot.')
      return
    }

    if (editReason.length > 200) {
      setEditError('Reason cannot exceed 200 characters.')
      return
    }

    setEditStatus('loading')
    setEditError(null)
    try {
      await updateAppointment(editAppointment.id, {
        start_time: editSelectedSlot,
        reason: editReason.trim() || undefined,
      })
      setEditStatus('idle')
      setEditTarget(null)
      showSnackbar({ message: 'Appointment rescheduled successfully.', variant: 'success' })
      await fetchAppointments(page)
    } catch (error) {
      console.error(error)
      setEditStatus('error')
      const message =
        error instanceof Error ? error.message : 'Failed to reschedule the appointment.'
      setEditError(message)
      showSnackbar({ message, variant: 'error' })
    }
  }

  const openEditModal = (appointment: typeof items[number]) => {
    setEditTarget(appointment)
    setEditReason(appointment.reason ?? '')

    const weekOffset = getWeekOffsetFromToday(appointment.startTime)
    void loadEditAvailability(weekOffset, appointment.startTime)
  }

  return (
    <section className="admin-appointments container py-4 py-md-5">
      <div className="admin-appointments__header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 mb-1">Appointments</h1>
          <p className="text-secondary mb-0">
            {weekRange ? `Week of ${weekRange}` : 'Review scheduled meetings'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={!hasPrevious || status === 'loading'}
            onClick={() => fetchAppointments(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={!hasNext || status === 'loading'}
            onClick={() => fetchAppointments(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {status === 'loading' && items.length === 0 && (
        <div className="admin-appointments__loader">
          <Loader message="Loading appointments…" size="lg" />
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert-danger" role="alert">
          {error ?? 'Unable to load appointments.'}
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="alert alert-info" role="status">
          No appointments scheduled for this period.
        </div>
      )}

      {items.length > 0 && (
        <div className="table-responsive admin-appointments__table-wrapper d-none d-lg-block">
          <table className="table table-dark table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Reason</th>
                <th scope="col">Created</th>
                <th scope="col" className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDate(appointment.startTime)}</td>
                  <td>{formatTime(appointment.startTime)}</td>
                  <td>{appointment.name}</td>
                  <td>
                    <a href={`mailto:${appointment.email}`} className="link-light">
                      {appointment.email}
                    </a>
                  </td>
                  <td>{appointment.phone ?? '—'}</td>
                  <td>{appointment.reason?.trim() ? appointment.reason : '—'}</td>
                  <td>{formatTimestamp(appointment.createdAt)}</td>
                  <td className="text-end">
                    <div className="admin-appointments__actions">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setCancelTarget(appointment.id)
                          setCancelStatus('idle')
                          setCancelError(null)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openEditModal(appointment)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="admin-appointments__cards d-lg-none">
          {items.map((appointment) => (
            <article key={appointment.id} className="admin-appointments__card card">
              <div className="card-body">
                <div>
                  <div className="admin-appointments__card-date">{formatDate(appointment.startTime)}</div>
                  <div className="admin-appointments__card-time">{formatTime(appointment.startTime)}</div>
                </div>

                <dl className="row admin-appointments__card-details">
                  <dt className="col-4">Name</dt>
                  <dd className="col-8">{appointment.name}</dd>
                  <dt className="col-4">Email</dt>
                  <dd className="col-8">
                    <a href={`mailto:${appointment.email}`} className="link-light">
                      {appointment.email}
                    </a>
                  </dd>
                  <dt className="col-4">Phone</dt>
                  <dd className="col-8">{appointment.phone ?? '—'}</dd>
                  <dt className="col-4">Reason</dt>
                  <dd className="col-8">{appointment.reason?.trim() ? appointment.reason : '—'}</dd>
                  <dt className="col-4">Created</dt>
                  <dd className="col-8">{formatTimestamp(appointment.createdAt)}</dd>
                </dl>

                <div className="admin-appointments__actions justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setCancelTarget(appointment.id)
                      setCancelStatus('idle')
                      setCancelError(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => openEditModal(appointment)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div className="admin-appointments__overlay" role="dialog" aria-modal="true">
          <div className="admin-appointments__dialog card">
            <div className="card-body">
              <div className="admin-appointments__dialog-header">
                <h2 className="h6 mb-3 text-uppercase mb-0">Cancel Appointment</h2>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setCancelTarget(null)}
                  disabled={cancelStatus === 'loading'}
                />
              </div>
              <p className="text-secondary mb-4">
                Are you sure you want to cancel the appointment with{' '}
                <strong>{selectedAppointment.name}</strong> on{' '}
                {formatDate(selectedAppointment.startTime)} at{' '}
                {formatTime(selectedAppointment.startTime)}?
              </p>

              {cancelStatus === 'error' && cancelError && (
                <div className="alert alert-danger py-2" role="alert">
                  {cancelError}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCancelTarget(null)}
                  disabled={cancelStatus === 'loading'}
                >
                  Keep
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancel}
                  disabled={cancelStatus === 'loading'}
                >
                  {cancelStatus === 'loading' ? 'Cancelling…' : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editAppointment && (
        <div className="admin-appointments__overlay" role="dialog" aria-modal="true">
          <div className="admin-appointments__dialog card">
            <div className="card-body">
              <div className="admin-appointments__dialog-header">
                <h2 className="h6 mb-3 text-uppercase mb-0">Edit Appointment</h2>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setEditTarget(null)}
                  disabled={editStatus === 'loading'}
                />
              </div>
              <p className="text-secondary mb-3">
                Reschedule <strong>{editAppointment.name}</strong>.
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold">Select Week</span>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={!editHasPrevious || editStatus === 'loading'}
                    onClick={() => void loadEditAvailability(Math.max(editWeekPage - 1, 0))}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={!editHasNext || editStatus === 'loading'}
                    onClick={() => void loadEditAvailability(editWeekPage + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>

              {editStatus === 'loading' && (
                <div className="admin-appointments__loader admin-appointments__loader--inline">
                  <Loader message="Loading available slots…" size="sm" />
                </div>
              )}

              {editStatus === 'error' && editError && (
                <div className="alert alert-danger py-2" role="alert">
                  {editError}
                </div>
              )}

              {editStatus === 'ready' && (
                <>
                  <div className="admin-appointments__edit-days mb-3">
                    {editDays.map((day, index) => (
                      <button
                        key={day.isoDate}
                        type="button"
                        className={`btn btn-sm ${
                          index === editSelectedDayIndex
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                        }`}
                        onClick={() => {
                          setEditSelectedDayIndex(index)
                          const firstSlot = day.slots[0]?.iso ?? null
                          setEditSelectedSlot(firstSlot)
                        }}
                      >
                        <div className="text-uppercase small fw-semibold">{day.dayLabel.slice(0, 3)}</div>
                        <div>{day.dateLabel}</div>
                      </button>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Available Times</label>
                    <select
                      className="form-select"
                      value={editSelectedSlot ?? ''}
                      onChange={(event) => setEditSelectedSlot(event.target.value || null)}
                    >
                      <option value="" disabled>
                        Select a time
                      </option>
                      {editDays[editSelectedDayIndex]?.slots.map((slot) => (
                        <option key={slot.iso} value={slot.iso}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reason / Notes</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      maxLength={200}
                      value={editReason}
                      onChange={(event) => setEditReason(event.target.value)}
                    />
                    <div className="form-text text-end">{editReason.length}/200</div>
                  </div>
                </>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setEditTarget(null)}
                  disabled={editStatus === 'loading'}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleEditSubmit}
                  disabled={editStatus === 'loading'}
                >
                  {editStatus === 'loading' ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Saving…
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
})

