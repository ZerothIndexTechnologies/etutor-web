import {Injectable} from '@angular/core';
import {SessionConstants} from './sessionConstants';
import {Router} from '@angular/router';
import {catchError, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {throwError as observableThrowError} from 'rxjs/internal/observable/throwError';

const environment: any = {
  sessionPrefix: 'etutor',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;

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
      url != 'user/login' && url != 'user/forgotPassword' && url != 'user/verifyUser' && url != 'user/signup'
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
  signOut() {
    const valueToKeep = JSON.parse(
      this.getLocalStorage(SessionConstants.configData)
    ); //
    this.removeLocalStorage(SessionConstants.user_id);
    localStorage.clear();
    sessionStorage.clear();
    // Set the key back with its value
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

  get teacherVerificationStatus() {
    try {
      const userDetails = JSON.parse(this.getLocalStorage('user') || '{}');
      return userDetails ? userDetails.is_account_verified : '0';
    } catch (e) {
      return '0';
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
