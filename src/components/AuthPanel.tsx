import type { FormEvent } from 'react';
import type { PublicUser, Session } from '../backend/domain';

type AuthPanelProps = {
  session: Session | null;
  authMode: 'login' | 'register';
  authMessage: string;
  form: { name: string; email: string; password: string };
  onChangeForm: (field: 'name' | 'email' | 'password', value: string) => void;
  onChangeMode: (mode: 'login' | 'register') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
};

const RoleBadge = ({ user }: { user: PublicUser }) => (
  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
  </span>
);

export function AuthPanel({ session, authMode, authMessage, form, onChangeForm, onChangeMode, onSubmit, onLogout }: AuthPanelProps) {
  if (session) {
    return (
      <section className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Sessao ativa</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">{session.user.name}</h2>
            <p className="mt-1 text-sm text-stone-600">{session.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoleBadge user={session.user} />
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Sair
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Conta do participante</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            {authMode === 'login' ? 'Entrar no sistema' : 'Criar cadastro'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Agora o usuario pode se cadastrar, entrar e acompanhar os sorteios em que participa.
          </p>
        </div>
        <div className="flex rounded-full bg-stone-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => onChangeMode('login')}
            className={`rounded-full px-4 py-2 ${authMode === 'login' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onChangeMode('register')}
            className={`rounded-full px-4 py-2 ${authMode === 'register' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}
          >
            Cadastro
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
        {authMode === 'register' && (
          <input
            value={form.name}
            onChange={(event) => onChangeForm('name', event.target.value)}
            placeholder="Nome completo"
            className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
          />
        )}
        <input
          value={form.email}
          onChange={(event) => onChangeForm('email', event.target.value)}
          placeholder="E-mail"
          className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => onChangeForm('password', event.target.value)}
          placeholder="Senha"
          className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
        />
        <button type="submit" className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800">
          {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      {authMessage && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{authMessage}</p>}
    </section>
  );
}
