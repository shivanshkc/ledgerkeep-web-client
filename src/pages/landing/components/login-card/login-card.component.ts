import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { passwordMaxLength, usernameMaxLength } from '../../../../shared/constants';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { BasicAuthService } from '../../../../shared/services/basic-auth.service';
import { sleep, tc } from '../../../../shared/utils';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0 })),
      state('shown', style({})),
      transition('hidden => shown', animate('250ms ease-in')),
    ]),
  ],
})
export class LoginCardComponent implements AfterViewInit {
  public loginCardState = 'hidden'; // The login-card is initially invisible.
  public hidePass = true; // Password is hidden by default.

  public loginForm: FormGroup;
  public isLoading = false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _auth: BasicAuthService,
    private readonly _accounts: AccountService,
    private readonly _snack: SnackbarService,
    private readonly _router: Router,
  ) {
    this.loginForm = this._formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(usernameMaxLength)]],
      password: ['', [Validators.required, Validators.maxLength(passwordMaxLength)]],
    });
  }

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);
    // The login-card is shown right after the view loads.
    this.loginCardState = 'shown';
  }

  /** OnClick action for the logging button. */
  public async onLoginClick(): Promise<void> {
    if (this.loginForm.invalid) return;

    this._setLoading(true);
    await this._handleLogin();
    this._setLoading(false);
  }

  /**
   * Logs the user in while also managing UI actions.
   * @private
   */
  private async _handleLogin(): Promise<void> {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.getRawValue();

    // This API call will determine if the login credentials were valid.
    const [err] = await tc(this._accounts.base(username, password));
    // Checking the call error.
    if (err) {
      this.loginForm.reset();
      this._snack.error(true, err.message);
      return;
    }

    // This line will only load the next module.
    // It will not navigate to the next page because the user is not logged in.
    await this._router.navigate(['/statistics']);
    // Logging the user in.
    this._auth.login(username, password);
    // Now navigation will happen but the module is already loaded.
    await this._router.navigate(['/statistics']);
  }

  /**
   * This method sets the state of loading.
   * @param state - Intended loading state.
   * @private
   */
  private _setLoading(state: boolean): void {
    state ? this.loginForm.disable() : this.loginForm.enable();
    this.isLoading = state;
  }
}
