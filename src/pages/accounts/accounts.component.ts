import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { displayableErrors, smallScreenBreakpoint } from '../../shared/constants';
import { AccountDTO } from '../../shared/models';
import { SnackbarService } from '../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../shared/services/account.service';
import { ScreenResizeService } from '../../shared/services/screen-resize.service';
import { amountBackgroundColorNgStyle, amountColorNgStyle, formatRupeeAmount, tc } from '../../shared/utils';
import { CreateAccountSheetService } from './modules/create-account-sheet/create-account-sheet.service';
import { EditAccountSheetService } from './modules/edit-account-sheet/edit-account-sheet.service';

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
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [rowsAnim],
})
export class AccountsComponent implements OnInit {
  public isLoading = false;

  public displayedCols: string[] = [];
  public dataSource = new MatTableDataSource<AccountDTO>();

  private readonly _smallScreenColumns: string[] = ['index', 'name', 'balance'];
  private readonly _normalScreenColumns: string[] = ['index', 'name', 'id', 'balance'];

  public readonly formatAmount = formatRupeeAmount;
  public readonly amountColor = amountColorNgStyle;
  public readonly amountBackColor = amountBackgroundColorNgStyle;

  constructor(
    private readonly _account: AccountService,
    private readonly _snack: SnackbarService,
    private readonly _resize: ScreenResizeService,
    private readonly _createAccountSheet: CreateAccountSheetService,
    private readonly _editAccountSheet: EditAccountSheetService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this._setDisplayedColumns();
    this._resize.subscribe(() => {
      this._setDisplayedColumns();
    });

    this._setLoading(true);
    await this._fetchAccounts();
    this._setLoading(false);
  }

  /**
   * On-click handler for the create button.
   */
  public async onCreateClick(): Promise<void> {
    const isCreated = await this._createAccountSheet.open();
    if (!isCreated) return;

    // If an account was created, we reload accounts.
    this._setLoading(true);
    await this._fetchAccounts();
    this._setLoading(false);
  }

  /**
   * On-click handler for the row.
   */
  public async onEdit(row: AccountDTO): Promise<void> {
    const isUpdated = await this._editAccountSheet.open(row);
    if (!isUpdated) return;

    // If any updates/deletion took place, we reload accounts.
    this._setLoading(true);
    await this._fetchAccounts();
    this._setLoading(false);
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
   * Fetches accounts using AccountService.
   * @private
   */
  private async _fetchAccounts(): Promise<void> {
    const [err, accounts] = await tc(this._account.listAccounts());
    if (err || !accounts) {
      this._snack.error(true, err?.message || displayableErrors.Default.message);
      return;
    }

    this.dataSource = new MatTableDataSource<AccountDTO>(accounts);
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
