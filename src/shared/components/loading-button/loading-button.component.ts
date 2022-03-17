import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent implements OnInit {
  @Input() buttonColor: ThemePalette = 'primary';
  @Input() buttonText = 'OK';
  @Input() buttonType: 'submit' | 'button' = 'button';

  @Input() spinnerColor: ThemePalette = 'primary';
  @Input() spinnerDia = 24;

  @Input() loading = false;
  @Input() disabled = false;

  // This value is determined by the spinner diameter.
  public buttonHeight = '';

  constructor() {}

  ngOnInit(): void {
    this.buttonHeight = `${this.spinnerDia * 1.5}px`;
  }

  /**
   * Tells if the button is in normal state.
   * Normal state is when the button is not disabled, and not loading.
   */
  isNormal(): boolean {
    return !this.loading && !this.disabled;
  }

  /**
   * Tells if the button is loading.
   * Loading state is when the button is loading, and it is not disabled.
   */
  isLoading(): boolean {
    return this.loading && !this.disabled;
  }

  /**
   * Tells if the button is disabled.
   */
  isDisabled(): boolean {
    return this.disabled;
  }
}
