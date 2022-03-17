import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { PolarChartComponent } from '@swimlane/ngx-charts';

import { displayableErrors, MY_DATE_FORMATS, smallScreenBreakpoint } from '../../../../shared/constants';
import { BudgetDTO, BudgetStatsDataDTO, GetBudgetQueryDTO } from '../../../../shared/models';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { ScreenResizeService } from '../../../../shared/services/screen-resize.service';
import { StatisticsService } from '../../../../shared/services/statistics.service';
import {
  amountBackgroundColorNgStyle,
  amountColorNgStyle,
  formatRupeeAmount,
  sleep,
  tc,
  toRoundedPercentage,
} from '../../../../shared/utils';

@Component({
  selector: 'app-budget-stats',
  templateUrl: './budget-stats.component.html',
  styleUrls: ['./budget-stats.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class BudgetStatsComponent implements AfterViewInit {
  @ViewChild(PolarChartComponent) chart!: PolarChartComponent;

  // Initial data for the placeholder chart.
  // This data is only a placeholder while the chart is loading for the first time.
  public chartData: { name: string; series: { name: string; value: number }[] }[] = [
    {
      name: 'Loading',
      series: [
        { name: '', value: 1 },
        { name: ' ', value: 1 },
        { name: '  ', value: 1 },
      ],
    },
  ];
  public budgetInfo: BudgetDTO | undefined;
  public isLoading = false;

  public displayedCols: string[] = [];
  public readonly _smallScreenColumns: string[] = ['category', 'expected', 'actual'];
  public readonly _normalScreenColumns: string[] = ['category', 'expected', 'actual', 'diff'];

  public dataSource = new MatTableDataSource<BudgetStatsDataDTO>([]);

  public readonly formatAmount = formatRupeeAmount;
  public readonly amountColor = amountColorNgStyle;
  public readonly amountBackColor = amountBackgroundColorNgStyle;

  constructor(
    private readonly _stats: StatisticsService,
    private readonly _resize: ScreenResizeService,
    private readonly _snack: SnackbarService,
  ) {}

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);

    // Deciding on the display columns.
    this._setDisplayedColumns();
    this._resize.subscribe(() => {
      this._setDisplayedColumns();
    });

    this._setLoading(true);
    await this._fetchBudget(undefined, undefined);
    this._setLoading(false);
  }

  /**
   * On-click handler for the search button.
   */
  public async onSearchClick(): Promise<void> {
    // The code for the search filter dialog is already written in the search-budget-stats-dialog module.
    // It has a lot of room for improvement though (such as linking the form with query params).
    // Just import that module in the 'statistics' module, and inject its service in this component.
    // That service will allow you to use the following line:
    /* const { startDate, endDate } = await this._searchDialog.prompt(); */
    this._snack.info(true, 'Feature in progress.');
  }

  /**
   * Returns true if the current small can be categorized as a small screen.
   */
  public isSmallScreen(): boolean {
    return this._resize.currentWidth < smallScreenBreakpoint;
  }

  private async _fetchBudget(startDate: number | undefined, endDate: number | undefined): Promise<void> {
    const query: GetBudgetQueryDTO = {
      start_time: startDate ? `${startDate}` : '',
      end_time: endDate ? `${endDate}` : '',
    };

    const [err, budget] = await tc(this._stats.getBudget(query));
    if (err || !budget) {
      this._snack.error(true, err?.message || displayableErrors.Default);
      return;
    }

    // Persisting budget data for later operations.
    this.budgetInfo = budget;
    if (this.budgetInfo.total_income === 0) {
      this._snack.error(true, 'No income in this interval.');
      return;
    }

    const tableData: BudgetStatsDataDTO[] = [
      { category: 'Essentials', expected: budget.essentials_expected, actual: budget.essentials_actual },
      { category: 'Investments', expected: budget.investments_expected, actual: budget.investments_actual },
      { category: 'Savings', expected: budget.savings_expected, actual: budget.savings_actual },
      { category: 'Luxury', expected: budget.luxury_expected, actual: budget.luxury_actual },
      { category: 'Ignorable', expected: budget.ignorable_expected, actual: budget.ignorable_actual },
    ];
    this.dataSource = new MatTableDataSource<BudgetStatsDataDTO>(tableData);

    // Animations are initially disabled so that the placeholder chart does not animate.
    // But the actual chart should use animation. So, they are enabled here.
    this.chart.animations = true;
    this.chart.xAxis = true;

    const expectedSeries: { name: string; value: number }[] = [];
    const actualSeries: { name: string; value: number }[] = [];

    tableData.forEach((elem) => {
      expectedSeries.push({ name: elem.category, value: toRoundedPercentage(elem.expected, budget.total_income) });
      actualSeries.push({ name: elem.category, value: toRoundedPercentage(elem.actual, budget.total_income) });
    });

    this.chartData = [
      { name: 'Actual', series: actualSeries },
      { name: 'Expected', series: expectedSeries },
    ];
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
   * Sets the state of loading.
   * @param state - Intended state.
   * @private
   */
  private _setLoading(state: boolean): void {
    this.isLoading = state;
  }
}
