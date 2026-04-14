import { createBackend } from '../src/backend/services';

const tests: Array<{ name: string; run: () => void }> = [];

const test = (name: string, run: () => void) => {
  tests.push({ name, run });
};

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertThrows = (run: () => void, message: string) => {
  let failed = false;

  try {
    run();
  } catch {
    failed = true;
  }

  assert(failed, message);
};

const raffleInput = {
  title: 'Kit da Resenha Premium',
  description: 'Kit com bebidas e energeticos para sorteio.',
  startsAt: '2026-05-01T10:00:00.000Z',
  endsAt: '2026-05-10T22:00:00.000Z',
  winnerCount: 2
};

test('cadastra usuario e impede email duplicado', () => {
  const { auth } = createBackend();
  const session = auth.registerUser({ name: 'Cliente Um', email: 'cliente@test.com', password: '123456' });

  assert(session.user.role === 'user', 'usuario deve ter role user');
  assert(session.token.startsWith('session_'), 'cadastro deve retornar sessao');
  assertThrows(
    () => auth.registerUser({ name: 'Cliente Dois', email: 'cliente@test.com', password: '123456' }),
    'deve bloquear email duplicado'
  );
});

test('login retorna sessao e rejeita credenciais invalidas', () => {
  const { auth } = createBackend();
  auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });

  const session = auth.login('cliente@test.com', '123456');

  assert(session.user.email === 'cliente@test.com', 'login deve retornar usuario correto');
  assertThrows(() => auth.login('cliente@test.com', 'errada'), 'deve rejeitar senha incorreta');
});

test('administrador cria, edita, abre e fecha sorteio', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });

  const raffle = raffles.createRaffle(admin.token, raffleInput);
  assert(raffle.status === 'draft', 'sorteio deve nascer em draft');

  const updated = raffles.updateRaffle(admin.token, raffle.id, { title: 'Kit Atualizado' });
  assert(updated.title === 'Kit Atualizado', 'admin deve editar sorteio');

  assert(raffles.openRaffle(admin.token, raffle.id).status === 'open', 'admin deve abrir sorteio');
  assert(raffles.closeRaffle(admin.token, raffle.id).status === 'closed', 'admin deve fechar sorteio');
});

test('usuario participa de sorteio aberto e nao duplica participacao', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const user = auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  raffles.openRaffle(admin.token, raffle.id);
  const first = raffles.participate(user.token, raffle.id);
  const second = raffles.participate(user.token, raffle.id);

  assert(first.id === second.id, 'participacao repetida deve retornar a existente');
  assert(raffles.getUserParticipations(user.token).length === 1, 'usuario deve ver sorteios em que participou');
});

test('usuario nao participa de sorteio fechado', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const user = auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  assertThrows(() => raffles.participate(user.token, raffle.id), 'deve bloquear participacao fora de sorteio aberto');
});

test('administrador lista participantes, marca ganhador e acompanha estatisticas', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const user = auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  raffles.openRaffle(admin.token, raffle.id);
  raffles.participate(user.token, raffle.id);

  const participants = raffles.listParticipants(admin.token, raffle.id);
  assert(participants.length === 1, 'admin deve ver lista de participantes');

  const winner = raffles.markWinner(admin.token, raffle.id, user.user.id);
  assert(winner.selectedBy === 'manual', 'ganhador manual deve ser marcado como manual');

  const stats = raffles.getStats(admin.token, raffle.id);
  assert(stats.totalParticipants === 1, 'estatistica deve contar participantes');
  assert(stats.totalWinners === 1, 'estatistica deve contar ganhadores');
});

test('sorteio automatico escolhe ganhadores dentro do limite', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const first = auth.registerUser({ name: 'Primeiro', email: 'primeiro@test.com', password: '123456' });
  const second = auth.registerUser({ name: 'Segundo', email: 'segundo@test.com', password: '123456' });
  const third = auth.registerUser({ name: 'Terceiro', email: 'terceiro@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  raffles.openRaffle(admin.token, raffle.id);
  raffles.participate(first.token, raffle.id);
  raffles.participate(second.token, raffle.id);
  raffles.participate(third.token, raffle.id);

  const winners = raffles.drawWinners(admin.token, raffle.id);
  assert(winners.length === 2, 'deve selecionar apenas a quantidade configurada de ganhadores');
  assert(winners.every((winner) => winner.selectedBy === 'automatic'), 'ganhadores automaticos devem ser marcados corretamente');
});

test('administrador conclui e exclui sorteio', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const user = auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  raffles.openRaffle(admin.token, raffle.id);
  raffles.participate(user.token, raffle.id);
  raffles.markWinner(admin.token, raffle.id, user.user.id);

  assert(raffles.completeRaffle(admin.token, raffle.id).status === 'completed', 'deve concluir sorteio com ganhador');
  raffles.deleteRaffle(admin.token, raffle.id);
  assert(raffles.listRaffles().length === 0, 'deve excluir sorteio e dados relacionados');
});

test('usuario escolhe entre multiplos sorteios e acompanha cada participacao', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const user = auth.registerUser({ name: 'Cliente', email: 'cliente@test.com', password: '123456' });
  const firstRaffle = raffles.createRaffle(admin.token, { ...raffleInput, title: 'Primeiro sorteio' });
  const secondRaffle = raffles.createRaffle(admin.token, { ...raffleInput, title: 'Segundo sorteio' });

  raffles.openRaffle(admin.token, firstRaffle.id);
  raffles.openRaffle(admin.token, secondRaffle.id);
  raffles.participate(user.token, secondRaffle.id);
  raffles.participate(user.token, firstRaffle.id);

  const participations = raffles.getUserParticipations(user.token);
  assert(participations.length === 2, 'usuario deve acompanhar todos os sorteios que escolheu');
  assert(participations.some((item) => item.raffle.title === 'Primeiro sorteio'), 'historico deve incluir o primeiro sorteio');
  assert(participations.some((item) => item.raffle.title === 'Segundo sorteio'), 'historico deve incluir o segundo sorteio');
});

test('sorteio concluido bloqueia alteracoes de status e ganhadores', () => {
  const { auth, raffles } = createBackend();
  const admin = auth.createAdmin({ name: 'Admin', email: 'admin@test.com', password: '123456' });
  const winner = auth.registerUser({ name: 'Ganhador', email: 'ganhador@test.com', password: '123456' });
  const other = auth.registerUser({ name: 'Outro', email: 'outro@test.com', password: '123456' });
  const raffle = raffles.createRaffle(admin.token, raffleInput);

  raffles.openRaffle(admin.token, raffle.id);
  raffles.participate(winner.token, raffle.id);
  raffles.participate(other.token, raffle.id);
  raffles.markWinner(admin.token, raffle.id, winner.user.id);
  raffles.completeRaffle(admin.token, raffle.id);

  assertThrows(() => raffles.openRaffle(admin.token, raffle.id), 'nao deve reabrir sorteio concluido');
  assertThrows(() => raffles.closeRaffle(admin.token, raffle.id), 'nao deve fechar novamente sorteio concluido');
  assertThrows(() => raffles.markWinner(admin.token, raffle.id, other.user.id), 'nao deve marcar ganhador depois de concluido');
  assertThrows(() => raffles.drawWinners(admin.token, raffle.id), 'nao deve sortear depois de concluido');
});
let failures = 0;

for (const item of tests) {
  try {
    item.run();
    console.log(`ok - ${item.name}`);
  } catch (error) {
    failures += 1;
    console.error(`fail - ${item.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  throw new Error(`${failures} teste(s) falharam.`);
}
