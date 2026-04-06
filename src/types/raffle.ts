export type Page = 'home' | 'detail' | 'cart';
export type RaffleStatus = 'open' | 'closed';

export type Raffle = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  totalNumbers: number;
  soldNumbers: number;
  date: string;
  status: RaffleStatus;
  delivery: string;
  highlight: string;
  items: string[];
};

export type CartItem = {
  raffleId: string;
  numbers: number[];
};

export type RaffleNumber = {
  number: number;
  sold: boolean;
};
