import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, public router: Router) {}

  canActivate() {
    if (this.authService.isLoggedIn) {
      // this.router.navigate(['/auth/intro']);
      return true;
    } else {
      this.router.navigate(['home']);
      return false;
      // return true;
    }
  }
}
