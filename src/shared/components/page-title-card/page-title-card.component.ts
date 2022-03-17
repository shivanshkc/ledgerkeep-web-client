import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-page-title-card',
  templateUrl: './page-title-card.component.html',
  styleUrls: ['./page-title-card.component.scss'],
})
export class PageTitleCardComponent implements OnInit {
  @Input() title = 'Example';

  @Input() icon = 'check_circle';
  @Input() showIcon = true;
  @Input() disableIcon = false;

  @Output() onAction = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}
}
