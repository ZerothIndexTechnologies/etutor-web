import { inject } from '@angular/core';
import { HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { EnvironmentService } from '../../environment.service';

export const AppInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(EnvironmentService);
  const auth = inject(AuthService);
  const api = inject(ApiService);
  const accesstoken =
    req.url == 'user/login'
      ? (auth.getLocalStorage('login_accesstoken') || '')
      : (auth.getAccessToken() || '');
  const url = environment.apiHost + req.url;
  let authReq: any;
  authReq = req.clone({
    url: url,
    setHeaders: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      accesstoken: accesstoken ? accesstoken : '',
    },
  });
  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const eventBody: any = event.body;
        if (eventBody && eventBody.IsSuccess) {
          api.showLoader(false);
        } else {
          api.showLoader(false);
        }
      }
      return event;
    }),
    catchError((err: any) => {
      const started = Date.now();
      const elapsed = Date.now() - started;
      console.log(
        `Request for ${req.urlWithParams} failed after ${elapsed} ms.`
      );
      api.showLoader(false);
      return throwError(err);
    })
  );
};

// export class AppInterceptor implements HttpInterceptor {
//     constructor(public auth: AuthService, public api: ApiService, public environment: EnvironmentService) {
//     }
//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         this.api.showLoader(true);
//         const url = this.environment.apiHost + req.url;
//         console.log(url, 'url');
//       const accesstoken = req.url == 'login' ? this.auth.getLocalStorage('login_accesstoken') : this.auth.getAccessToken() ?? '';
//         let authReq: any;
//         authReq = req.clone(
//             {
//                 url: url,
//                 setHeaders: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', accesstoken}
//             });
//         return next.handle(authReq).pipe(map((event: HttpEvent<any>) => {
//                 if (event instanceof HttpResponse) {
//                     if (event.body && event.body.IsSuccess) {
//                         this.api.showLoader(false);
//                     } else {
//                         this.api.showLoader(false);
//                     }
//                 }
//                 return event;
//             }),
//             catchError((error: HttpErrorResponse) => {
//                 const started = Date.now();
//                 const elapsed = Date.now() - started;
//                 console.log(`Request for ${req.urlWithParams} failed after ${elapsed} ms.`);
//                 this.api.showLoader(false);
//                 return throwError(error);
//             })
//         );
//
//     }
// }
