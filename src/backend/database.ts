import type { Participant, Raffle, User, Winner } from './domain';

export type DatabaseState = {
  users: User[];
  raffles: Raffle[];
  participants: Participant[];
  winners: Winner[];
  sessions: Array<{ token: string; userId: string }>;
};

export const createEmptyState = (): DatabaseState => ({
  users: [],
  raffles: [],
  participants: [],
  winners: [],
  sessions: []
});

export class InMemoryDatabase {
  private state: DatabaseState;

  constructor(initialState: DatabaseState = createEmptyState()) {
    this.state = initialState;
  }

  get data() {
    return this.state;
  }
}
