/**
 * ConfigDTO is the schema of the configs.
 */
export interface ConfigDTO {
  backend: {
    baseURL: string;
  };
  cache: {
    enabled: boolean;
    ttlSeconds: number;
  };
}

/**
 * ListTransactionsQueryDTO is the schema of the List Transactions API query params.
 */
export interface ListTransactionsQueryDTO {
  start_amount?: string;
  end_amount?: string;

  start_time?: string;
  end_time?: string;

  account_id?: string;
  category?: string;
  notes_hint?: string;

  limit?: string;
  skip?: string;

  sort_field?: string;
  sort_order?: string;
}

/**
 * GetBudgetQueryDTO is the schema of the Get Budget API query params.
 */
export interface GetBudgetQueryDTO {
  start_time?: string;
  end_time?: string;
}
