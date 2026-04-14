import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
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
import type { PublicUser, RaffleInput, RaffleStats, Session, UserParticipation } from './backend/domain';
import { buildNumberGrid, getAvailableNumbers, mergeNumbers } from './utils/raffle';
import { buildWhatsAppUrl } from './utils/whatsapp';

type AppPage = 'home' | 'detail' | 'cart' | 'account' | 'admin';

type AuthMode = 'login' | 'register';

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

const toDateTimeLocal = (value: string) => value.slice(0, 16);
const fromDateTimeLocal = (value: string) => new Date(value).toISOString();

function App() {
  const backend = useMemo(() => {
    const services = createBackend();
    const admin = services.auth.createAdmin(adminCredentials);
    const createdRaffle = services.raffles.createRaffle(admin.token, initialRaffleInput);
    services.raffles.openRaffle(admin.token, createdRaffle.id);
    return services;
  }, []);

  const [page, setPage] = useState<AppPage>('home');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authMessage, setAuthMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [version, setVersion] = useState(0);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [adminForm, setAdminForm] = useState({
    title: initialRaffleInput.title,
    description: initialRaffleInput.description,
    startsAt: toDateTimeLocal(initialRaffleInput.startsAt),
    endsAt: toDateTimeLocal(initialRaffleInput.endsAt),
    winnerCount: initialRaffleInput.winnerCount
  });

  const appRaffles = backend.raffles.listRaffles();
  const activeBackendRaffle = appRaffles[0] ?? null;
  const adminToken = session?.user.role === 'admin' ? session.token : '';
  const activeNumbers = useMemo(() => buildNumberGrid(raffle), []);
  const availableNumbers = getAvailableNumbers(raffle);
  const cartCount = cartItems.reduce((total, item) => total + item.numbers.length, 0);
  const cartTotal = cartItems.reduce((total, item) => total + raffle.price * item.numbers.length, 0);

  const backendStats: RaffleStats | null = adminToken && activeBackendRaffle
    ? backend.raffles.getStats(adminToken, activeBackendRaffle.id)
    : null;

  const backendParticipants = adminToken && activeBackendRaffle
    ? backend.raffles.listParticipants(adminToken, activeBackendRaffle.id)
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

  const handleGoHome = () => {
    setPage('home');
    setSelectedNumbers([]);
  };

  const handleOpenCart = () => {
    setPage('cart');
  };

  const handleOpenRaffle = () => {
    setSelectedNumbers([]);
    setPage('detail');
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
    setPage('cart');
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
    setPage('account');
  };

  const handleParticipate = () => {
    if (!session || !activeBackendRaffle) {
      setUserMessage('Entre como usuario para participar.');
      return;
    }

    try {
      backend.raffles.participate(session.token, activeBackendRaffle.id);
      setUserMessage('Participacao confirmada com sucesso.');
      refresh();
    } catch (error) {
      setUserMessage(error instanceof Error ? error.message : 'Nao foi possivel participar.');
    }
  };

  const updateAdminForm = (field: keyof typeof adminForm, value: string | number) => {
    setAdminForm((current) => ({ ...current, [field]: value }));
  };

  const buildAdminInput = (): RaffleInput => ({
    title: adminForm.title,
    description: adminForm.description,
    startsAt: fromDateTimeLocal(adminForm.startsAt),
    endsAt: fromDateTimeLocal(adminForm.endsAt),
    winnerCount: Number(adminForm.winnerCount)
  });

  const handleSaveAdminRaffle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!adminToken) {
      setAdminMessage('Entre como administrador para salvar sorteios.');
      return;
    }

    try {
      const input = buildAdminInput();

      if (activeBackendRaffle) {
        backend.raffles.updateRaffle(adminToken, activeBackendRaffle.id, input);
        setAdminMessage('Sorteio atualizado com sucesso.');
      } else {
        backend.raffles.createRaffle(adminToken, input);
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

  const requireActiveRaffle = () => {
    if (!adminToken || !activeBackendRaffle) {
      throw new Error('Entre como administrador e crie um sorteio.');
    }

    return activeBackendRaffle;
  };

  const navButtonClass = (target: AppPage) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${page === target ? 'bg-stone-950 text-white' : 'bg-white text-stone-700 hover:bg-stone-50'}`;

  return (
    <div className="min-h-screen bg-transparent text-stone-950">
      <BrandHeader cartCount={cartCount} onGoHome={handleGoHome} onOpenCart={handleOpenCart} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav className="mb-6 flex flex-wrap gap-2 rounded-[28px] border border-black/5 bg-white/70 p-2 shadow-sm backdrop-blur">
          <button type="button" className={navButtonClass('home')} onClick={handleGoHome}>Sorteio</button>
          <button type="button" className={navButtonClass('account')} onClick={() => setPage('account')}>Usuario</button>
          <button type="button" className={navButtonClass('admin')} onClick={() => setPage('admin')}>Admin</button>
          <button type="button" className={navButtonClass('cart')} onClick={handleOpenCart}>Carrinho</button>
        </nav>

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
              raffleTitle={activeBackendRaffle?.title ?? 'Nenhum sorteio ativo'}
              stats={backendStats}
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
              activeRaffle={activeBackendRaffle}
              stats={backendStats}
              participants={backendParticipants}
              adminMessage={adminMessage}
              form={adminForm}
              onChangeForm={updateAdminForm}
              onSubmit={handleSaveAdminRaffle}
              onOpen={() => runAdminAction(() => backend.raffles.openRaffle(adminToken, requireActiveRaffle().id), 'Sorteio aberto.')}
              onClose={() => runAdminAction(() => backend.raffles.closeRaffle(adminToken, requireActiveRaffle().id), 'Sorteio fechado.')}
              onDraw={() => runAdminAction(() => backend.raffles.drawWinners(adminToken, requireActiveRaffle().id), 'Ganhadores sorteados automaticamente.')}
              onComplete={() => runAdminAction(() => backend.raffles.completeRaffle(adminToken, requireActiveRaffle().id), 'Sorteio concluido.')}
              onDelete={() => runAdminAction(() => backend.raffles.deleteRaffle(adminToken, requireActiveRaffle().id), 'Sorteio excluido.')}
              onMarkWinner={(userId) => runAdminAction(() => backend.raffles.markWinner(adminToken, requireActiveRaffle().id, userId), 'Ganhador marcado manualmente.')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
