import { ThemePalette } from '@angular/material/core';

/**
 * SnackbarDTO is the data required to open a snackbar.
 */
export interface SnackbarDTO {
  color: ThemePalette;
  message: string;
  icon: string;
}

/**
 * ConfirmationDialogDTO is the data required to open a confirmation dialog.
 */
export interface ConfirmationDialogDTO {
  width: string;

  title: string;
  body: string;

  confirmButtonText: string;
  confirmButtonColor: ThemePalette;

  cancelButtonText: string;
  cancelButtonColor: ThemePalette;
}

/**
 * ConfirmationDialogInternalDTO is the data that the ConfirmationDialog service passes to the component.
 */
export interface ConfirmationDialogInternalDTO {
  title: string;
  body: string;

  confirmButtonText: string;
  confirmButtonColor: ThemePalette;

  cancelButtonText: string;
  cancelButtonColor: ThemePalette;

  callback: (answer: boolean) => void;
}

/**
 * SearchTransactionsDialogDTO is the data required to open a SearchTransactionsDialog.
 */
export interface SearchTransactionsDialogDTO {
  callback: (shouldReload: boolean) => void;
}

/**
 * SearchBudgetStatsDialogDTO is the data required to open a SearchBudgetStatsDialog.
 */
export interface SearchBudgetStatsDialogDTO {
  callback: (startDate: number | undefined, endDate: number | undefined) => void;
}

/**
 * DrawerListItem represents a single item from the drawer list.
 */
export interface DrawerListItem {
  icon: string;
  name: string;
  link: string;
}
