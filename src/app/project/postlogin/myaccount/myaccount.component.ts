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
        this.sidebarMenus.forEach((items: any) => {
          const menuName = items.title.replace(/\s/g, "");
          items.active = this.currentUrl.toLowerCase().includes(menuName.toLowerCase());
        })
      });
  }

  ngOnInit(): void {
    if (this.auth.getRoleId() != '3') {
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
          active: false,
        },
        {
          title: 'My Classes',
          url: '/myaccount/myclasses/list',
          active: true,
        },
        {
          title: 'Wallet',
          url: '/myaccount/wallet',
          active: false,
        },
        {
          title: 'Privacy Policy',
          url: '/myaccount/privacyPolicy',
          active: false,
        },
        {
          title: 'Change Password',
          url: '/myaccount/change-password',
          active: false,
        },
      ];
    } else {
      this.sidebarMenus = [
        {
          title: 'General',
          url: '/myaccount/general',
          active: false,
        },
        {
          title: 'My Classes',
          url: '/myaccount/myclasses/list',
          active: true,
        },
        {
          title: 'Reserve Classes',
          url: '/myaccount/reserve-class/list',
          active: false,
        },
        {
          title: 'Wallet',
          url: '/myaccount/wallet',
          active: false,
        },
        {
          title: 'Privacy Policy',
          url: '/myaccount/privacyPolicy',
          active: false,
        },
        {
          title: 'Change Password',
          url: '/myaccount/change-password',
          active: false,
        }
      ];
    }
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
    console.log(menu, 'menu');
    console.log(i, 'index');
    this.sidebarMenus.forEach((menu: any, index: any) => {
      menu.active = i === index;
      console.log(menu)
    });
    this.router.navigateByUrl(menu.url);
  }

  navigateToGeneral() {
    this.router.navigateByUrl('/myaccount/general');
  }
}
