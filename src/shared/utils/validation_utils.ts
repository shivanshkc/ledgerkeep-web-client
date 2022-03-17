import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

import { creditCategories, debitCategories } from '../constants';

/** positiveAmount checks if the transaction amount is a positive number. */
export const positiveAmount = (amount: AbstractControl): ValidationErrors | null => {
  // If there's no value in the amount field, we don't show the should-be-positive error.
  if (amount.value === '') {
    return null;
  }

  // If the amount is a valid positive number, we don't show the error.
  const parsedAmount = parseFloat(amount.value);
  if (!isNaN(parsedAmount) && parsedAmount > 0) {
    return null;
  }

  // In all other cases, error is shown.
  return { positive: true };
};

/** noCategoryMismatch makes sure that a debit-credit category mismatch does not happen. */
export const noCategoryMismatch = (form: FormGroup): ValidationErrors | null => {
  const nature = form.get('nature')?.value;

  const category = form.get('category')?.value;
  if (nature === 'debit' && debitCategories.includes(category)) {
    return null;
  }
  if (nature === 'credit' && creditCategories.includes(category)) {
    return null;
  }

  form.setErrors({ mismatch: true });
  return { categoryMismatch: true };
};
