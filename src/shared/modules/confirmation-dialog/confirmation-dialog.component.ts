import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmationDialogInternalDTO } from '../../models';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogInternalDTO,
  ) {}

  ngOnInit(): void {
    // If the dialog closes, we emit a cancel event.
    // It will be ignored if the dialog was closed after pressing confirm.
    const subscriber = this.dialogRef.afterClosed().subscribe(() => {
      this.onCancel();
      subscriber.unsubscribe();
    });
  }

  public onConfirm(): void {
    this.data.callback(true);
  }

  public onCancel(): void {
    this.data.callback(false);
  }
}
