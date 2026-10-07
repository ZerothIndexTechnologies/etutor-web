import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HelperService } from '../../../shared/services/helper.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ApiService } from '../../../shared/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { Urls } from '../../../shared/services/urls';
import { CustomValidationService } from '../../../shared/services/customValidations.service';
import { NgIf, NgClass } from '@angular/common';

export const params = {
  email: 'mobile',
  password: 'password',
};

export function emailOrMobileValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').trim();
  if (!value) return null;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^\+?[0-9]{7,15}$/;
  if (emailRegex.test(value) || mobileRegex.test(value)) {
    return null;
  }
  return { invalidIdentifier: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  })
export class LoginComponent implements AfterViewInit {
  showLogin: any = false;
  loginForm: FormGroup;
  showForGot: any = false;
  user: any;
  showPwd: boolean = false;
  forgotInput: string = '';
  readonly googleClientId = '139081449172-h53j5aghth42fdjr9ljk82u563tnluh7.apps.googleusercontent.com';

  constructor(private route: Router, public customValidater: CustomValidationService, private fb: FormBuilder,
              private helper: HelperService, private auth: AuthService, private api: ApiService, private pop: MatDialog) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, emailOrMobileValidator]],
      password: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  initGoogleAuth(): void {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: (response: any) => this.handleGoogleCredential(response),
          ux_mode: 'popup',
          auto_select: false,
          error_callback: (err: any) => {
            console.warn('Google Identity Services origin notice:', err);
          }
        });

        const btnContainer = document.getElementById('googleBtnLogin');
        if (btnContainer && btnContainer.childElementCount === 0) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 280,
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.warn('Could not initialize Google Auth:', err);
      }
    } else {
      setTimeout(() => this.initGoogleAuth(), 300);
    }
  }

  decodeGoogleToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return {};
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding Google JWT token', e);
      return {};
    }
  }

  handleGoogleCredential(response: any): void {
    if (!response || !response.credential) return;

    const googlePayload = this.decodeGoogleToken(response.credential);
    const firstName = googlePayload.given_name || (googlePayload.name ? googlePayload.name.split(' ')[0] : '');
    const lastName = googlePayload.family_name || (googlePayload.name ? googlePayload.name.split(' ').slice(1).join(' ') : '');
    const email = googlePayload.email || '';
    const picture = googlePayload.picture || '';

    const payload = {
      id_token: response.credential,
      is_teacher: this.user === '1',
      is_signup: false,
      first_name: firstName,
      last_name: lastName,
      email: email,
      profile_image: picture
    };

    this.auth.postService(payload, Urls.googleAuth).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && res.ResponseObject) {
          const serverUser = res.ResponseObject;
          const userObj = {
            ...googlePayload,
            first_name: serverUser.first_name || firstName,
            last_name: serverUser.last_name || lastName,
            email: serverUser.email || email,
            mobile_number: serverUser.mobile_number || serverUser.mobile || serverUser.phone || '',
            profile_image: serverUser.profile_image || picture,
            ...serverUser
          };
          // Sanitize dummy placeholder server names (Johnson GM, JOHN V)
          const currentEmail = (userObj.email || email).toLowerCase().trim();
          const fLower = (userObj.first_name || '').toLowerCase().trim();
          const lLower = (userObj.last_name || '').toLowerCase().trim();
          if ((fLower === 'johnson' || lLower === 'gm' || (fLower === 'john' && lLower === 'v')) && currentEmail !== 'johnson@example.com' && currentEmail !== 'john@example.com') {
            userObj.first_name = googlePayload.given_name || (googlePayload.name ? googlePayload.name.split(' ')[0] : '');
            userObj.last_name = googlePayload.family_name || (googlePayload.name ? googlePayload.name.split(' ').slice(1).join(' ') : '');
          }

          if (!userObj.first_name) userObj.first_name = firstName;
          if (!userObj.last_name) userObj.last_name = lastName;
          if (!userObj.email) userObj.email = email;
          if (!userObj.profile_image) userObj.profile_image = picture;

          this.pop.closeAll();
          this.auth.setLocalStorage('token', userObj.accesstoken || serverUser.accesstoken);
          this.auth.setLocalStorage('user_id', JSON.stringify(userObj.user_id));
          this.auth.setLocalStorage('role_id', JSON.stringify(userObj.role_id));
          this.auth.setLocalStorage('loggedInUser', JSON.stringify(this.user || (userObj.role_id === 2 ? '1' : '0')));
          this.auth.setLocalStorage('user', JSON.stringify(userObj));
          this.auth.setLocalStorage('teacherProfile', JSON.stringify(userObj));
          this.helper.presentToast('Successfully Logged In with Google!');
          
          if (userObj.role_id === 2 || userObj.role_id === '2') {
            const isVerified = userObj.is_account_verified == '1' || userObj.is_account_verified == 1 || userObj.is_verified == '1' || userObj.is_verified == 1;
            if (isVerified) {
              this.route.navigateByUrl('myaccount/myclasses/list');
            } else {
              this.route.navigateByUrl('tutor');
            }
          } else {
            this.route.navigateByUrl('myaccount/myclasses/list');
          }
        } else {
          this.helper.presentErrorToast(res ? res.ErrorObject : 'Google authentication failed.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.helper.presentErrorToast('Server error during Google Login.');
      }
    });
  }

  isForgotSubmitting: boolean = false;

  openForgotPassword() {
    this.showLogin = undefined;
    this.showForGot = true;
    const currentEmail = this.loginForm?.get('email')?.value;
    if (currentEmail) {
      this.forgotInput = currentEmail;
    }
  }

  backToLogin() {
    this.showForGot = false;
    this.showLogin = true;
    setTimeout(() => this.initGoogleAuth(), 100);
  }

  resetPassword() {
    if (this.isForgotSubmitting) return;

    if (!this.forgotInput || !this.forgotInput.trim()) {
      this.helper.presentErrorToast('Please enter your Email Id or Mobile Number');
      return;
    }

    this.isForgotSubmitting = true;
    const inputVal = this.forgotInput.trim();
    const payload = {
      email_or_mobile: inputVal,
      is_teacher: this.user === '1'
    };

    this.auth.postService(payload, Urls.forgotPassword).subscribe({
      next: (res: any) => {
        this.isForgotSubmitting = false;
        if (res && res.IsSuccess) {
          this.helper.presentToast(res.ResponseObject || 'New password sent to your email');
          this.showForGot = false;
          this.showLogin = true;
          if (inputVal.includes('@')) {
            this.loginForm.patchValue({ email: inputVal });
          }
          setTimeout(() => this.initGoogleAuth(), 100);
        } else {
          this.helper.presentErrorToast(res ? res.ErrorObject : 'Failed to reset password');
        }
      },
      error: (err) => {
        this.isForgotSubmitting = false;
        console.error(err);
        this.helper.presentErrorToast('Server error while resetting password');
      }
    });
  }

  userLogin(form: FormGroup) {
    if (!form.valid) {
      this.customValidater.validateAllFormFields(form);
      this.helper.presentErrorToast('Invalid Form Field');
      return;
    }
    this.auth.setLocalStorage('login', JSON.stringify(true));
    const identifier = (form.value.email || '').trim();
    const payload = btoa(identifier + '|' + form.value.password);
    this.auth.setLocalStorage('login_accesstoken', payload);
    this.auth
      .postService({ is_teacher: this.user !== '0' }, Urls.login)
      .subscribe({
        next: (successData) => {
          if (successData.IsSuccess) {
            this.pop.closeAll();
            this.auth.setLocalStorage('token', successData.ResponseObject.accesstoken);
            this.auth.setLocalStorage('user_id', JSON.stringify(successData.ResponseObject.user_id));
            this.auth.setLocalStorage('role_id', JSON.stringify(successData.ResponseObject.role_id));
            this.auth.setLocalStorage('loggedInUser', JSON.stringify(this.user));
            this.auth.setLocalStorage('user', JSON.stringify(successData.ResponseObject));
            this.helper.presentToast('Successfully LoggedIn');
            this.auth.setLocalStorage('login', JSON.stringify(false));
            const u = successData.ResponseObject;
            const isVerified = u && (u.is_account_verified == '1' || u.is_account_verified == 1 || u.is_verified == '1' || u.is_verified == 1);
            if (this.user === '1' || u.role_id === 2 || u.role_id === '2') {
              if (isVerified) {
                this.route.navigateByUrl('myaccount/myclasses/list');
              } else {
                this.route.navigateByUrl('tutor');
              }
            } else {
              this.route.navigateByUrl('myaccount/myclasses/list');
            }
          } else {
            this.helper.presentErrorToast(successData.ErrorObject);
          }
        },
        error: (error) => {
          this.helper.presentErrorToast('server error');
          console.error(error, 'booking error');
        },
      });
  }

  openSignup() {
    this.pop.closeAll();
    setTimeout(() => {
      this.pop.open(SignUpComponent, {
        width: '900px',
        height: '680px',
        panelClass: 'my-dialog',
        data: '',
        hasBackdrop: true,
        disableClose: false,
      });
    }, 300);
  }

   closePopup() {
    // Assuming you're using a MatDialog to display the popup
    this.pop.closeAll()
  }

  selectFormType(userType: any) {
    this.showLogin = !this.showLogin;
    this.user = userType;
    this.auth.setLocalStorage('loggedInUser', JSON.stringify(this.user));
    setTimeout(() => this.initGoogleAuth(), 100);
  }
}
