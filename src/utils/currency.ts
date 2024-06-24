import { Currency } from "@prisma/client";

export const currencyToString = (currency: Currency): string => {
  return currency === Currency.EUR ? "€" : "£";
};

export const euroToPound = (amount: number): number => {
  return amount * 0.85;
};

export const currencyToGBP = (amount: number, currency: Currency): number => {
  return currency === Currency.GBP ? amount : euroToPound(amount);
};
