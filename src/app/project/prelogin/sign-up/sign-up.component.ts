import { Component } from '@angular/core';
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

export class SignUpComponent {
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
  constructor(private helper: HelperService, public customValidation: CustomValidationService, private api: ApiService,
    public auth: AuthService, private fb: FormBuilder, private pop: MatDialog, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mobile_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      grade: [''],
      otp: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.gradeList = this.auth.getConfigurationData().grade || [];
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
            this.helper.presentToast('OTP has sent successfully to given Mail ID');
            this.resendOTP ? this.resendOTP = false : this.resendOTP = false;
            !this.showOTP ? this.showOTP = true: this.showOTP = true;
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

  // submitting after enterign otp
  onSubmit(formObj: FormGroup) {
    console.log('sertvice')
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
    this.user === '1' ? (reqObj['grade'] = formObj.value.grade) : '';
    this.auth.postService(reqObj, Urls.signup).subscribe({
      next: (successData) => {
        if (successData.IsSuccess) {
          this.helper.presentToast('Your account created successfully, please login to configure classes');
          this.pop.closeAll();
          this.router.navigateByUrl('tutor');
        } else {
          this.helper.presentToast(successData.ResponseObject);
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
