import {
  applySnapshot,
  types,
  type Instance,
  type SnapshotIn,
  type SnapshotOut,
} from 'mobx-state-tree'

import { AppointmentsStoreModel } from '@/models/appointments-model/appointments-store'
import { AvailabilityStoreModel } from '@/models/availability-model/availability-model'

export const RootStoreModel = types.model('RootStore', {
  appointments: types.optional(AppointmentsStoreModel, {
    items: [],
    status: 'idle',
    error: null,
    page: 1,
    hasPrevious: false,
    hasNext: false,
    weekStart: null,
    weekEnd: null,
  }),
  availability: types.optional(AvailabilityStoreModel, {
    days: [],
    page: 0,
    weekStart: null,
    weekEnd: null,
    status: 'idle',
    error: null,
  }),
})

export type RootStore = Instance<typeof RootStoreModel>
export type RootStoreSnapshotIn = SnapshotIn<typeof RootStoreModel>
export type RootStoreSnapshotOut = SnapshotOut<typeof RootStoreModel>

export class RootStoreSingleton {
  public readonly store: RootStore

  constructor(initialState: RootStoreSnapshotIn | null) {
    const defaultState: RootStoreSnapshotIn =
      initialState ??
      ({
        appointments: {
          items: [],
          status: 'idle',
          error: null,
          page: 1,
          hasPrevious: false,
          hasNext: false,
          weekStart: null,
          weekEnd: null,
        },
        availability: {
          days: [],
          page: 0,
          weekStart: null,
          weekEnd: null,
          status: 'idle',
          error: null,
        },
      } satisfies RootStoreSnapshotIn)

    this.store = RootStoreModel.create(defaultState)
  }

  hydrate(snapshot: RootStoreSnapshotIn) {
    applySnapshot(this.store, snapshot)
  }
}

export const rootStoreSingleton = new RootStoreSingleton(null)

