import { Component, OnInit } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';

import { MY_DATE_FORMATS } from '../../shared/constants';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class StatisticsComponent implements OnInit {
  constructor() {}

  public ngOnInit(): void {}
}
