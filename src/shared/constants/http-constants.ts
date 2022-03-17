/**
 * displayableErrors is the map of errors that can be displayed to the user.
 */
export const displayableErrors = {
  Default: new Error('Please try again later.'),
  PleaseLoginAgain: new Error('Please login again.'),
  AccountAlreadyExists: new Error('This account ID is not available.'),
  AccountIsInUse: new Error('This account is being used by transactions.'),
};

/**
 * backendCustomCodes is the map of recognized backend custom codes.
 */
export const backendCustomCodes = {
  unauthorized: 'UNAUTHORIZED',
  accountExists: 'ACCOUNT_ALREADY_EXISTS',
  accountInUse: 'ACCOUNT_IS_IN_USE',
};

/**
 * backendCustomCodeToErrorMap maps the known backend custom codes to their corresponding displayable errors.
 */
export const backendCustomCodeToErrorMap = new Map<string, Error>([
  [backendCustomCodes.unauthorized, displayableErrors.PleaseLoginAgain],
  [backendCustomCodes.accountExists, displayableErrors.AccountAlreadyExists],
  [backendCustomCodes.accountInUse, displayableErrors.AccountIsInUse],
]);

/**
 * Default value of limit for transactions table.
 */
export const defaultTransactionsLimit = 25;

/** Sorting for transactions. */
export const txSortFields: string[] = ['amount', 'timestamp', 'category'];
export const txSortOrders: string[] = ['asc', 'desc'];

/** Default values for sorting params. */
export const defaultTxSortField = 'timestamp';
export const defaultTxSortOrder = 'desc';
