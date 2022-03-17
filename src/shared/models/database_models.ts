/**
 * AccountDTO is the schema of an account object.
 */
export interface AccountDTO {
  id: string;
  name: string;
  balance: number;
}

/**
 * TransactionDTO is the schema of a transaction object.
 */
export interface TransactionDTO {
  id: string;
  amount: number;
  closing_bal: number;
  timestamp: number;
  account_id: string;
  category: string;
  notes: string;
}

/**
 * TransactionDisplayDTO is the schema of the displayable transaction object.
 */
export interface TransactionDisplayDTO {
  id: string;
  amount: number;
  closing_bal: number;
  timestamp: number;
  account_id: string;
  account_name: string;
  category: string;
  notes: string;
}

/**
 * BudgetDTO is the schema of a Budget object.
 */
export interface BudgetDTO {
  total_income: number;

  essentials_expected: number;
  essentials_actual: number;

  investments_expected: number;
  investments_actual: number;

  savings_expected: number;
  savings_actual: number;

  luxury_expected: number;
  luxury_actual: number;

  ignorable_expected: number;
  ignorable_actual: number;
}
