import {
  Component,
  inject,
  OnInit
} from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import {filter} from 'rxjs';
import {AuthService} from '../../../shared/services/auth.service';
import {Dialog} from '@angular/cdk/dialog';
import {NgIf} from "@angular/common";
import {SseClient} from "ngx-sse-client";

import {Urls} from '../../../shared/services/urls';

@Component({
  selector: 'app-myaccount',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './myaccount.component.html',
  styleUrl: './myaccount.component.scss',
})
export class myAccountComponent implements OnInit {
  breadcrumbs: any = [];
  public auth = inject(AuthService);
  public currentUrl = '';
  sidebarMenus: any = []

  dialog = inject(Dialog);

  constructor(private router: Router, private route: ActivatedRoute, private sseClient: SseClient) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.breadcrumbs = this.createBreadcrumbs(this.route.root);
        this.currentUrl = event.urlAfterRedirects;
        this.updateActiveMenu();
      });
  }

  updateActiveMenu() {
    if (!this.currentUrl || !this.sidebarMenus) return;
    const currentUrlLower = this.currentUrl.toLowerCase();
    this.sidebarMenus.forEach((items: any) => {
      if (!items || !items.url || typeof items.url !== 'string') {
        items.active = false;
        return;
      }
      const urlSegments = items.url.split('/');
      if (urlSegments.length > 2 && urlSegments[2]) {
        const urlSegment = urlSegments[2].toLowerCase();
        items.active = currentUrlLower.includes(urlSegment);
      } else {
        items.active = false;
      }
    });
  }

  ngOnInit(): void {
    if (this.auth.isTeacherUser) {
      const userId = this.auth.getUserId();
      if (userId) {
        this.auth.http.get<any>(`${Urls.notifyTeacherProfileStatus}?id=${userId}`).subscribe({
          next: (res: any) => {
            if (res && res.IsSuccess && res.ResponseObject) {
              try {
                const userDetails = JSON.parse(this.auth.getLocalStorage('user') || '{}');
                userDetails.is_account_verified = res.ResponseObject.is_account_verified;
                if (res.ResponseObject.rejection_notes) {
                  userDetails.rejection_notes = res.ResponseObject.rejection_notes;
                }
                this.auth.setLocalStorage('user', JSON.stringify(userDetails));
              } catch (e) {
                console.error(e);
              }
            }
          },
          error: (err) => console.error(err)
        });
      }
      this.sidebarMenus = [
        {
          title: 'General',
          url: '/myaccount/general',
          icon: 'fas fa-home',
          active: false,
        },
        {
          title: 'My Classes',
          url: '/myaccount/myclasses/list',
          icon: 'fas fa-book-open',
          active: false,
        },
        {
          title: 'My Students',
          url: '/myaccount/mystudents',
          icon: 'fas fa-user-graduate',
          active: false,
        },
        {
          title: 'Wallet',
          url: '/myaccount/wallet',
          icon: 'fas fa-wallet',
          active: false,
        },
        {
          title: 'Privacy Policy',
          url: '/myaccount/privacyPolicy',
          icon: 'fas fa-shield-alt',
          active: false,
        },
        {
          title: 'Change Password',
          url: '/myaccount/change-password',
          icon: 'fas fa-lock',
          active: false,
        },
        {
          title: 'Logout',
          url: 'logout',
          icon: 'fas fa-sign-out-alt text-danger',
          active: false,
        },
      ];
    } else {
      this.sidebarMenus = [
        {
          title: 'General',
          url: '/myaccount/general',
          icon: 'fas fa-home',
          active: false,
        },
        {
          title: 'My Classes',
          url: '/myaccount/myclasses/list',
          icon: 'fas fa-book-open',
          active: false,
        },
        {
          title: 'Reserve Classes',
          url: '/myaccount/reserve-class/list',
          icon: 'far fa-calendar-alt',
          active: false,
        },
        {
          title: 'Watchlist',
          url: '/myaccount/watchlist',
          icon: 'fas fa-heart',
          active: false,
        },
        {
          title: 'Attendance History',
          url: '/myaccount/attendance-history',
          icon: 'fas fa-history',
          active: false,
        },
        {
          title: 'Wallet',
          url: '/myaccount/wallet',
          icon: 'fas fa-wallet',
          active: false,
        },
        {
          title: 'Privacy Policy',
          url: '/myaccount/privacyPolicy',
          icon: 'fas fa-shield-alt',
          active: false,
        },
        {
          title: 'Change Password',
          url: '/myaccount/change-password',
          icon: 'fas fa-lock',
          active: false,
        },
        {
          title: 'Logout',
          url: 'logout',
          icon: 'fas fa-sign-out-alt text-danger',
          active: false,
        }
      ];
    }
    this.updateActiveMenu();
  }

  private createBreadcrumbs(route: ActivatedRoute): any {
    const children = route.children;
    if (children.length === 0) {
      return this.breadcrumbs;
    }

    for (const child of children) {
      const name =
        child.snapshot.data['breadcrumb'] !== 'General'
          ? child.snapshot.data['breadcrumb']
          : this.auth.getUserType === '1'
            ? 'Teacher'
            : 'Student';

      if (name) {
        this.breadcrumbs = [{name}];
      }
      return this.createBreadcrumbs(child);
    }

    return this.breadcrumbs;
  }

  navigation(menu: any, i: number) {
    if (menu.url === 'logout' || menu.title === 'Logout') {
      this.auth.signOut();
      return;
    }
    this.sidebarMenus.forEach((menu: any, index: any) => {
      menu.active = i === index;
    });
    this.router.navigateByUrl(menu.url);
  }

  navigateToGeneral() {
    this.router.navigateByUrl('/myaccount/general');
  }
}
