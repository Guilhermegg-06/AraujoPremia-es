import { InMemoryDatabase } from './database';
import type { PublicUser, Raffle, RaffleInput, RaffleStats, Session, User, UserParticipation, Winner } from './domain';

const now = () => new Date().toISOString();
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const toPublicUser = ({ password: _password, ...user }: User): PublicUser => user;

let nextId = 1;
const makeId = (prefix: string) => `${prefix}_${nextId++}`;

export class AuthService {
  constructor(private readonly db: InMemoryDatabase) {}

  registerUser(input: { name: string; email: string; password: string }): Session {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);

    if (!name) {
      throw new Error('Nome e obrigatorio.');
    }

    if (!email.includes('@')) {
      throw new Error('E-mail invalido.');
    }

    if (input.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres.');
    }

    if (this.db.data.users.some((user) => user.email === email)) {
      throw new Error('E-mail ja cadastrado.');
    }

    const user: User = {
      id: makeId('user'),
      name,
      email,
      password: input.password,
      role: 'user',
      createdAt: now()
    };

    this.db.data.users.push(user);
    return this.createSession(user.id);
  }

  createAdmin(input: { name: string; email: string; password: string }): Session {
    const email = normalizeEmail(input.email);

    if (this.db.data.users.some((user) => user.email === email)) {
      throw new Error('E-mail ja cadastrado.');
    }

    const user: User = {
      id: makeId('admin'),
      name: input.name.trim(),
      email,
      password: input.password,
      role: 'admin',
      createdAt: now()
    };

    this.db.data.users.push(user);
    return this.createSession(user.id);
  }

  login(emailInput: string, password: string): Session {
    const email = normalizeEmail(emailInput);
    const user = this.db.data.users.find((candidate) => candidate.email === email && candidate.password === password);

    if (!user) {
      throw new Error('Credenciais invalidas.');
    }

    return this.createSession(user.id);
  }

  requireUser(token: string) {
    const session = this.db.data.sessions.find((item) => item.token === token);
    const user = session ? this.db.data.users.find((candidate) => candidate.id === session.userId) : undefined;

    if (!user) {
      throw new Error('Sessao invalida.');
    }

    return user;
  }

  requireAdmin(token: string) {
    const user = this.requireUser(token);

    if (user.role !== 'admin') {
      throw new Error('Acesso restrito ao administrador.');
    }

    return user;
  }

  private createSession(userId: string): Session {
    const user = this.db.data.users.find((candidate) => candidate.id === userId);

    if (!user) {
      throw new Error('Usuario nao encontrado.');
    }

    const token = makeId('session');
    this.db.data.sessions.push({ token, userId });

    return {
      token,
      user: toPublicUser(user)
    };
  }
}

export class RaffleService {
  constructor(
    private readonly db: InMemoryDatabase,
    private readonly auth: AuthService
  ) {}

  createRaffle(adminToken: string, input: RaffleInput): Raffle {
    const admin = this.auth.requireAdmin(adminToken);
    const raffle = this.buildRaffle(input, admin.id);

    this.db.data.raffles.push(raffle);
    return raffle;
  }

  updateRaffle(adminToken: string, raffleId: string, input: Partial<RaffleInput>): Raffle {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);

    if (raffle.status === 'completed') {
      throw new Error('Sorteio concluido nao pode ser editado.');
    }

    const nextInput = {
      title: input.title ?? raffle.title,
      description: input.description ?? raffle.description,
      startsAt: input.startsAt ?? raffle.startsAt,
      endsAt: input.endsAt ?? raffle.endsAt,
      winnerCount: input.winnerCount ?? raffle.winnerCount
    };

    this.validateRaffleInput(nextInput);

    Object.assign(raffle, nextInput, { updatedAt: now() });
    return raffle;
  }

  openRaffle(adminToken: string, raffleId: string): Raffle {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);
    this.ensureNotCompleted(raffle);
    raffle.status = 'open';
    raffle.updatedAt = now();
    return raffle;
  }

  closeRaffle(adminToken: string, raffleId: string): Raffle {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);
    this.ensureNotCompleted(raffle);
    raffle.status = 'closed';
    raffle.updatedAt = now();
    return raffle;
  }

  completeRaffle(adminToken: string, raffleId: string): Raffle {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);

    if (this.getWinners(raffleId).length === 0) {
      throw new Error('Defina pelo menos um ganhador antes de concluir.');
    }

    raffle.status = 'completed';
    raffle.updatedAt = now();
    return raffle;
  }

  deleteRaffle(adminToken: string, raffleId: string) {
    this.auth.requireAdmin(adminToken);
    this.findRaffle(raffleId);

    this.db.data.raffles = this.db.data.raffles.filter((raffle) => raffle.id !== raffleId);
    this.db.data.participants = this.db.data.participants.filter((participant) => participant.raffleId !== raffleId);
    this.db.data.winners = this.db.data.winners.filter((winner) => winner.raffleId !== raffleId);
  }

  participate(userToken: string, raffleId: string) {
    const user = this.auth.requireUser(userToken);
    const raffle = this.findRaffle(raffleId);

    if (user.role !== 'user') {
      throw new Error('Administrador nao participa como usuario comum.');
    }

    if (raffle.status !== 'open') {
      throw new Error('Sorteio nao esta aberto.');
    }

    const existing = this.db.data.participants.find(
      (participant) => participant.raffleId === raffleId && participant.userId === user.id
    );

    if (existing) {
      return existing;
    }

    const participant = {
      id: makeId('participant'),
      raffleId,
      userId: user.id,
      joinedAt: now()
    };

    this.db.data.participants.push(participant);
    return participant;
  }

  listParticipants(adminToken: string, raffleId: string) {
    this.auth.requireAdmin(adminToken);
    this.findRaffle(raffleId);

    return this.db.data.participants
      .filter((participant) => participant.raffleId === raffleId)
      .map((participant) => ({
        participant,
        user: toPublicUser(this.db.data.users.find((user) => user.id === participant.userId)!)
      }));
  }

  markWinner(adminToken: string, raffleId: string, userId: string): Winner {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);
    this.ensureNotCompleted(raffle);
    const participant = this.db.data.participants.find(
      (candidate) => candidate.raffleId === raffleId && candidate.userId === userId
    );

    if (!participant) {
      throw new Error('Usuario nao participa deste sorteio.');
    }

    const existing = this.db.data.winners.find((winner) => winner.raffleId === raffleId && winner.userId === userId);

    if (existing) {
      return existing;
    }

    if (this.getWinners(raffleId).length >= raffle.winnerCount) {
      throw new Error('Limite de ganhadores atingido.');
    }

    const winner = {
      id: makeId('winner'),
      raffleId,
      userId,
      selectedAt: now(),
      selectedBy: 'manual' as const
    };

    this.db.data.winners.push(winner);
    return winner;
  }

  drawWinners(adminToken: string, raffleId: string): Winner[] {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);
    this.ensureNotCompleted(raffle);
    const currentWinners = this.getWinners(raffleId);
    const remainingSlots = raffle.winnerCount - currentWinners.length;

    if (remainingSlots <= 0) {
      return currentWinners;
    }

    const currentWinnerIds = new Set(currentWinners.map((winner) => winner.userId));
    const participants = this.db.data.participants
      .filter((participant) => participant.raffleId === raffleId && !currentWinnerIds.has(participant.userId))
      .sort((left, right) => left.joinedAt.localeCompare(right.joinedAt));

    const selected = participants.slice(0, remainingSlots).map((participant) => ({
      id: makeId('winner'),
      raffleId,
      userId: participant.userId,
      selectedAt: now(),
      selectedBy: 'automatic' as const
    }));

    this.db.data.winners.push(...selected);
    return this.getWinners(raffleId);
  }

  getStats(adminToken: string, raffleId: string): RaffleStats {
    this.auth.requireAdmin(adminToken);
    const raffle = this.findRaffle(raffleId);
    const totalParticipants = this.db.data.participants.filter((participant) => participant.raffleId === raffleId).length;
    const totalWinners = this.getWinners(raffleId).length;

    return {
      totalParticipants,
      totalWinners,
      pendingWinnerSlots: Math.max(raffle.winnerCount - totalWinners, 0),
      status: raffle.status
    };
  }

  getUserParticipations(userToken: string): UserParticipation[] {
    const user = this.auth.requireUser(userToken);

    return this.db.data.participants
      .filter((participant) => participant.userId === user.id)
      .map((participant) => {
        const raffle = this.findRaffle(participant.raffleId);
        const isWinner = this.getWinners(raffle.id).some((winner) => winner.userId === user.id);

        return { raffle, participant, isWinner };
      });
  }

  listRaffles() {
    return this.db.data.raffles.slice();
  }

  private buildRaffle(input: RaffleInput, adminId: string): Raffle {
    this.validateRaffleInput(input);

    return {
      id: makeId('raffle'),
      title: input.title.trim(),
      description: input.description.trim(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      winnerCount: input.winnerCount,
      status: 'draft',
      createdBy: adminId,
      createdAt: now(),
      updatedAt: now()
    };
  }

  private validateRaffleInput(input: RaffleInput) {
    if (!input.title.trim()) {
      throw new Error('Nome do sorteio e obrigatorio.');
    }

    if (!input.description.trim()) {
      throw new Error('Descricao do sorteio e obrigatoria.');
    }

    if (Number.isNaN(Date.parse(input.startsAt)) || Number.isNaN(Date.parse(input.endsAt))) {
      throw new Error('Datas do sorteio sao obrigatorias.');
    }

    if (new Date(input.startsAt) >= new Date(input.endsAt)) {
      throw new Error('Data de inicio deve ser antes da data de fim.');
    }

    if (!Number.isInteger(input.winnerCount) || input.winnerCount < 1) {
      throw new Error('Quantidade de ganhadores deve ser maior que zero.');
    }
  }

  private ensureNotCompleted(raffle: Raffle) {
    if (raffle.status === 'completed') {
      throw new Error('Sorteio concluido nao pode ser alterado.');
    }
  }

  private findRaffle(raffleId: string) {
    const raffle = this.db.data.raffles.find((candidate) => candidate.id === raffleId);

    if (!raffle) {
      throw new Error('Sorteio nao encontrado.');
    }

    return raffle;
  }

  private getWinners(raffleId: string) {
    return this.db.data.winners.filter((winner) => winner.raffleId === raffleId);
  }
}

export const createBackend = () => {
  const db = new InMemoryDatabase();
  const auth = new AuthService(db);
  const raffles = new RaffleService(db, auth);

  return { db, auth, raffles };
};
