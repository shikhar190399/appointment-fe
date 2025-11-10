import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'

import './guest-appointment.scss'

import { Loader } from '@/components/loader/loader'
import { useSnackbar } from '@/components/snackbar/use-snackbar'
import { useRootStore } from '@/models/root-store-model'
import { BookingForm } from '@/components/booking-form/booking-form'

const todayIsWeekend = () => {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

export const GuestAppointmentPage = observer(() => {
  const { availability } = useRootStore()
  const { days, status, error, hasNext, hasPrevious, page } = availability

  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    if (status === 'idle') {
      const initialPage = todayIsWeekend() ? Math.max(page, 1) : 0
      void availability.fetchAvailableSlots(initialPage)
    }
  }, [availability, status, page])

  useEffect(
    () => () => {
      availability.reset()
      setSelectedDayIndex(0)
      setSelectedSlot(null)
      setIsFormVisible(false)
    },
    [availability],
  )

  useEffect(() => {
    if (days.length > 0 && selectedDayIndex >= days.length) {
      setSelectedDayIndex(0)
      setSelectedSlot(null)
      setIsFormVisible(false)
    }
  }, [days.length, selectedDayIndex])

  const selectedDay = days[selectedDayIndex] ?? null

  const timeZoneLabel = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local Time',
    [],
  )

  return (
    <section className="guest-appointment container py-4 py-md-5">
      <div className="guest-appointment__layout row g-4">
        <div className="col-12 col-lg-5 col-xl-4">
          <article className="guest-appointment__panel card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 fw-semibold mb-0">Select a Date</h2>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={!hasPrevious || status === 'loading'}
                    onClick={() => {
                      const target = todayIsWeekend() ? Math.max(page - 1, 1) : Math.max(page - 1, 0)
                      if (target === page) return
                      void availability.fetchAvailableSlots(target)
                      setSelectedDayIndex(0)
                      setSelectedSlot(null)
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={!hasNext || status === 'loading'}
                    onClick={() => {
                      void availability.fetchAvailableSlots(page + 1)
                      setSelectedDayIndex(0)
                      setSelectedSlot(null)
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
              <p className="text-secondary small mb-4">Available slots (Mon–Fri)</p>
              <div className="guest-appointment__calendar">
                {status === 'loading' && (
                  <div className="guest-appointment__loader">
                    <Loader message="Loading available dates…" size="sm" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="alert alert-danger" role="alert">
                    {error ?? 'Unable to load available slots.'}
                  </div>
                )}
                {status === 'ready' &&
                  days.map((day, index) => {
                  const isSelected = index === selectedDayIndex
                  return (
                    <button
                        key={day.isoDate}
                      type="button"
                      className={`guest-appointment__day btn ${
                        isSelected ? 'guest-appointment__day--active' : ''
                      }`}
                      onClick={() => {
                        setSelectedDayIndex(index)
                        setSelectedSlot(null)
                      }}
                    >
                      <span className="guest-appointment__day-weekday">{day.dayLabel.slice(0, 3)}</span>
                      <span className="guest-appointment__day-date">{day.dateLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </article>
        </div>

        <div className="col-12 col-lg-7 col-xl-8">
          <article className="guest-appointment__panel card h-100">
            <div className="card-body d-flex flex-column">
              <header className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h2 className="h5 fw-semibold mb-1">
                    {selectedDay ? selectedDay.dayLabel : 'Select a date'}
                  </h2>
                  <span className="text-secondary small">
                    {selectedDay ? selectedDay.dateLabel : 'No date chosen'}
                  </span>
                </div>
                <span className="badge bg-info text-dark">{timeZoneLabel}</span>
              </header>

              <div className="guest-appointment__slots flex-grow-1">
                {status === 'loading' && (
                  <div className="guest-appointment__loader guest-appointment__loader--slots">
                    <Loader message="Fetching slots…" size="sm" />
                  </div>
                )}

                {status === 'error' && (
                  <div className="alert alert-danger" role="alert">
                    {error ?? 'Unable to load available slots.'}
                  </div>
                )}

                {status === 'ready' && selectedDay && selectedDay.slots.length === 0 && (
                  <div className="alert alert-warning" role="alert">
                    No slots are available for this date.
                  </div>
                )}

                {status === 'ready' &&
                  selectedDay?.slots.map((slot) => {
                    const isSelected = selectedSlot === slot.iso
                    return (
                      <button
                        key={slot.iso}
                        type="button"
                        className={`guest-appointment__slot btn btn-lg ${
                          isSelected ? 'guest-appointment__slot--active' : 'guest-appointment__slot--available'
                        }`}
                        onClick={() => setSelectedSlot(slot.iso)}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
              </div>

              <div className="d-flex justify-content-end gap-3 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedSlot(null)}
                  disabled={!selectedSlot}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedSlot}
                  onClick={() => setIsFormVisible(true)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {isFormVisible && selectedSlot && (
        <BookingForm
          startTimeIso={selectedSlot}
          onClose={() => setIsFormVisible(false)}
          onSuccess={async () => {
            setIsFormVisible(false)
            setSelectedSlot(null)
            showSnackbar({ message: 'Appointment booked successfully.', variant: 'success' })
            await availability.fetchAvailableSlots(availability.page)
          }}
        />
      )}
    </section>
  )
})

