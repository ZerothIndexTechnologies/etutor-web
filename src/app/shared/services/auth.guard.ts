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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['home']);
      return false;
    }

    const url = (state.url || '').toLowerCase();

    // Guard rules for Teacher Users
    if (this.authService.isTeacherUser) {
      const isVerified = this.authService.isTeacherVerified;

      // 1. If verified teacher tries to access /tutor (Become Tutor), redirect to My Account
      if (url.includes('tutor') && isVerified) {
        this.router.navigate(['myaccount/general']);
        return false;
      }

      // 2. If unverified teacher tries to access /myaccount or its child pages, redirect to Become Tutor onboarding
      if (url.includes('myaccount') && !isVerified) {
        this.router.navigate(['tutor']);
        return false;
      }
    } else {
      // Student users cannot access /tutor
      if (url.includes('tutor')) {
        this.router.navigate(['myaccount/myclasses/list']);
        return false;
      }
    }

    return true;
  }
}
