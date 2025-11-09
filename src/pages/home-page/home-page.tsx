import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './home-page.scss'

type UserRole = 'admin' | 'guest'

type RoleOption = {
  value: UserRole
  label: string
  variant: 'primary' | 'outline-primary'
}

const roleOptions: RoleOption[] = [
  { value: 'admin', label: "I'm an Admin", variant: 'primary' },
  { value: 'guest', label: "I'm a Guest", variant: 'outline-primary' },
]

export const HomePage = () => {
  const [role, setRole] = useState<UserRole | null>(null)
  const navigate = useNavigate()

  return (
    <section className="home-page container py-5">
      <article className="home-page__card card shadow-sm border-0 text-center">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-semibold mb-3">Welcome to the Appointment Scheduler</h1>
          <p className="home-page__lead text-secondary mb-4">
            Choose how you want to continue—manage bookings as an admin or browse slots as a guest.
          </p>

          <div className="home-page__actions d-flex flex-column flex-sm-row gap-3 justify-content-center">
            {roleOptions.map(({ value, label, variant }) => (
              <button
                key={value}
                type="button"
                className={`btn btn-${variant} btn-lg px-4`}
                onClick={() => {
                  setRole(value)
                  if (value === 'guest') {
                    navigate('/guest/schedule')
                  } else {
                    navigate('/admin/appointments')
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {role && (
            <div className="alert alert-info mt-4 mb-0" role="status">
              <strong>Great!</strong> You selected the{' '}
              <span className="text-capitalize">{role}</span> flow. We&apos;ll build the next steps
              shortly.
            </div>
          )}
        </div>
      </article>
    </section>
  )
}

