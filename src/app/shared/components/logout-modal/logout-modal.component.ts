import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-modal.component.html',
  styleUrl: './logout-modal.component.scss'
})
export class LogoutModalComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data = inject(DIALOG_DATA, { optional: true });

  public confirm(): void {
    this.dialogRef.close(true);
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }
}
