import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { HelperService } from '../../../shared/services/helper.service';
import { Urls } from '../../../shared/services/urls';
import { SessionConstants } from '../../../shared/services/sessionConstants';

@Component({
  selector: 'app-superadmin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './superadmin-login.component.html',
  styleUrl: './superadmin-login.component.scss'
})
export class SuperAdminLoginComponent {
  public email: string = 'admin@etutor.com';
  public password: string = 'admin123';
  public loading: boolean = false;

  private auth = inject(AuthService);
  private helper = inject(HelperService);
  private router = inject(Router);

  onAdminLogin(): void {
    if (!this.email || !this.password) {
      this.helper.presentErrorToast('Please enter SuperAdmin email and password.');
      return;
    }

    this.loading = true;
    const payload = {
      email: this.email,
      password: this.password,
      platform: 'web'
    };

    this.auth.postService<any>(payload, Urls.adminLogin).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.IsSuccess && res.ResponseObject) {
          const user = res.ResponseObject;
          this.auth.setLocalStorage(SessionConstants.user_id, user.user_id);
          this.auth.setLocalStorage(SessionConstants.role_id, '1');
          this.auth.setLocalStorage('token', user.accesstoken);
          this.auth.setLocalStorage('userDetails', JSON.stringify(user));

          this.helper.presentToast('SuperAdmin logged in successfully!');
          this.router.navigate(['/superadmin']);
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Invalid SuperAdmin credentials.');
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.helper.presentErrorToast(err?.error?.ErrorObject || 'Login failed. Please check credentials.');
      }
    });
  }
}
