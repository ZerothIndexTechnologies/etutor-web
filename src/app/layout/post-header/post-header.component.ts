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
  public rejectionNotes = '';
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
    this.userDetails = JSON.parse(this.auth.getLocalStorage('user') || '{}');
    console.log(this.userDetails, 'userDetails');
    if (this.auth.getRoleId() === '2') {
      this.getTeacherStatus();
    }
    if (this.auth.isStudentUser) {
      if (!this.menus.some((m: any) => m.name === 'Watchlist')) {
        this.menus.push({
          name: 'Watchlist',
          url: 'myaccount/reserve-class/list',
          active: false,
        });
      }
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
    this.closePopup();
    this.router.navigateByUrl('tutor');
  }

  toMyaccount() {
    this.router.navigateByUrl('myaccount/myclasses/list');
  }

  toWishlist() {
    this.router.navigateByUrl('myaccount/reserve-class/list');
  }

  onLogout() {
    this.auth.signOut();
    this.helper.presentToast('Successfully LoggedOut');
  }

  getTeacherStatus() {
    if (!this.auth.getUserId()) return;
    const url = 'common/notifyTeacherProfileStatus?id=' + this.auth.getUserId().toString();
    
    // Direct HTTP fetch fallback
    this.auth.postService({}, url).subscribe({
      next: (res: any) => {
        if (res.IsSuccess && res.ResponseObject) {
          this.teacherStatus = res.ResponseObject.is_account_verified ?? '0';
          this.rejectionNotes = res.ResponseObject.rejection_notes ?? '';
          if (this.teacherStatus === '2' || this.teacherStatus === '0') {
            const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
            const currentDate = new Date().toDateString();
            if (storedData?.status !== this.teacherStatus || storedData?.date !== currentDate) {
              this.showDialog();
            }
          }
        }
      },
      error: (err: any) => console.error(err, 'error fetching teacher status')
    });

    const streamSub = this.sseClient.stream(url, { keepAlive: false, reconnectionDelay: 30000,
      responseType: 'event' }, {body: {}}, 'GET').subscribe({
      next: (event) => {
        if (event.type === 'error') {
          streamSub.unsubscribe();
        } else if (event.type == 'message') {
          const messageEvent = event as MessageEvent;
          try {
            const data = JSON.parse(messageEvent.data);
            const status = data?.is_account_verified;
            const notes = data?.rejection_notes || '';
            const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
            const lastStatus = storedData?.status;
            const lastDate = storedData?.date;
            const currentDate = new Date().toDateString();
            
            this.rejectionNotes = notes;
            this.teacherStatus = status;

            if (status !== lastStatus || lastDate !== currentDate) {
              if (this.userDetails) {
                this.userDetails.is_account_verified = status;
                this.auth.setLocalStorage('user', JSON.stringify(this.userDetails));
              }
              if (status == '1') {
                streamSub.unsubscribe();
              }
              this.showDialog();
              this.auth.setLocalStorage('verificationStatusPopUp',
                JSON.stringify({ status, date: currentDate })
              );
            }
          } catch (e) {
            streamSub.unsubscribe();
          }
        }
      },
      error: () => {
        streamSub.unsubscribe();
      }
    });
    this.subs.push(streamSub);
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
