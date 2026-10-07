import {Injectable, inject} from '@angular/core';
import {SessionConstants} from './sessionConstants';
import {Router} from '@angular/router';
import {catchError, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {throwError as observableThrowError} from 'rxjs/internal/observable/throwError';
import {Dialog} from '@angular/cdk/dialog';
import {ConfirmModalComponent} from '../components/confirm-modal/confirm-modal.component';

const environment: any = {
  sessionPrefix: 'etutor',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;
  private dialog = inject(Dialog);

  constructor(
    public router: Router,
    public http: HttpClient,
  ) {
  }

  postService<T extends Response>(data: any, url: any) {
    const jsonStructure = {
      platform: 'web',
      user_id: this.getUserId(),
      role_id: this.getRoleId(),
    };
    const updatedData =
      url != 'user/login' && url != 'user/googleAuth' && url != 'user/forgotPassword' && url != 'user/verifyUser' && url != 'user/signup'
        ? {...jsonStructure, ...data}
        : data;
    const json = JSON.stringify(updatedData);
    return this.http.post<T>(url, json).pipe(
      map((response: T) => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  private extractData(response: Response): any {
    return response || {};
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      // const body = error.json() || '';
      const err = error || JSON.stringify(error);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return observableThrowError(error);
  }

  setUserDetails(name: any, data: any) {
    if (data) {
      this.userData = data;
      this.setLocalStorage(name, JSON.stringify(this.userData));
      JSON.parse(this.getLocalStorage(name)!);
    } else {
      this.setLocalStorage(name, 'null');
      JSON.parse(this.getLocalStorage(name)!);
    }
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    if (this.getLocalStorage(SessionConstants.user_id)) {
      const user = JSON.parse(this.getLocalStorage(SessionConstants.user_id)!);
      return !!(user !== 'null' && user);
    } else {
      return false;
    }
  }

  getAccessToken() {
    return this.getLocalStorage(SessionConstants.token);
  }

  getConfigurationData() {
    return JSON.parse(this.getLocalStorage(SessionConstants.configData));
  }

  getUserDetails() {
    return JSON.parse(this.getLocalStorage('user'));
  }

  // Sign out
  signOut(showConfirm: boolean = true) {
    if (showConfirm) {
      const dialogRef = this.dialog.open<boolean>(ConfirmModalComponent, {
        width: '440px',
        disableClose: false,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-dark-backdrop',
        data: {
          title: 'Confirm Logout',
          message: 'Are you sure you want to log out?',
          confirmText: 'Log Out',
          cancelText: 'Cancel',
          type: 'danger',
          icon: 'fas fa-sign-out-alt'
        }
      });

      dialogRef.closed.subscribe((confirmed) => {
        if (confirmed) {
          this.executeSignOut();
        }
      });
      return;
    }
    this.executeSignOut();
  }

  private executeSignOut() {
    const valueToKeep = JSON.parse(
      this.getLocalStorage(SessionConstants.configData)
    );
    this.removeLocalStorage(SessionConstants.user_id);
    localStorage.clear();
    sessionStorage.clear();
    if (valueToKeep !== null) {
      this.setLocalStorage(
        SessionConstants.configData,
        JSON.stringify(valueToKeep)
      );
    }
    this.router.navigate(['home']);
  }

  getSessionData(variable: string) {
    variable = this.encryption(environment.sessionPrefix + variable);
    return sessionStorage.getItem(variable);
  }

  setSessionData(variable: string, value: string) {
    variable = this.encryption(environment.sessionPrefix + variable);
    return sessionStorage.setItem(variable, value);
  }

  // // encripiton session codes
  public setLocalStorage(variable: string, value: string) {
    variable = this.encryption(environment.sessionPrefix + variable);
    return localStorage.setItem(variable, value);
  }

  public getLocalStorage(variable: any): any {
    variable = this.encryption(environment.sessionPrefix + variable);
    return localStorage.getItem(variable);
  }

  public removeLocalStorage(variable: any) {
    variable = this.encryption(environment.sessionPrefix + variable);
    localStorage.removeItem(variable);
  }

  encryption(value: string) {
    return environment.encryption ? btoa(value) : value;
  }

  getRoleId() {
    return JSON.parse(this.getLocalStorage(SessionConstants.role_id));
  }

  getUserId() {
    return JSON.parse(this.getLocalStorage(SessionConstants.user_id));
  }

  get getUserType() {
    //  student - '0', Teacher - '1'
    return JSON.parse(this.getLocalStorage('loggedInUser'));
  }

  get isTeacherUser(): boolean {
    try {
      const userStr = this.getLocalStorage('user');
      if (userStr && userStr !== 'null') {
        const u = JSON.parse(userStr);
        if (u.role_id == '2' || u.role_id == 2 || u.user_type == '1' || u.user_type == 1 || u.is_teacher == '1' || u.is_teacher == 1 || u.is_teacher === true) {
          return true;
        }
      }
      const roleId = String(this.getRoleId());
      const userType = String(this.getUserType);
      return roleId === '2' || userType === '1';
    } catch (e) {
      return false;
    }
  }

  get isStudentUser(): boolean {
    return !this.isTeacherUser;
  }

  get teacherVerificationStatus() {
    try {
      const userDetails = JSON.parse(this.getLocalStorage('user') || '{}');
      const teacherProfile = JSON.parse(this.getLocalStorage('teacherProfile') || '{}');
      if (userDetails && userDetails.is_account_verified !== undefined && userDetails.is_account_verified !== null) {
        return String(userDetails.is_account_verified);
      }
      if (teacherProfile && teacherProfile.is_account_verified !== undefined && teacherProfile.is_account_verified !== null) {
        return String(teacherProfile.is_account_verified);
      }
      return '0';
    } catch (e) {
      return '0';
    }
  }

  get isTeacherApplicationSubmitted(): boolean {
    try {
      const userStr = this.getLocalStorage('user');
      if (!userStr || userStr === 'null') return false;
      const u = JSON.parse(userStr);
      if (!u || Object.keys(u).length === 0) return false;
      const currentEmail = (u.email || '').toLowerCase().trim();
      if (u.first_name === 'JOHN' && u.last_name === 'V' && currentEmail !== 'john@example.com') {
        return false;
      }
      if (u.is_account_verified == '1' || u.is_account_verified == 1 || u.is_account_verified === true || u.is_account_verified === 'true') return false;
      return !!(
        u.is_document_uploaded == '1' ||
        u.is_document_uploaded === 1 ||
        u.is_document_uploaded === true ||
        u.application_submitted === true ||
        u.is_submitted === true
      );
    } catch (e) {
      return false;
    }
  }

  get isTeacherVerified(): boolean {
    if (!this.isTeacherUser) return true;
    try {
      const userDetails = JSON.parse(this.getLocalStorage('user') || '{}');
      const teacherProfile = JSON.parse(this.getLocalStorage('teacherProfile') || '{}');
      const status = userDetails?.is_account_verified ?? userDetails?.is_verified ?? teacherProfile?.is_account_verified ?? teacherProfile?.is_verified;
      return (
        status == '1' ||
        status === 1 ||
        status === true ||
        status === 'true' ||
        String(status).toUpperCase() === 'APPROVED' ||
        String(status).toUpperCase() === 'VERIFIED'
      );
    } catch (e) {
      return false;
    }
  }

  get teacherRejectionNotes() {
    try {
      const userDetails = JSON.parse(this.getLocalStorage('user') || '{}');
      if (userDetails && userDetails.rejection_notes) return userDetails.rejection_notes;
      if (userDetails && userDetails.admin_notes) return userDetails.admin_notes;
      if (userDetails && userDetails.rejection_reason) return userDetails.rejection_reason;
      return 'Please re-upload a clear government-issued ID proof and valid teaching degree / experience certificates for verification review.';
    } catch (e) {
      return 'Please re-upload a clear government-issued ID proof and valid teaching degree / experience certificates for verification review.';
    }
  }
}
