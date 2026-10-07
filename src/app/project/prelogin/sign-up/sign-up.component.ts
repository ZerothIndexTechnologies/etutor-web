import { Component, AfterViewInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../shared/services/api.service';
import { HelperService } from '../../../shared/services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { CustomValidationService } from '../../../shared/services/customValidations.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Urls } from '../../../shared/services/urls';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, NgIf, NgClass],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})

export class SignUpComponent implements AfterViewInit {
  signupForm: FormGroup;
  showForm: boolean = false;
  user = '';
  showOTP: boolean = false;
  public resendOTP = false;
  gradeList: any = [];
  showOtp: boolean =  false;
  countdown: number = 60;
  isResendDisabled: boolean = false;
  interval: any;
  readonly googleClientId = '139081449172-h53j5aghth42fdjr9ljk82u563tnluh7.apps.googleusercontent.com';

  constructor(private helper: HelperService, public customValidation: CustomValidationService, private api: ApiService,
    public auth: AuthService, private fb: FormBuilder, private pop: MatDialog, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mobile_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      grade: [''],
      otp: [''],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.gradeList = this.auth.getConfigurationData().grade || [];
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

        const btnContainer = document.getElementById('googleBtnSignup');
        if (btnContainer && btnContainer.childElementCount === 0) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 280,
            text: 'signup_with'
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
    const firstName = this.signupForm.value.first_name || googlePayload.given_name || (googlePayload.name ? googlePayload.name.split(' ')[0] : '');
    const lastName = this.signupForm.value.last_name || googlePayload.family_name || (googlePayload.name ? googlePayload.name.split(' ').slice(1).join(' ') : '');
    const email = this.signupForm.value.email || googlePayload.email || '';
    const mobileNumber = this.signupForm.value.mobile_number || '';
    const picture = googlePayload.picture || '';

    const payload = {
      id_token: response.credential,
      is_teacher: this.user === '1',
      is_signup: true,
      grade: this.signupForm.value.grade || 0,
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile_number: mobileNumber,
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
            mobile_number: serverUser.mobile_number || serverUser.mobile || mobileNumber,
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
          if (!userObj.mobile_number) userObj.mobile_number = mobileNumber;
          if (!userObj.profile_image) userObj.profile_image = picture;

          this.pop.closeAll();
          this.auth.setLocalStorage('token', userObj.accesstoken || serverUser.accesstoken);
          this.auth.setLocalStorage('user_id', JSON.stringify(userObj.user_id));
          this.auth.setLocalStorage('role_id', JSON.stringify(userObj.role_id));
          this.auth.setLocalStorage('loggedInUser', JSON.stringify(this.user || (userObj.role_id === 2 ? '1' : '0')));
          this.auth.setLocalStorage('user', JSON.stringify(userObj));
          this.auth.setLocalStorage('teacherProfile', JSON.stringify(userObj));
          this.helper.presentToast('Successfully Registered with Google!');
          
          if (userObj.role_id === 2 || userObj.role_id === '2') {
            const isVerified = userObj.is_account_verified == '1' || userObj.is_account_verified == 1 || userObj.is_verified == '1' || userObj.is_verified == 1;
            if (isVerified) {
              this.router.navigateByUrl('myaccount/myclasses/list');
            } else {
              this.router.navigateByUrl('tutor');
            }
          } else {
            this.router.navigateByUrl('myaccount/myclasses/list');
          }
        } else {
          this.helper.presentErrorToast(res ? res.ErrorObject : 'Google authentication failed.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.helper.presentErrorToast('Server error during Google Sign-Up.');
      }
    });
  }

  sendOTP(formObj: FormGroup) {
    if (!this.showOTP || this.resendOTP) {
      if (formObj.get('email')?.invalid || formObj.get('mobile_number')?.invalid) {
        this.helper.presentErrorToast('Email-Id and Mobile Number are mandatory field');
        return;
      }
      const reqObj = {
        mobile_number: formObj.value.mobile_number,
        email: formObj.value.email,
        is_teacher: this.user === '1',
      };

      this.auth.postService(reqObj, Urls.verifyUser).subscribe({next: (successData) => {
          if (successData.IsSuccess) {
            this.helper.presentToast(successData.ResponseObject || 'OTP has sent successfully to given Mail ID');
            this.resendOTP ? this.resendOTP = false : this.resendOTP = false;
            !this.showOTP ? this.showOTP = true: this.showOTP = true;
            this.signupForm.get('otp')?.setValidators([Validators.required]);
            this.signupForm.get('otp')?.updateValueAndValidity();
            this.startCountdown();
          } else {
            this.showOTP = false;
            this.resendOTP = false;
            this.helper.presentErrorToast(successData.ErrorObject);
          }
        }, error: (error) => {
          console.error(error, 'booking error');
        },
      });
    }
  }

  onSubmit(formObj: FormGroup) {
    if (!this.showOTP) {
      this.sendOTP(formObj);
      return;
    }
    if (formObj.invalid) {
      this.customValidation.validateAllFormFields(formObj);
      return;
    }
    const reqObj: any = {
      first_name: formObj.value.first_name,
      last_name: formObj.value.last_name,
      mobile_number: formObj.value.mobile_number,
      email: formObj.value.email,
      gender: formObj.value.gender,
      otp: formObj.value.otp,
      is_teacher: this.user === '1',
    };
    if (this.user === '0') {
      reqObj['grade'] = formObj.value.grade;
    }
    this.auth.postService(reqObj, Urls.signup).subscribe({
      next: (successData) => {
        if (successData.IsSuccess) {
          this.helper.presentToast(successData.ResponseObject || 'Your account created successfully, please login');
          this.pop.closeAll();
          this.openLogin();
        } else {
          this.helper.presentErrorToast(successData.ErrorObject || successData.ResponseObject || 'Registration failed');
        }
      },
      error: (error) => {
        this.helper.presentErrorToast('server error');
        console.error(error, 'booking error');
      },
    });
  }

  openLogin() {
    this.pop.closeAll();
    setTimeout(() => {
      this.pop.open(LoginComponent, {
        width: '800px',
        height: '680px',
        panelClass: 'my-dialog',
        data: '',
        hasBackdrop: true,
        disableClose: false,
      });
    }, 300);
  }

  closePopup() {
    this.pop.closeAll();
  }

  public numberValidation(event: any) {
    this.customValidation.numberOnly(event);
  }

  selectFormType(value = '') {
    this.showForm = !this.showForm;
    this.user = value;
    if (this.showForm && this.user === '0') {
      this.signupForm.controls['grade'].setValidators([Validators.required]);
      this.signupForm.controls['grade'].updateValueAndValidity();
    } else {
      this.signupForm.controls['grade'].clearValidators();
      this.signupForm.controls['grade'].updateValueAndValidity();
    }
    setTimeout(() => this.initGoogleAuth(), 100);
  }

  startCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isResendDisabled = true;
    this.countdown = 60;
    this.interval = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        this.isResendDisabled = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
