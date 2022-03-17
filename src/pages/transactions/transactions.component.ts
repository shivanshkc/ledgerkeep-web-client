import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';

import {
  allCategories,
  defaultTransactionsLimit,
  defaultTxSortField,
  defaultTxSortOrder,
  displayableErrors,
  lightGreenColor,
  lightRedColor,
  smallScreenBreakpoint,
  txSortFields,
  txSortOrders,
} from '../../shared/constants';
import { AccountDTO, ListTransactionsQueryDTO, TransactionDisplayDTO } from '../../shared/models';
import { SnackbarService } from '../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../shared/services/account.service';
import { ScreenResizeService } from '../../shared/services/screen-resize.service';
import { TransactionService } from '../../shared/services/transaction.service';
import {
  amountBackgroundColorNgStyle,
  amountColorNgStyle,
  capitalizeFirst,
  formatRupeeAmount,
  sleep,
  tc,
} from '../../shared/utils';
import { CreateTransactionSheetService } from './modules/create-transaction-sheet/create-transaction-sheet.service';
import { EditTransactionSheetService } from './modules/edit-transaction-sheet/edit-transaction-sheet.service';
import { SearchTransactionDialogService } from './modules/search-transaction-dialog/search-transaction-dialog.service';

/** rowsAnim is the animation to be played for rows. */
const rowsAnim = trigger('rowsAnim', [
  transition('void => *', [
    // Initially the row is invisible and shifted to left.
    style({ opacity: '0', transform: 'translateX(-500px)' }),
    sequence([
      // This animation moves the text to the right, while keeping the opacity down.
      animate('200ms ease', style({ opacity: '.2', transform: 'translateX(0)' })),
      // This animation only increases the opacity to 1.
      animate('200ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
    ]),
  ]),
]);

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  animations: [rowsAnim],
})
export class TransactionsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public isLoading = false;

  public displayedCols: string[] = [];
  public dataSource = new MatTableDataSource<TransactionDisplayDTO>([]);

  private readonly _allowedLimitsSet = new Set<number>([25, 50, 100]);
  public readonly allowedLimits: number[] = [...this._allowedLimitsSet];

  public totalTxCount = 0;
  public currentOffset = 0; // Used to display correct index numbers in the table.

  public lightGreen = lightGreenColor;
  public lightRed = lightRedColor;

  public readonly formatAmount = formatRupeeAmount;
  public readonly amountColor = amountColorNgStyle;
  public readonly amountBackColor = amountBackgroundColorNgStyle;
  public readonly capFirst = capitalizeFirst;

  private _accountList: AccountDTO[] = [];
  private readonly _smallScreenColumns: string[] = ['index', 'amount', 'timestamp', 'closing_bal'];
  private readonly _normalScreenColumns: string[] = [
    'index',
    'amount',
    'timestamp',
    'category',
    'account',
    'closing_bal',
  ];

  constructor(
    private readonly _resize: ScreenResizeService,
    private readonly _account: AccountService,
    private readonly _transaction: TransactionService,
    private readonly _snack: SnackbarService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _searchDialog: SearchTransactionDialogService,
    private readonly _createSheet: CreateTransactionSheetService,
    private readonly _editSheet: EditTransactionSheetService,
  ) {}

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);

    // Deciding on the display columns.
    this._setDisplayedColumns();
    this._resize.subscribe(() => {
      this._setDisplayedColumns();
    });

    // Initial paginator settings.
    this.dataSource.paginator = this.paginator;
    // This call blocks until the UI is updated by the query params.
    // This is to make sure we fetch the correct data initially.
    await this._updatePaginationAndSortFromQueryParams();

    // Fetching transactions on paginator event.
    this.paginator.page.subscribe(async () => {
      this._setLoading(true);
      // Query params can be updated asynchronously. It does not need to block.
      this._updateQueryParamsFromPaginationAndSort().then(() => {});
      await this._fetchTransactions();
      this._setLoading(false);
    });

    // Fetching transactions on sort event.
    this.sort.sortChange.subscribe(async () => {
      this._setLoading(true);
      // Query params can be updated asynchronously. It does not need to block.
      this._updateQueryParamsFromPaginationAndSort().then(() => {});
      await this._fetchTransactions();
      this._setLoading(false);
    });

    // Fetching transactions initially.
    this._setLoading(true);
    // Query params can be updated asynchronously. It does not need to block.
    this._updateQueryParamsFromPaginationAndSort().then(() => {});
    await this._fetchTransactions();
    this._setLoading(false);
  }

  /**
   * On-click handler for the search button.
   */
  public async onSearchClick(): Promise<void> {
    const shouldReload = await this._searchDialog.prompt();
    // If reload flag is true, we reload transactions. This will use updated query params.
    if (shouldReload) this.paginator.page.emit();
  }

  /**
   * On-click handler for the add transaction button.
   */
  public async onAddClick(): Promise<void> {
    const isCreated = await this._createSheet.open();
    if (!isCreated) return;
    // Emitting a pagination event for reloading transactions.
    this.paginator.page.emit();
  }

  /**
   * On click handler for transaction rows.
   * @param row
   */
  public async onEdit(row: TransactionDisplayDTO): Promise<void> {
    const isUpdated = await this._editSheet.open(row);
    if (!isUpdated) return;
    // Emitting a pagination event for reloading transactions.
    this.paginator.page.emit();
  }

  /**
   * Updates the displayedColumns property as per screen size.
   * If screen is small, fewer columns are shown.
   * @private
   */
  private _setDisplayedColumns(): void {
    this.displayedCols =
      this._resize.currentWidth < smallScreenBreakpoint ? this._smallScreenColumns : this._normalScreenColumns;
  }

  /**
   * Updates the paginator params using present query params.
   * @private
   */
  private async _updatePaginationAndSortFromQueryParams(): Promise<void> {
    const query = await firstValueFrom(this._activatedRoute.queryParams);

    const parsedLimit = parseInt(query['limit'] || '', 10);
    const parsedSkip = parseInt(query['skip'] || '', 10);

    const limit = this._allowedLimitsSet.has(parsedLimit) ? parsedLimit : defaultTransactionsLimit;
    const skip = parsedSkip % limit === 0 ? parsedSkip : 0;

    this.paginator.pageSize = limit;
    this.paginator.pageIndex = skip / limit;

    const sortField = query['sort_field'];
    this.sort.active = sortField && txSortFields.includes(sortField) ? sortField : defaultTxSortField;

    const sortOrder = query['sort_order'];
    this.sort.direction = sortOrder && txSortOrders.includes(sortOrder) ? sortOrder : defaultTxSortOrder;
  }

  /**
   * Updates the query params using the paginator params.
   * @private
   */
  private async _updateQueryParamsFromPaginationAndSort(): Promise<void> {
    const query = await firstValueFrom(this._activatedRoute.queryParams);

    // The new query params will contain all the old params. Just the limit and skip values will be updated.
    const newQuery = {
      ...query,
      limit: this.paginator.pageSize,
      skip: this.paginator.pageIndex * this.paginator.pageSize,
      sort_field: this.sort.active || defaultTxSortField,
      sort_order: this.sort.direction || defaultTxSortOrder,
    };

    await this._router.navigate([], { queryParams: newQuery });
  }

  /**
   * Fetches transactions from the backend and populates the table.
   * @private
   */
  private async _fetchTransactions(): Promise<void> {
    const query = await this._prepareListQuery(); // Query for listing transactions.

    // Getting the transactions list.
    const transactionsPromise = this._transaction.listTransactions(query);
    // Getting the accounts list. This is required to translate the account ID to account name.
    const accountsPromise = this._account.listAccounts();

    // Executing both calls in parallel.
    const [err, responses] = await tc(Promise.all([transactionsPromise, accountsPromise]));
    if (err || !responses) {
      this._snack.error(true, err?.message || displayableErrors.Default.message);
      return;
    }

    // Getting both responses out of the Promise.all result.
    const [txResponse, accResponse] = responses;
    // Persisting the account list for usage in other operations.
    this._accountList = accResponse;

    // Creating a map of accountID -> account for easy ID -> Name conversion.
    const accountsMap: Record<string, AccountDTO> = {};
    accResponse.forEach((acc) => (accountsMap[acc.id] = acc));

    // Converting the TransactionDTO list to TransactionDisplayDTO list.
    const transactions: TransactionDisplayDTO[] = txResponse.list.map((v) => {
      return { ...v, account_name: accountsMap[v.account_id].name };
    });

    // Updating UI.
    this.dataSource = new MatTableDataSource<TransactionDisplayDTO>(transactions);
    this.totalTxCount = txResponse.count;
    this.currentOffset = this.paginator.pageSize * this.paginator.pageIndex;
  }

  /**
   * Prepares the query parameters for listing transactions.
   * @private
   */
  private async _prepareListQuery(): Promise<ListTransactionsQueryDTO> {
    const params = await firstValueFrom(this._activatedRoute.queryParamMap);

    const listQuery: ListTransactionsQueryDTO = {
      limit: `${this.paginator.pageSize}`,
      skip: `${this.paginator.pageSize * this.paginator.pageIndex}`,
      sort_field: this.sort.active || defaultTxSortField,
      // The MatSort allows three sort directions: 'asc', 'desc' and ''.
      // This line makes sure that we treat '' as 'desc', which makes
      // caching in the interceptor more efficient.
      // That's because, if we allow '' as a separate sort, then the cache
      // for the 'desc' sort will not be usable with it.
      sort_order: this.sort.direction || defaultTxSortOrder,
    };

    const startAmount = parseFloat(params.get('start_amount') || '');
    if (!isNaN(startAmount)) listQuery.start_amount = `${startAmount}`;

    const endAmount = parseFloat(params.get('end_amount') || '');
    if (!isNaN(endAmount)) listQuery.end_amount = `${endAmount}`;

    const startDateInt = parseInt(params.get('start_time') || '');
    const startDate = moment.unix(startDateInt);
    if (startDate.isValid()) listQuery.start_time = `${startDateInt}`;

    const endDateInt = parseInt(params.get('end_time') || '');
    const endDate = moment.unix(endDateInt);
    if (endDate.isValid()) listQuery.end_time = `${endDateInt}`;

    const accountID = params.get('account_id');
    if (accountID && this._accountList.find((acc) => acc.id === accountID)) {
      listQuery.account_id = accountID;
    }

    const category = params.get('category');
    if (category && allCategories.includes(category.toLowerCase())) {
      listQuery.category = category;
    }

    const notesHint = params.get('notes_hint');
    if (notesHint) listQuery.notes_hint = notesHint;

    return listQuery;
  }

  /**
   * This method sets the state of loading.
   * @param state - Intended loading state.
   * @private
   */
  private _setLoading(state: boolean): void {
    this.isLoading = state;
  }
}
