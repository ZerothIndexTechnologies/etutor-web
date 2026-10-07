import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface ConfirmModalData {
  title?: string;
  message: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: string;
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public rawData: ConfirmModalData = inject(DIALOG_DATA, { optional: true }) || { message: 'Are you sure?' };

  get data(): ConfirmModalData {
    return {
      title: this.rawData.title ?? 'Confirm Action',
      message: this.rawData.message ?? 'Are you sure?',
      subtext: this.rawData.subtext ?? '',
      confirmText: this.rawData.confirmText ?? 'Confirm',
      cancelText: this.rawData.cancelText ?? 'Cancel',
      type: this.rawData.type ?? 'danger',
      icon: this.rawData.icon ?? (this.rawData.type === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle'),
      showCloseButton: this.rawData.showCloseButton ?? false
    };
  }

  public confirm(): void {
    this.dialogRef.close(true);
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }
}
