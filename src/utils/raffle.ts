import type { Raffle, RaffleNumber } from '../types/raffle';

export const getAvailableNumbers = (raffle: Raffle) => raffle.totalNumbers - raffle.soldNumbers;

export const mergeNumbers = (left: number[], right: number[]) =>
  Array.from(new Set([...left, ...right])).sort((a, b) => a - b);

export const buildNumberGrid = (raffle: Raffle): RaffleNumber[] => {
  const baseSeed = raffle.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

  const rankedNumbers = Array.from({ length: raffle.totalNumbers }, (_, index) => {
    const number = index + 1;
    const weight = (number * 97 + baseSeed * 13 + (number % 17) * 29) % 10007;

    return { number, weight };
  });

  const soldSet = new Set(
    rankedNumbers
      .slice()
      .sort((left, right) => left.weight - right.weight)
      .slice(0, raffle.soldNumbers)
      .map((item) => item.number)
  );

  return rankedNumbers.map((item) => ({
    number: item.number,
    sold: soldSet.has(item.number)
  }));
};
