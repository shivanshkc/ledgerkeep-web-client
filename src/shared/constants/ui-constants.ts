/* Screens less wide than this number are considered small. */
export const smallScreenBreakpoint = 991;

export const lightGreenColor = 'rgb(225, 250, 225)';
export const lightRedColor = 'rgb(250, 225, 225)';

export const debitCategories: string[] = ['essentials', 'investments', 'savings', 'luxury', 'ignorable'];
export const creditCategories: string[] = ['earnings', 'refunds', 'returns', 'petty', 'ignorable'];
export const allCategories: string[] = [...new Set([...debitCategories, ...creditCategories])];

// MY_DATE_FORMATS is the custom Date format for MatDatePicker.
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
