import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { throwError as observableThrowError, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public loader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  getService(
    url: string,
    payload: { platform: string; user_id: void; role_id: void }
  ) {
    throw new Error('Method not implemented.');
  }

  baseUrl: string = '';

  constructor(private http: HttpClient) {
    // this.baseUrl = environment.apiHost;
  }

  showLoader(value: boolean) {
    this.loader.next(value);
  }

  get(url: string, option?: {}) {
    return this.http.get(url, option);
  }

  post(url: string, reqBody: any, option?: {}) {
    return this.http.post(url, reqBody, option);
  }

  put(url: string, reqBody: any, option?: {}) {
    return this.http.put(url, reqBody, option);
  }

  patch(url: string, reqBody: any, option?: {}) {
    return this.http.patch(url, reqBody, option);
  }

  delete(url: string) {
    return this.http.delete(url);
  }

  postService(url: string, data: any) {
    const json = JSON.stringify(data);
    url = this.baseUrl + url;
    return this.http
      .post(url, json)
      .pipe(map(this.extractData), catchError(this.handleError));
  }

  private extractData(res: any) {
    const body = res;
    return body || {};
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
}
