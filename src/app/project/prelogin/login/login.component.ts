import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HelperService } from '../../../shared/services/helper.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ApiService } from '../../../shared/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { Urls } from '../../../shared/services/urls';
import { CustomValidationService } from '../../../shared/services/customValidations.service';
import {NgIf, NgClass} from '@angular/common';

export const params = {
  email: 'mobile',
  password: 'password',
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  showLogin: any = false;
  loginForm: FormGroup;
  showForGot: any = false;
  user: any;
  showPwd: boolean = false;

  constructor(private route: Router, public customValidater: CustomValidationService, private fb: FormBuilder,
              private helper: HelperService, private auth: AuthService, private api: ApiService, private pop: MatDialog) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  userLogin(form: FormGroup) {
    if (!form.valid) {
      this.customValidater.validateAllFormFields(form);
      this.helper.presentErrorToast('Invalid Form Field');
      return;
    }
    this.auth.setLocalStorage('login', JSON.stringify(true));
    const payload = btoa(form.value.email + '|' + form.value.password);
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
            this.auth.setLocalStorage('user', JSON.stringify(successData.ResponseObject));
            this.helper.presentToast('Successfully LoggedIn');
            this.auth.setLocalStorage('login', JSON.stringify(false));
            if (this.user === '1') {
              // const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? '';
              // this.auth.setLocalStorage('lastLoggedInDay', currentDate);
              if (successData.ResponseObject.is_document_uploaded) {
                this.route.navigateByUrl('myaccount/myclasses/list');
              } else {
                this.route.navigateByUrl('tutor');
              }
            } else if (this.user === '0') {
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
  }
}
