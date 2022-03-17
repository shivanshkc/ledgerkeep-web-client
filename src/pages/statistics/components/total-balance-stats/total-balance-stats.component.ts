import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AreaChartComponent } from '@swimlane/ngx-charts';
import * as moment from 'moment';

import { displayableErrors } from '../../../../shared/constants';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { StatisticsService } from '../../../../shared/services/statistics.service';
import { sleep, tc } from '../../../../shared/utils';

@Component({
  selector: 'app-total-balance-stats',
  templateUrl: './total-balance-stats.component.html',
  styleUrls: ['./total-balance-stats.component.scss'],
})
export class TotalBalanceStatsComponent implements AfterViewInit {
  @ViewChild(AreaChartComponent) chart!: AreaChartComponent;

  // This data is only a placeholder while the chart is loading for the first time.
  public chartData: { name: string; series: { name: string; value: number }[] }[] = [
    {
      name: 'Loading',
      series: [
        { name: '0', value: 1 },
        { name: '1', value: 1 },
      ],
    },
  ];

  public isLoading = false;

  constructor(private readonly _snack: SnackbarService, private readonly _stats: StatisticsService) {}

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);

    this._setLoading(true);
    await this._fetchBalances();
    this._setLoading(false);
  }

  /**
   * On-click handler for the search button.
   */
  public async onSearchClick(): Promise<void> {
    this._snack.info(true, 'Feature in progress.');
  }

  /**
   * Fetches balances and populates UI.
   * @private
   */
  private async _fetchBalances(): Promise<void> {
    // Getting the data from the backend.
    const [err, balances] = await tc(this._stats.getBalances());
    if (err || !balances) {
      this._snack.error(true, err?.message || displayableErrors.Default);
      return;
    }

    // Creating a new series.
    const series: { name: string; value: number }[] = [];
    const epochs = Object.keys(balances) as unknown as number[];

    // Looping over each interval.
    epochs.forEach((epoch) => {
      series.push({ name: moment.unix(epoch).format("MMM 'YY"), value: balances[epoch] });
    });

    // Enabling the chart animations.
    this.chart.animations = true;
    // Updating the chart data.
    this.chartData = [{ name: 'Balances', series }];
    this.chart.update();
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
