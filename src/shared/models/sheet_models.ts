import { AccountDTO, TransactionDTO } from './database_models';

/**
 * CreateAccountSheetDTO is the data required to open an account creation bottom sheet.
 */
export interface CreateAccountSheetDTO {
  callback: (isCreated: boolean) => void;
}

/**
 * EditAccountSheetDTO is the data required to open an account edit bottom sheet.
 */
export interface EditAccountSheetDTO {
  originalAcc: AccountDTO;
  callback: (isUpdated: boolean) => void;
}

/**
 * CreateTransactionSheetDTO is the data required to open a transaction creation bottom sheet.
 */
export interface CreateTransactionSheetDTO {
  callback: (isCreated: boolean) => void;
}

/**
 * EditTransactionSheetDTO is the data required to open a transaction edit bottom sheet.
 */
export interface EditTransactionSheetDTO {
  originalTx: TransactionDTO;
  callback: (isUpdated: boolean) => void;
}
