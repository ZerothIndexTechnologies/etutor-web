import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { HelperService } from '../../../shared/services/helper.service';
import { Urls } from '../../../shared/services/urls';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotInput: string = '';
  isTeacher: boolean = false;
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  successMessage: string = '';

  constructor(
    private auth: AuthService,
    private helper: HelperService,
    private router: Router
  ) {}

  resetPassword() {
    if (this.isSubmitting) return;

    if (!this.forgotInput || !this.forgotInput.trim()) {
      this.helper.presentErrorToast('Please enter your Email Id or Mobile Number');
      return;
    }

    this.isSubmitting = true;
    const inputVal = this.forgotInput.trim();
    const payload = {
      email_or_mobile: inputVal,
      is_teacher: this.isTeacher
    };

    this.auth.postService(payload, Urls.forgotPassword).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res && res.IsSuccess) {
          this.isSuccess = true;
          this.successMessage = res.ResponseObject || 'A new password has been sent to your registered email address.';
          this.helper.presentToast(this.successMessage);
        } else {
          this.helper.presentErrorToast(res ? res.ErrorObject : 'Failed to reset password');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.helper.presentErrorToast('Server error while resetting password. Please try again.');
      }
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/home');
  }
}
