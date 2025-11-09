import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'

import { createAppointment } from '@/services/api'

type BookingFormProps = {
  startTimeIso: string
  onClose: () => void
  onSuccess: () => void
}

type FormFields = {
  name: string
  email: string
  phone: string
  reason: string
}

const defaultFields: FormFields = {
  name: '',
  email: '',
  phone: '',
  reason: '',
}

export const BookingForm = ({ startTimeIso, onClose, onSuccess }: BookingFormProps) => {
  const [fields, setFields] = useState<FormFields>(defaultFields)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayTime = useMemo(
    () =>
      new Date(startTimeIso).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    [startTimeIso],
  )

  useEffect(() => {
    setFields(defaultFields)
    setError(null)
    setSubmitting(false)
  }, [startTimeIso])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Validates form fields, persists the appointment, and delegates success handling to the caller.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = fields.name.trim()
    const email = fields.email.trim()
    const phone = fields.phone.trim()
    const reason = fields.reason.trim()

    if (!name || !email) {
      setError('Name and email are required.')
      return
    }
    if (reason.length > 200) {
      setError('Reason cannot exceed 200 characters.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createAppointment({
        start_time: startTimeIso,
        name,
        email,
        phone: phone || undefined,
        reason: reason || undefined,
      })
      onSuccess()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create the appointment right now.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="booking-form__overlay" role="dialog" aria-modal="true">
      <div className="booking-form__container card">
        <div className="card-body">
          <header className="booking-form__header d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h6 mb-1 text-uppercase">Confirm Appointment</h2>
              <small className="text-secondary">{displayTime}</small>
            </div>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
          </header>

          <form onSubmit={handleSubmit} className="booking-form__form">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="booking-name">
                  Name *
                </label>
                <input
                  id="booking-name"
                  name="name"
                  className="form-control"
                  value={fields.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="booking-email">
                  Email *
                </label>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={fields.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="booking-phone">
                  Phone
                </label>
                <input
                  id="booking-phone"
                  name="phone"
                  className="form-control"
                  value={fields.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label d-flex justify-content-between" htmlFor="booking-reason">
                  <span>Reason / Notes</span>
                  <span className="text-secondary small">{fields.reason.length}/200</span>
                </label>
                <textarea
                  id="booking-reason"
                  name="reason"
                  className="form-control"
                  rows={3}
                  maxLength={200}
                  value={fields.reason}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

