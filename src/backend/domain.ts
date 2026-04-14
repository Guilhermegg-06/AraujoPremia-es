export type UserRole = 'admin' | 'user';
export type RaffleStatus = 'draft' | 'open' | 'closed' | 'completed';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
};

export type PublicUser = Omit<User, 'password'>;

export type Session = {
  token: string;
  user: PublicUser;
};

export type Raffle = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  winnerCount: number;
  status: RaffleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Participant = {
  id: string;
  raffleId: string;
  userId: string;
  joinedAt: string;
};

export type Winner = {
  id: string;
  raffleId: string;
  userId: string;
  selectedAt: string;
  selectedBy: 'manual' | 'automatic';
};

export type RaffleInput = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  winnerCount: number;
};

export type RaffleStats = {
  totalParticipants: number;
  totalWinners: number;
  pendingWinnerSlots: number;
  status: RaffleStatus;
};

export type UserParticipation = {
  raffle: Raffle;
  participant: Participant;
  isWinner: boolean;
};
