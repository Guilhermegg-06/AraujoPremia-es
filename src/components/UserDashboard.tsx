import type { Raffle, Session, UserParticipation } from '../backend/domain';

const statusLabel = {
  draft: 'Rascunho',
  open: 'Aberto',
  closed: 'Fechado',
  completed: 'Concluido'
};

type UserDashboardProps = {
  session: Session | null;
  raffles: Raffle[];
  participations: UserParticipation[];
  userMessage: string;
  onParticipate: (raffleId: string) => void;
};

const getResultLabel = (item: UserParticipation) => {
  if (item.raffle.status !== 'completed') {
    return 'Aguardando resultado';
  }

  return item.isWinner ? 'Ganhador' : 'Nao sorteado';
};

export function UserDashboard({ session, raffles, participations, userMessage, onParticipate }: UserDashboardProps) {
  const participationIds = new Set(participations.map((item) => item.raffle.id));

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Area do usuario</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950">Escolher sorteio</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          O usuario entra na conta, escolhe o sorteio disponivel e confirma a participacao com um clique.
        </p>

        {raffles.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-stone-200 px-4 py-6 text-sm leading-6 text-stone-500">
            Nenhum sorteio publicado no momento.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {raffles.map((item) => {
              const alreadyParticipating = participationIds.has(item.id);
              const canParticipate = Boolean(session && session.user.role === 'user' && item.status === 'open' && !alreadyParticipating);

              return (
                <article key={item.id} className="rounded-3xl border border-black/5 bg-stone-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">{statusLabel[item.status]}</span>
                      <h3 className="mt-3 text-lg font-semibold text-stone-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                      <p className="mt-2 text-xs text-stone-500">
                        {new Date(item.startsAt).toLocaleDateString('pt-BR')} ate {new Date(item.endsAt).toLocaleDateString('pt-BR')} - {item.winnerCount} ganhador(es)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onParticipate(item.id)}
                      disabled={!canParticipate}
                      className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      {alreadyParticipating ? 'Participando' : 'Participar'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {userMessage && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{userMessage}</p>}
      </div>

      <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Minhas participacoes</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950">Historico e resultados</h2>

        {participations.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-stone-200 px-4 py-6 text-sm leading-6 text-stone-500">
            Nenhuma participacao registrada nesta sessao.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {participations.map((item) => {
              const resultLabel = getResultLabel(item);
              const resultClass = item.isWinner
                ? 'bg-amber-100 text-amber-800'
                : item.raffle.status === 'completed'
                  ? 'bg-stone-200 text-stone-700'
                  : 'bg-white text-stone-600';

              return (
                <div key={item.participant.id} className="rounded-2xl bg-stone-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{item.raffle.title}</p>
                      <p className="mt-1 text-xs text-stone-500">Participou em {new Date(item.participant.joinedAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resultClass}`}>
                      {resultLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
