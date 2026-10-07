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
import {CapitalizePipe} from "../../shared/pipes/capitalize.pipe";
import {Urls} from "../../shared/services/urls";

@Component({
  selector: 'app-post-header',
  standalone: true,
  imports: [NgIf, NgForOf, ReactiveFormsModule, CommonModule, CapitalizePipe],
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
  public hasSubmittedApplication = false;
  public userDetails: any;

  get userName(): string {
    if (!this.auth.isLoggedIn) {
      return 'My Account';
    }

    // Always read fresh user data from localStorage to reflect profile updates
    const user = JSON.parse(this.auth.getLocalStorage('user') || '{}');

    if (!user || Object.keys(user).length === 0) return 'My Account';

    const currentEmail = (user.email || this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    let first = (user.first_name || user.given_name || '').trim();
    let last = (user.last_name || user.family_name || '').trim();

    const firstLower = first.toLowerCase();
    const lastLower = last.toLowerCase();

    const isDummyJohnson = ((firstLower === 'johnson' || lastLower === 'gm') && currentEmail !== 'johnson@example.com');
    const isDummyJohnV = (firstLower === 'john' && lastLower === 'v' && currentEmail !== 'john@example.com');

    if (isDummyJohnson || isDummyJohnV) {
      if (currentEmail) return currentEmail.split('@')[0];
      return 'My Account';
    }

    if (!first && !last) {
      if (user.name || user.full_name || user.user_name) {
        const full = (user.name || user.full_name || user.user_name).trim();
        const fullLower = full.toLowerCase();
        if ((fullLower.includes('johnson') || fullLower === 'john v') && currentEmail !== 'johnson@example.com' && currentEmail !== 'john@example.com') {
          if (currentEmail) return currentEmail.split('@')[0];
          return 'My Account';
        }
        return full;
      }
      if (currentEmail) {
        return currentEmail.split('@')[0];
      }
      return 'My Account';
    }

    return `${first} ${last}`.trim();
  }

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
    if (!this.auth.isLoggedIn) {
      this.userDetails = null;
      return;
    }
    this.userDetails = JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const currentEmail = (this.userDetails?.email || this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    if (this.userDetails && currentEmail !== 'johnson@example.com' && currentEmail !== 'john@example.com') {
      const f = (this.userDetails.first_name || '').toLowerCase();
      const l = (this.userDetails.last_name || '').toLowerCase();
      if (f === 'johnson' || l === 'gm' || (f === 'john' && l === 'v')) {
        delete this.userDetails.first_name;
        delete this.userDetails.last_name;
        this.auth.setLocalStorage('user', JSON.stringify(this.userDetails));
      }
    }
    this.fetchUserProfileFromApi();
    if (this.auth.isTeacherUser || String(this.auth.getRoleId()) === '2') {
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
    this.closePopup();
    const verified = this.isAccountVerified || this.auth.isTeacherVerified || this.teacherStatus === '1';
    if (this.auth.isTeacherUser && verified) {
      this.router.navigateByUrl('myaccount/general');
      return;
    }
    this.router.navigateByUrl('tutor');
  }

  toMyaccount() {
    const verified = this.isAccountVerified || this.auth.isTeacherVerified || this.teacherStatus === '1';
    if (this.auth.isTeacherUser && !verified) {
      this.helper.presentErrorToast('Your application is under review. Access to dashboard will be enabled once Admin approves your account.');
      this.router.navigateByUrl('tutor');
      return;
    }
    this.router.navigateByUrl('myaccount/general');
  }

  toWishlist() {
    this.router.navigateByUrl('myaccount/reserve-class/list');
  }

  onLogout() {
    this.auth.signOut();
  }

  get isAccountVerified(): boolean {
    if (this.auth.isStudentUser) {
      return false;
    }
    if (this.teacherStatus === '1' || this.teacherStatus === 'true' || this.auth.teacherVerificationStatus === '1' || this.auth.teacherVerificationStatus === 'true') {
      return true;
    }
    const user = this.userDetails || JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const teacherProfile = JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}');
    const status = user?.is_account_verified ?? user?.is_verified ?? teacherProfile?.is_account_verified ?? teacherProfile?.is_verified;
    return !!(
      status == '1' ||
      status === 1 ||
      status === true ||
      status === 'true' ||
      String(status).toUpperCase() === 'APPROVED' ||
      String(status).toUpperCase() === 'VERIFIED'
    );
  }

  // Returns true ONLY when teacher has submitted the tutor form and is waiting for admin approval
  get isApplicationPending(): boolean {
    if (this.auth.isStudentUser || this.isAccountVerified) {
      return false;
    }
    // Check from API response first
    if (this.hasSubmittedApplication) {
      return true;
    }
    // Fallback: check from localStorage user object
    const user = this.userDetails || JSON.parse(this.auth.getLocalStorage('user') || '{}');
    return !!(user && (
      user.is_document_uploaded == '1' || user.is_document_uploaded === 1 || user.is_document_uploaded === true ||
      user.application_submitted === true || user.is_submitted === true
    ));
  }

  get showBecomeTutor(): boolean {
    // If account is verified, do not show Become Tutor button
    if (this.isAccountVerified || this.auth.isTeacherVerified) {
      return false;
    }
    // If teacher has already submitted application and waiting for approval, hide Become Tutor button
    if (this.isApplicationPending) {
      return false;
    }
    return true;
  }

  fetchUserProfileFromApi() {
    const currentUserId = String(this.auth.getUserId() || '').trim();
    const localUser = this.userDetails && Object.keys(this.userDetails).length > 0
      ? this.userDetails
      : JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const userEmail = (localUser?.email || '').toLowerCase().trim();
    const userMobile = String(localUser?.mobile_number || '').trim();

    if (!currentUserId && !userEmail) return;

    const isTeacherUser = this.auth.isTeacherUser;
    const url = isTeacherUser ? Urls.teacherProfile : Urls.studentProfile;
    const payload = isTeacherUser
      ? { filter_by: 'teacher', filter_value: currentUserId, user_id: currentUserId, email: userEmail }
      : { user_id: currentUserId, student_id: currentUserId, email: userEmail };

    this.auth.postService(payload, url).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && res.ResponseObject) {
          let fetchedData: any = null;

          if (Array.isArray(res.ResponseObject)) {
            fetchedData = res.ResponseObject.find((item: any) => {
              const itemUserId = item.user_id || item.id || item.teacher_id || item.student_id ? String(item.user_id || item.id || item.teacher_id || item.student_id).trim() : '';
              const itemEmail = item.email ? String(item.email).toLowerCase().trim() : '';
              const itemMobile = item.mobile_number ? String(item.mobile_number).trim() : '';

              if (currentUserId && currentUserId !== 'null' && itemUserId && itemUserId === currentUserId) {
                return true;
              }
              if (userEmail && itemEmail && itemEmail === userEmail) {
                return true;
              }
              if (userMobile && itemMobile && itemMobile === userMobile) {
                return true;
              }
              return false;
            });
          } else if (typeof res.ResponseObject === 'object') {
            fetchedData = res.ResponseObject;
          }

          if (fetchedData) {
            const updatedUser = { ...localUser, ...fetchedData };
            // Preserve verified status if already approved
            if (this.teacherStatus === '1' || this.teacherStatus === 'true' || localUser.is_account_verified == '1' || localUser.is_account_verified === 'true') {
              updatedUser.is_account_verified = '1';
            }
            // Clear legacy dummy placeholder if profile returns valid name
            if (updatedUser.first_name === 'JOHN' && updatedUser.last_name === 'V' && userEmail !== 'john@example.com') {
              if (fetchedData.first_name && fetchedData.first_name !== 'JOHN') {
                updatedUser.first_name = fetchedData.first_name;
              }
              if (fetchedData.last_name && fetchedData.last_name !== 'V') {
                updatedUser.last_name = fetchedData.last_name;
              }
            }
            this.auth.setLocalStorage('user', JSON.stringify(updatedUser));
            this.userDetails = updatedUser;
          }
          // Note: Do NOT auto-signout when fetchedData is null here.
          // A newly registered teacher may not appear in getTeacherList yet.
        }
      },
      error: (err: any) => console.error(err, 'error fetching user profile for header')
    });
  }

  getTeacherStatus() {
    const userObj = this.userDetails && Object.keys(this.userDetails).length > 0
      ? this.userDetails
      : JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const userEmail = (userObj?.email || this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    const userId = this.auth.getUserId() || userObj?.id || userObj?.user_id || userObj?.teacher_id;
    if (!userId && !userEmail) return;

    const payload = {
      id: userId ? userId.toString() : '',
      user_id: userId,
      email: userEmail
    };
    const url = 'common/notifyTeacherProfileStatus?id=' + (userId ? userId.toString() : '');
    
    // Direct HTTP fetch fallback
    this.auth.postService(payload, url).subscribe({
      next: (res: any) => {
        if (res.IsSuccess && res.ResponseObject) {
          const status = String(res.ResponseObject.is_account_verified ?? '0');
          this.teacherStatus = status;
          this.rejectionNotes = res.ResponseObject.rejection_notes ?? '';
          this.hasSubmittedApplication = res.ResponseObject.is_document_uploaded == '1' || res.ResponseObject.is_document_uploaded == 1;

          const currentUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          if (currentUser && Object.keys(currentUser).length > 0) {
            currentUser.is_account_verified = status;
            if (res.ResponseObject.first_name && (!currentUser.first_name || (currentUser.first_name === 'JOHN' && currentUser.last_name === 'V'))) {
              currentUser.first_name = res.ResponseObject.first_name;
            }
            if (res.ResponseObject.last_name && (!currentUser.last_name || (currentUser.first_name === 'JOHN' && currentUser.last_name === 'V'))) {
              currentUser.last_name = res.ResponseObject.last_name;
            }
            this.auth.setLocalStorage('user', JSON.stringify(currentUser));
            this.userDetails = currentUser;
          }

          const teacherProfile = JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}');
          if (teacherProfile && Object.keys(teacherProfile).length > 0) {
            teacherProfile.is_account_verified = status;
            this.auth.setLocalStorage('teacherProfile', JSON.stringify(teacherProfile));
          }

          if (status === '1' || status === 'true') {
            if (this.currentUrl.includes('tutor')) {
              this.router.navigateByUrl('myaccount/general');
            }
          } else if (this.teacherStatus === '2') {
            // Only show popup for rejected status (action required)
            const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
            const currentDate = new Date().toDateString();
            if (storedData?.status !== this.teacherStatus || storedData?.date !== currentDate) {
              this.showDialog();
            }
          } else if (this.teacherStatus === '0') {
            // Only show pending popup if teacher has already submitted their application
            const hasSubmitted = res.ResponseObject.is_document_uploaded == '1' || res.ResponseObject.is_document_uploaded == 1;
            if (hasSubmitted) {
              const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
              const currentDate = new Date().toDateString();
              if (storedData?.status !== this.teacherStatus || storedData?.date !== currentDate) {
                this.showDialog();
              }
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
            const status = String(data?.is_account_verified ?? '0');
            const notes = data?.rejection_notes || '';
            const storedData = JSON.parse(this.auth.getLocalStorage('verificationStatusPopUp') || '{}');
            const lastStatus = storedData?.status;
            const lastDate = storedData?.date;
            const currentDate = new Date().toDateString();
            
            this.rejectionNotes = notes;
            this.teacherStatus = status;

            if (this.userDetails) {
              this.userDetails.is_account_verified = status;
              this.auth.setLocalStorage('user', JSON.stringify(this.userDetails));
            }

            // Do not display verified banner popup
            if (status === '1') {
              streamSub.unsubscribe();
              return;
            }

            if (status !== lastStatus || lastDate !== currentDate) {
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
