import type { FormEvent } from 'react';
import type { Raffle, RaffleStats, Session } from '../backend/domain';

const statusLabel = {
  draft: 'Rascunho',
  open: 'Aberto',
  closed: 'Fechado',
  completed: 'Concluido'
};

type AdminDashboardProps = {
  session: Session | null;
  raffles: Raffle[];
  selectedRaffleId: string | null;
  activeRaffle: Raffle | null;
  stats: RaffleStats | null;
  participants: Array<{ participant: { id: string; userId: string }; user: { id: string; name: string; email: string } }>;
  adminMessage: string;
  form: { title: string; description: string; startsAt: string; endsAt: string; winnerCount: number };
  onChangeForm: (field: 'title' | 'description' | 'startsAt' | 'endsAt' | 'winnerCount', value: string | number) => void;
  onSelectRaffle: (raffleId: string) => void;
  onStartNew: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOpen: () => void;
  onClose: () => void;
  onDraw: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onMarkWinner: (userId: string) => void;
};

export function AdminDashboard({
  session,
  raffles,
  selectedRaffleId,
  activeRaffle,
  stats,
  participants,
  adminMessage,
  form,
  onChangeForm,
  onSelectRaffle,
  onStartNew,
  onSubmit,
  onOpen,
  onClose,
  onDraw,
  onComplete,
  onDelete,
  onMarkWinner
}: AdminDashboardProps) {
  if (!session || session.user.role !== 'admin') {
    return (
      <section className="rounded-[30px] border border-dashed border-stone-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Area administrativa</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950">Entre como admin para gerenciar sorteios.</h2>
        <p className="mt-3 text-sm text-stone-600">Use o login administrativo cadastrado na base inicial desta versao.</p>
      </section>
    );
  }

  const hasActiveRaffle = Boolean(activeRaffle);
  const isCompleted = activeRaffle?.status === 'completed';
  const canChangeRaffle = hasActiveRaffle && !isCompleted;
  const disabledActionClass = 'disabled:cursor-not-allowed disabled:opacity-45';

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Painel admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">{activeRaffle ? 'Editar sorteio' : 'Criar novo sorteio'}</h2>
          </div>
          <button type="button" onClick={onStartNew} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
            Novo sorteio
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            value={form.title}
            onChange={(event) => onChangeForm('title', event.target.value)}
            placeholder="Nome do sorteio"
            className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
          />
          <textarea
            value={form.description}
            onChange={(event) => onChangeForm('description', event.target.value)}
            placeholder="Descricao do sorteio"
            className="min-h-24 w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => onChangeForm('startsAt', event.target.value)}
              className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
            />
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => onChangeForm('endsAt', event.target.value)}
              className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
            />
            <input
              type="number"
              min={1}
              value={form.winnerCount}
              onChange={(event) => onChangeForm('winnerCount', Number(event.target.value))}
              className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
            />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800">
            {activeRaffle ? 'Salvar alteracoes' : 'Criar sorteio'}
          </button>
        </form>

        {adminMessage && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{adminMessage}</p>}

        <div className="mt-6 rounded-3xl bg-stone-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Sorteios cadastrados</p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">{raffles.length}</span>
          </div>

          {raffles.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-5 text-sm text-stone-500">Nenhum sorteio criado ainda.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {raffles.map((item) => {
                const isSelected = selectedRaffleId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRaffle(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${isSelected ? 'border-brand-300 bg-white shadow-sm' : 'border-transparent bg-white/70 hover:bg-white'}`}
                  >
                    <span className="block text-sm font-semibold text-stone-950">{item.title}</span>
                    <span className="mt-1 block text-xs text-stone-500">{statusLabel[item.status]} - {new Date(item.startsAt).toLocaleDateString('pt-BR')}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Sorteio selecionado</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">{activeRaffle?.title ?? 'Nenhum sorteio selecionado'}</h2>
              {activeRaffle && <p className="mt-1 text-sm text-stone-600">Status: {statusLabel[activeRaffle.status]}</p>}
            </div>
            {isCompleted && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Concluido</span>}
          </div>

          {stats && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Participantes</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{stats.totalParticipants}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Ganhadores</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{stats.totalWinners}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Vagas</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{stats.pendingWinnerSlots}</p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={onOpen} disabled={!canChangeRaffle} className={`rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white ${disabledActionClass}`}>Abrir</button>
            <button type="button" onClick={onClose} disabled={!canChangeRaffle} className={`rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white ${disabledActionClass}`}>Fechar</button>
            <button type="button" onClick={onDraw} disabled={!canChangeRaffle} className={`rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white ${disabledActionClass}`}>Sortear auto</button>
            <button type="button" onClick={onComplete} disabled={!hasActiveRaffle} className={`rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 ${disabledActionClass}`}>Concluir</button>
            <button type="button" onClick={onDelete} disabled={!hasActiveRaffle} className={`rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ${disabledActionClass}`}>Excluir</button>
          </div>
        </div>

        <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Participantes</p>
          {participants.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-stone-200 px-4 py-6 text-sm text-stone-500">Ainda nao ha participantes.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {participants.map(({ participant, user }) => (
                <div key={participant.id} className="flex flex-col gap-3 rounded-2xl bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onMarkWinner(user.id)}
                    disabled={!canChangeRaffle}
                    className={`rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-white ${disabledActionClass}`}
                  >
                    Marcar ganhador
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
