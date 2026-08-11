import {Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../project/prelogin/login/login.component';
import { AuthService } from '../../shared/services/auth.service';
import { HelperService } from '../../shared/services/helper.service';
import {filter, Subscription} from "rxjs";
import {SseClient} from "ngx-sse-client";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {Dialog} from "@angular/cdk/dialog";

@Component({
  selector: 'app-post-header',
  standalone: true,
  imports: [NgIf, NgForOf, ReactiveFormsModule, CommonModule],
  templateUrl: './post-header.component.html',
})
export class PostHeaderComponent implements OnInit, OnDestroy {
  menus: any = [
    {
      name: 'Home',
      url: '',
      active: true,
    },
    {
      name: 'About Us',
      url: 'aboutus',
      active: false,
    },
    {
      name: 'Our App',
      url: 'ourapp',
      active: false,
    },
    {
      name: 'Contact',
      url: 'contact',
      active: false,
    },
  ];
  public currentUrl = '';
  auth = inject(AuthService);
  subs: Subscription[] = [];
  public teacherStatus = '0';
  public showPopUp = false;
  public userDetails: any;

  dialogPopUp = inject(Dialog);
  @ViewChild('prompt') promptPop!: TemplateRef<any>;

  constructor(private helper: HelperService, private router: Router, private dialog: MatDialog, private sseClient: SseClient) {
    this.router.events.pipe(filter((event) : event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event : NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        this.menus.forEach((items: any) => {
          const menuName = items.name.replace(/\s/g, "");
          items.active = this.currentUrl.toLowerCase().includes(menuName.toLowerCase());
        })
      });
  }

  ngOnInit(): void {
    this.userDetails = JSON.parse(this.auth.getLocalStorage('user'));
    console.log(this.userDetails, 'userDetails');
    if (this.auth.getUserType === '1' && this.auth.teacherVerificationStatus != '1') {
      this.getTeacherStatus();
    }
  }

  ngOnDestroy() {
    this.subs.forEach((item) => {
      item.unsubscribe();
    });
  }

  // i -  get the clicked menu index
  menuNavigation(obj: any, i: any): any {
    this.menus.forEach((a: any, indx: any) => {
      a.active = i === indx;
    });

    this.router.navigateByUrl(obj.url);
  }

  // to open login popup

  onLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '800px',
      height: '680px',
      panelClass: 'my-dialog',
      data: '',
      hasBackdrop: true,
      disableClose: false,
    });
  }

  toTutor() {
    this.router.navigateByUrl('tutor');
  }

  toMyaccount() {
    this.router.navigateByUrl('myaccount/myclasses/list');
  }

  onLogout() {
    this.auth.signOut();
    this.helper.presentToast('Successfully LoggedOut');
  }

  getTeacherStatus() {
    console.log('servuce')
    const url = 'common/notifyTeacherProfileStatus?id=' + this.auth.getUserId().toString();
    this.subs.push(this.sseClient.stream(url, { keepAlive: true, reconnectionDelay: 2000,
      responseType: 'event' }, {body: {}}, 'GET').subscribe((event) => {
      if (event.type === 'error') {
        const errorEvent = event as ErrorEvent;
      } else if (event.type == 'message') {
        const messageEvent = event as MessageEvent;
        const status = JSON.parse(messageEvent.data)?.is_account_verified;
        const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
        const lastStatus = storedData?.status;
        const lastDate = storedData?.date;
        const currentDate = new Date().toDateString();
        console.log(storedData, 'ssss')
        if (status !== lastStatus || lastDate !== currentDate) {
          this.userDetails.is_account_verified = status;
          if (status == '1') {
            this.subs.forEach((item) => {
              item.unsubscribe();
            });
          }
          this.auth.setLocalStorage('user', JSON.stringify(this.userDetails));
          this.showDialog();
          this.auth.setLocalStorage('verificationStatusPopUp',
            JSON.stringify({ status, date: currentDate })
          );
        }
        this.teacherStatus = status;
      }
    }));
  }

  showDialog() {
    this.dialogPopUp.open(this.promptPop, {
      panelClass: 'prompt_class_dialog',
      data: '',
      hasBackdrop: true,
      disableClose: false,
    });
    const currentDate = new Date().toDateString();
    this.auth.setLocalStorage('verificationStatusPopUp',
      JSON.stringify({ status: this.teacherStatus, date: currentDate })
    );
  }

  closePopup() {
    this.dialogPopUp.closeAll();
  }
}
