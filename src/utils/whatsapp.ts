import type { CartItem, Raffle } from '../types/raffle';
import { formatTicketNumber } from './formatters';

export const buildWhatsAppUrl = (raffle: Raffle, items: CartItem[], sellerPhone: string) => {
  const lines = items
    .map((item) => {
      const formattedNumbers = item.numbers
        .slice()
        .sort((a, b) => a - b)
        .map(formatTicketNumber)
        .join(', ');

      return `- ${raffle.title}: ${formattedNumbers}`;
    })
    .join('\n');

  const message = `Ola! Quero concluir a compra destes numeros:\n${lines}\n\nPode confirmar a disponibilidade?`;
  return `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
};
