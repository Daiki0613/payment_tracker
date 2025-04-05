import { Currency } from "@prisma/client";

export const currencyToString = (currency: Currency): string => {
  return "¥";
};

// No conversion needed as we only use JPY now
export const currencyToJPY = (amount: number): number => {
  return amount;
};
