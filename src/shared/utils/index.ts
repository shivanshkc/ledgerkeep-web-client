import { lightGreenColor, lightRedColor } from '../constants';
import { TransactionDTO } from '../models';

export * from './validation_utils';

/**
 * @description tc is a try-catch wrapper.
 * @param promise The promise which is to be try-catch-ed.
 */
export const tc = async <T>(promise: Promise<T>): Promise<[undefined, T] | [Error, undefined]> => {
  try {
    return [undefined, await promise];
  } catch (err) {
    return [err as Error, undefined];
  }
};

/**
 * @description sleep returns a promise that resolves after the provided ms.
 *
 * @param ms - The sleep period.
 */
export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * @description formatRupeeAmount formats the given amount to a readable rupee amount string.
 * @param amount - Amount to be formatted.
 */
export const formatRupeeAmount = (amount: number): string => {
  const rounded = Math.round(amount * 100.0) / 100.0;
  return `₹ ${rounded.toLocaleString()}`;
};

/**
 * Calculates the percentage by dividing the provided quantity by total and rounds it.
 * @param quantity
 * @param total
 */
export const toRoundedPercentage = (quantity: number, total: number): number => {
  const percentage = (quantity / total) * 100;
  return Math.round(percentage * 100.0) / 100.0;
};

/**
 * Provides the CSS color for an amount.
 * @param amount
 */
export const amountColor = (amount: number): string => {
  return amount > 0 ? 'green' : 'red';
};

/**
 * Returns the Ng-style object for coloring the provided amount.
 * @param amount
 */
export const amountColorNgStyle = (amount: number): { color: string } => {
  return { color: amountColor(amount) };
};

/**
 * Provides the CSS background color for an amount.
 * @param amount
 */
export const amountBackgroundColor = (amount: number): string => {
  return amount > 0 ? lightGreenColor : lightRedColor;
};

/**
 * Returns the Ng-style object for coloring the background of the provided amount.
 * @param amount
 */
export const amountBackgroundColorNgStyle = (amount: number): { backgroundColor: string } => {
  return { backgroundColor: amountBackgroundColor(amount) };
};

/**
 * Capitalizes the first letter of the provided string and returns it.
 * @param value
 */
export const capitalizeFirst = (value: string): string => {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
};

/**
 * Returns true if the bodies of both transactions are same.
 * Body only contains those fields that can be sent in the request body of a create or update transaction call.
 */
export const areTransactionBodiesSame = (tx1: TransactionDTO, tx2: TransactionDTO): boolean => {
  return (
    tx1.amount === tx2.amount &&
    tx1.timestamp === tx2.timestamp &&
    tx1.account_id === tx2.account_id &&
    tx1.category === tx2.category &&
    tx1.notes === tx2.notes
  );
};
