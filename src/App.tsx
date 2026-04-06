import { useMemo, useState } from 'react';
import { BrandHeader } from './components/BrandHeader';
import { CartPage } from './components/CartPage';
import { HomePage } from './components/HomePage';
import { RaffleDetailPage } from './components/RaffleDetailPage';
import { MAX_SELECTION, SELLER_PHONE, raffle } from './data/raffle';
import type { CartItem, Page } from './types/raffle';
import { buildNumberGrid, getAvailableNumbers, mergeNumbers } from './utils/raffle';
import { buildWhatsAppUrl } from './utils/whatsapp';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const activeNumbers = useMemo(() => buildNumberGrid(raffle), []);
  const availableNumbers = getAvailableNumbers(raffle);
  const cartCount = cartItems.reduce((total, item) => total + item.numbers.length, 0);
  const cartTotal = cartItems.reduce((total, item) => total + raffle.price * item.numbers.length, 0);

  const currentCartNumbers =
    cartItems.find((item) => item.raffleId === raffle.id)?.numbers.slice().sort((a, b) => a - b) ?? [];

  const detailCheckoutUrl =
    selectedNumbers.length > 0 ? buildWhatsAppUrl(raffle, [{ raffleId: raffle.id, numbers: selectedNumbers }], SELLER_PHONE) : '#';

  const cartCheckoutUrl = cartItems.length > 0 ? buildWhatsAppUrl(raffle, cartItems, SELLER_PHONE) : '#';

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

  return (
    <div className="min-h-screen bg-transparent text-stone-950">
      <BrandHeader cartCount={cartCount} onGoHome={handleGoHome} onOpenCart={handleOpenCart} />

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
      </main>
    </div>
  );
}

export default App;
