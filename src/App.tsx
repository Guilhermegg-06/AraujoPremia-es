import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createBackend } from './backend/services';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPanel } from './components/AuthPanel';
import { BrandHeader } from './components/BrandHeader';
import { CartPage } from './components/CartPage';
import { HomePage } from './components/HomePage';
import { RaffleDetailPage } from './components/RaffleDetailPage';
import { UserDashboard } from './components/UserDashboard';
import { MAX_SELECTION, SELLER_PHONE, raffle } from './data/raffle';
import type { CartItem } from './types/raffle';
import type { Raffle, RaffleInput, RaffleStats, Session, UserParticipation } from './backend/domain';
import { buildNumberGrid, getAvailableNumbers, mergeNumbers } from './utils/raffle';
import { buildWhatsAppUrl } from './utils/whatsapp';

type AppPage = 'home' | 'detail' | 'cart' | 'account' | 'admin';

type AuthMode = 'login' | 'register';

type AdminForm = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  winnerCount: number;
};

const adminCredentials = {
  name: 'Administrador Araujo',
  email: 'admin@araujo.local',
  password: 'admin123'
};

const initialRaffleInput: RaffleInput = {
  title: 'Kit da Resenha Premium',
  description: 'Sorteio de um kit montado para a resenha com bebidas e energeticos.',
  startsAt: '2026-05-01T10:00:00.000Z',
  endsAt: '2026-05-18T22:00:00.000Z',
  winnerCount: 1
};

const toDateTimeLocal = (value: string) => value ? value.slice(0, 16) : '';
const fromDateTimeLocal = (value: string) => value ? new Date(value).toISOString() : '';

const pageFromPath = (path: string): AppPage => {
  if (path.startsWith('/admin')) {
    return 'admin';
  }

  if (path.startsWith('/usuario')) {
    return 'account';
  }

  if (path.startsWith('/carrinho')) {
    return 'cart';
  }

  if (path.startsWith('/sorteio')) {
    return 'detail';
  }

  return 'home';
};

const pathFromPage = (target: AppPage) => {
  const paths: Record<AppPage, string> = {
    home: '/',
    detail: '/sorteio',
    cart: '/carrinho',
    account: '/usuario',
    admin: '/admin'
  };

  return paths[target];
};
const buildDefaultAdminForm = (): AdminForm => {
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(startsAt.getDate() + 7);

  return {
    title: '',
    description: '',
    startsAt: toDateTimeLocal(startsAt.toISOString()),
    endsAt: toDateTimeLocal(endsAt.toISOString()),
    winnerCount: 1
  };
};

const toAdminForm = (target: Raffle): AdminForm => ({
  title: target.title,
  description: target.description,
  startsAt: toDateTimeLocal(target.startsAt),
  endsAt: toDateTimeLocal(target.endsAt),
  winnerCount: target.winnerCount
});

function App() {
  const backend = useMemo(() => {
    const services = createBackend();
    const admin = services.auth.createAdmin(adminCredentials);
    const createdRaffle = services.raffles.createRaffle(admin.token, initialRaffleInput);
    services.raffles.openRaffle(admin.token, createdRaffle.id);
    return services;
  }, []);

  const initialBackendRaffle = backend.raffles.listRaffles()[0] ?? null;
  const [page, setPage] = useState<AppPage>(() => pageFromPath(window.location.pathname));
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authMessage, setAuthMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [version, setVersion] = useState(0);
  const [selectedBackendRaffleId, setSelectedBackendRaffleId] = useState<string | null>(initialBackendRaffle?.id ?? null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [adminForm, setAdminForm] = useState<AdminForm>(() => initialBackendRaffle ? toAdminForm(initialBackendRaffle) : buildDefaultAdminForm());

  const appRaffles = backend.raffles.listRaffles();
  const selectedAdminRaffle = selectedBackendRaffleId
    ? appRaffles.find((item) => item.id === selectedBackendRaffleId) ?? null
    : null;
  const visibleUserRaffles = appRaffles.filter((item) => item.status !== 'draft');
  const adminToken = session?.user.role === 'admin' ? session.token : '';
  const activeNumbers = useMemo(() => buildNumberGrid(raffle), []);
  const availableNumbers = getAvailableNumbers(raffle);
  const cartCount = cartItems.reduce((total, item) => total + item.numbers.length, 0);
  const cartTotal = cartItems.reduce((total, item) => total + raffle.price * item.numbers.length, 0);

  const adminStats: RaffleStats | null = adminToken && selectedAdminRaffle
    ? backend.raffles.getStats(adminToken, selectedAdminRaffle.id)
    : null;

  const backendParticipants = adminToken && selectedAdminRaffle
    ? backend.raffles.listParticipants(adminToken, selectedAdminRaffle.id)
    : [];

  const userParticipations: UserParticipation[] = session?.user.role === 'user'
    ? backend.raffles.getUserParticipations(session.token)
    : [];

  const currentCartNumbers =
    cartItems.find((item) => item.raffleId === raffle.id)?.numbers.slice().sort((a, b) => a - b) ?? [];

  const detailCheckoutUrl =
    selectedNumbers.length > 0 ? buildWhatsAppUrl(raffle, [{ raffleId: raffle.id, numbers: selectedNumbers }], SELLER_PHONE) : '#';

  const cartCheckoutUrl = cartItems.length > 0 ? buildWhatsAppUrl(raffle, cartItems, SELLER_PHONE) : '#';

  const refresh = () => setVersion((current) => current + 1);

  useEffect(() => {
    const handlePopState = () => {
      setPage(pageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (target: AppPage) => {
    const nextPath = pathFromPage(target);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPage(target);
  };
  const handleGoHome = () => {
    navigateTo('home');
    setSelectedNumbers([]);
  };

  const handleOpenCart = () => {
    navigateTo('cart');
  };

  const handleOpenAccount = () => {
    navigateTo('account');
  };

  const handleOpenRaffle = () => {
    setSelectedNumbers([]);
    navigateTo('detail');
  };

  const handleToggleNumber = (value: number) => {
    if (raffle.status !== 'open') {
      return;
    }

    setSelectedNumbers((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value].sort((a, b) => a - b).slice(0, MAX_SELECTION);
    });
  };

  const handleAddToCart = () => {
    if (selectedNumbers.length === 0 || raffle.status !== 'open') {
      return;
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.raffleId === raffle.id);

      if (!existingItem) {
        return [...current, { raffleId: raffle.id, numbers: selectedNumbers }];
      }

      return current.map((item) =>
        item.raffleId === raffle.id ? { ...item, numbers: mergeNumbers(item.numbers, selectedNumbers) } : item
      );
    });

    setSelectedNumbers([]);
    navigateTo('cart');
  };

  const handleBuyNow = () => {
    if (selectedNumbers.length === 0 || raffle.status !== 'open') {
      return;
    }

    window.open(detailCheckoutUrl, '_blank', 'noopener,noreferrer');
  };

  const updateAuthForm = (field: keyof typeof authForm, value: string) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const nextSession = authMode === 'register'
        ? backend.auth.registerUser(authForm)
        : backend.auth.login(authForm.email, authForm.password);

      setSession(nextSession);
      setAuthMessage(authMode === 'register' ? 'Cadastro criado com sucesso.' : 'Login realizado com sucesso.');
      setUserMessage('');
      setAdminMessage('');
      setAuthForm({ name: '', email: '', password: '' });
      refresh();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Nao foi possivel autenticar.');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setAuthMessage('Sessao encerrada.');
    setUserMessage('');
    setAdminMessage('');
    navigateTo('account');
  };

  const handleParticipate = (raffleId: string) => {
    if (!session) {
      setUserMessage('Entre como usuario para participar.');
      return;
    }

    try {
      backend.raffles.participate(session.token, raffleId);
      setUserMessage('Participacao confirmada com sucesso.');
      refresh();
    } catch (error) {
      setUserMessage(error instanceof Error ? error.message : 'Nao foi possivel participar.');
    }
  };

  const updateAdminForm = (field: keyof AdminForm, value: string | number) => {
    setAdminForm((current) => ({ ...current, [field]: value }));
  };

  const buildAdminInput = (): RaffleInput => ({
    title: adminForm.title,
    description: adminForm.description,
    startsAt: fromDateTimeLocal(adminForm.startsAt),
    endsAt: fromDateTimeLocal(adminForm.endsAt),
    winnerCount: Number(adminForm.winnerCount)
  });

  const handleSelectAdminRaffle = (raffleId: string) => {
    const target = appRaffles.find((item) => item.id === raffleId);

    if (!target) {
      return;
    }

    setSelectedBackendRaffleId(target.id);
    setAdminForm(toAdminForm(target));
    setAdminMessage('');
  };

  const handleStartNewRaffle = () => {
    setSelectedBackendRaffleId(null);
    setAdminForm(buildDefaultAdminForm());
    setAdminMessage('Preencha os dados para criar um novo sorteio.');
  };

  const handleSaveAdminRaffle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!adminToken) {
      setAdminMessage('Entre como administrador para salvar sorteios.');
      return;
    }

    try {
      const input = buildAdminInput();

      if (selectedAdminRaffle) {
        const updated = backend.raffles.updateRaffle(adminToken, selectedAdminRaffle.id, input);
        setAdminForm(toAdminForm(updated));
        setAdminMessage('Sorteio atualizado com sucesso.');
      } else {
        const created = backend.raffles.createRaffle(adminToken, input);
        setSelectedBackendRaffleId(created.id);
        setAdminForm(toAdminForm(created));
        setAdminMessage('Sorteio criado com sucesso.');
      }

      refresh();
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar o sorteio.');
    }
  };

  const runAdminAction = (action: () => void, successMessage: string) => {
    try {
      action();
      setAdminMessage(successMessage);
      refresh();
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : 'Acao administrativa falhou.');
    }
  };

  const requireSelectedAdminRaffle = () => {
    if (!adminToken || !selectedAdminRaffle) {
      throw new Error('Entre como administrador e selecione um sorteio.');
    }

    return selectedAdminRaffle;
  };

  const handleDeleteAdminRaffle = () => {
    runAdminAction(() => {
      const target = requireSelectedAdminRaffle();
      backend.raffles.deleteRaffle(adminToken, target.id);
      const remaining = backend.raffles.listRaffles().find((item) => item.id !== target.id) ?? null;
      setSelectedBackendRaffleId(remaining?.id ?? null);
      setAdminForm(remaining ? toAdminForm(remaining) : buildDefaultAdminForm());
    }, 'Sorteio excluido.');
  };


  return (
    <div className="min-h-screen bg-transparent text-stone-950">
      <BrandHeader cartCount={cartCount} onGoHome={handleGoHome} onOpenAccount={handleOpenAccount} onOpenCart={handleOpenCart} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {page === 'home' && (
          <HomePage raffle={raffle} availableNumbers={availableNumbers} onOpenRaffle={handleOpenRaffle} onOpenCart={handleOpenCart} />
        )}

        {page === 'detail' && (
          <RaffleDetailPage
            raffle={raffle}
            numbers={activeNumbers}
            selectedNumbers={selectedNumbers}
            currentCartNumbers={currentCartNumbers}
            maxSelection={MAX_SELECTION}
            onBackHome={handleGoHome}
            onToggleNumber={handleToggleNumber}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {page === 'cart' && (
          <CartPage
            raffle={raffle}
            cartItems={cartItems}
            cartCount={cartCount}
            cartTotal={cartTotal}
            cartCheckoutUrl={cartCheckoutUrl}
            onBackHome={handleGoHome}
          />
        )}

        {page === 'account' && (
          <div className="space-y-6">
            <AuthPanel
              session={session}
              authMode={authMode}
              authMessage={authMessage}
              form={authForm}
              onChangeForm={updateAuthForm}
              onChangeMode={setAuthMode}
              onSubmit={handleAuthSubmit}
              onLogout={handleLogout}
            />
            <UserDashboard
              session={session}
              raffles={visibleUserRaffles}
              participations={userParticipations}
              userMessage={userMessage}
              onParticipate={handleParticipate}
            />
          </div>
        )}

        {page === 'admin' && (
          <div className="space-y-6">
            <AuthPanel
              session={session}
              authMode={authMode}
              authMessage={authMessage || 'Admin inicial: admin@araujo.local / admin123'}
              form={authForm}
              onChangeForm={updateAuthForm}
              onChangeMode={setAuthMode}
              onSubmit={handleAuthSubmit}
              onLogout={handleLogout}
            />
            <AdminDashboard
              session={session}
              raffles={appRaffles}
              selectedRaffleId={selectedBackendRaffleId}
              activeRaffle={selectedAdminRaffle}
              stats={adminStats}
              participants={backendParticipants}
              adminMessage={adminMessage}
              form={adminForm}
              onChangeForm={updateAdminForm}
              onSelectRaffle={handleSelectAdminRaffle}
              onStartNew={handleStartNewRaffle}
              onSubmit={handleSaveAdminRaffle}
              onOpen={() => runAdminAction(() => backend.raffles.openRaffle(adminToken, requireSelectedAdminRaffle().id), 'Sorteio aberto.')}
              onClose={() => runAdminAction(() => backend.raffles.closeRaffle(adminToken, requireSelectedAdminRaffle().id), 'Sorteio fechado.')}
              onDraw={() => runAdminAction(() => backend.raffles.drawWinners(adminToken, requireSelectedAdminRaffle().id), 'Ganhadores sorteados automaticamente.')}
              onComplete={() => runAdminAction(() => backend.raffles.completeRaffle(adminToken, requireSelectedAdminRaffle().id), 'Sorteio concluido.')}
              onDelete={handleDeleteAdminRaffle}
              onMarkWinner={(userId) => runAdminAction(() => backend.raffles.markWinner(adminToken, requireSelectedAdminRaffle().id, userId), 'Ganhador marcado manualmente.')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
