import type { Raffle } from '../types/raffle';

export const MAX_SELECTION = 10;
export const SELLER_PHONE = '5511999999999';

export const raffle: Raffle = {
  id: 'kit-resenha',
  title: 'Kit da Resenha Premium',
  category: 'Kit completo da foto',
  description:
    'Sorteio de um kit montado para a resenha com bebidas e energeticos. A pagina agora mostra apenas esse premio para a vitrine ficar direta e sem distracoes.',
  price: 5,
  totalNumbers: 100,
  soldNumbers: 74,
  date: '18 de maio de 2026',
  status: 'open',
  delivery: 'Retirada combinada com o vendedor apos a confirmacao.',
  highlight: 'Sorteio unico em destaque',
  items: ['Old Parr 12', 'Licor 43', 'Caixa Heineken', 'Red Bull', 'Itens extras do kit']
};
