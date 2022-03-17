import { Component, Input, OnInit } from '@angular/core';

import { DrawerListItem } from '../../../shared/models';

@Component({
  selector: 'app-drawer-content',
  templateUrl: './drawer-content.component.html',
  styleUrls: ['./drawer-content.component.scss'],
})
export class DrawerContentComponent implements OnInit {
  @Input() public items: DrawerListItem[] = [];

  constructor() {}

  ngOnInit(): void {}
}
