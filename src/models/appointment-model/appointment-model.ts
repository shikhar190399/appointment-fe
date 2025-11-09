import { types, type Instance, type SnapshotIn, type SnapshotOut } from 'mobx-state-tree'

export const AppointmentModel = types.model('Appointment', {
  id: types.identifierNumber,
  startTime: types.string,
  name: types.string,
  email: types.string,
  phone: types.maybeNull(types.string),
  reason: types.maybeNull(types.string),
  createdAt: types.string,
})

export type Appointment = Instance<typeof AppointmentModel>
export type AppointmentSnapshotIn = SnapshotIn<typeof AppointmentModel>
export type AppointmentSnapshotOut = SnapshotOut<typeof AppointmentModel>

