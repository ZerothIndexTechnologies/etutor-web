import {Component, inject} from '@angular/core';
import {AuthService} from '../../../../shared/services/auth.service';
import {HelperService} from '../../../../shared/services/helper.service';
import {SharedCoreModule} from "../../../../shared/modules/sharedcore.module";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Urls} from "../../../../shared/services/urls";
import {CustomValidationService} from "../../../../shared/services/customValidations.service";
import {NgIf} from "@angular/common";
import {Router} from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    SharedCoreModule, NgIf
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  auth = inject(AuthService);
  public validation = inject(CustomValidationService);
  private formBuilder = inject(FormBuilder);
  private helper = inject(HelperService);
  private router = inject(Router);
  public sameOldPassword = false;
  public accountForm: FormGroup;
  public passwordValid = true;
  public conps = true;
  public conps1 = true;
  public conps2 = true;

  constructor() {
    this.accountForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      oldpassword: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
    });
  }

  onLogout() {
    this.auth.signOut();
    this.helper.presentToast('Successfully LoggedOut');
  }

  changePassword() {
    const password = this.accountForm.controls['password'].value.trim();
    const confirm_password = this.accountForm.controls['confirmPassword'].value.trim();
    if (this.accountForm.valid) {
      if (!this.passwordValid) {
        if (!this.sameOldPassword) {
          const data = {
            password,
            existing_password: this.accountForm.controls['oldpassword'].value.trim(),
            confirm_password,
            is_teacher: this.auth.getRoleId() == '2' ? '1' : '0',
          };
          this.auth.postService(data, Urls.changePassword).subscribe((successData) => {
              this.changePasswordSuccess(successData);
            },
            (error) => {
              console.error(error, 'error');
            });
        } else {
          this.helper.presentErrorToast('Password and Confirm Password should not be same as Old Password');
        }
      } else {
        this.helper.presentErrorToast('Password and Confirm Password should be same');
      }
    } else {
      this.validation.validateAllFormFields(this.accountForm);
    }
  }

  changePasswordSuccess(successData: any) {
    if (successData.IsSuccess) {
      this.helper.presentToast(successData.ResponseObject || 'Password updated successfully!');
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 500);
    } else {
      this.helper.presentErrorToast(successData.ErrorObject);
    }
  }

  checkPasswords() {
    const pass = this.accountForm.controls['password'].value.trim();
    const confirmPass = this.accountForm.controls['confirmPassword'].value.trim();
    this.passwordValid = pass !== confirmPass;
    return this.passwordValid;
  }

  checkOldPassword(formControlName: any) {
    const old_password = this.accountForm.controls['oldpassword'].value.trim();
    const checkPassword = this.accountForm.controls[formControlName].value.trim();
    this.sameOldPassword = old_password === checkPassword && checkPassword != '';
    return old_password === checkPassword && checkPassword != '';
  }
}
