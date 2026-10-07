import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgForOf, NgFor, CommonModule } from '@angular/common';
import { SessionConstants } from '../../../../shared/services/sessionConstants';
import { AuthService } from '../../../../shared/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HelperService } from '../../../../shared/services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { Urls } from '../../../../shared/services/urls';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    NgSelectComponent
  ],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss',
})
export class WatchlistComponent implements OnInit {
  protected subjectList: any = [];
  protected gradeList: any = [];
  protected curriculumList: any = [];
  protected classListdata: any = [];
  public teacherList: any = [];
  helper = inject(HelperService);
  protected gradeListData: any = [];
  public selectedTeacher: any[] = [];
  public selectedGrade: any[] = [];
  public selectedSubject: any[] = [];
  public subjectOptions: string[] = [];
  public classDetail: any = {};
  public subscriptionPlan = [
    { name: 'Monthly', key: 'monthly_amount', days: '30', plan_id: '2' },
    { name: 'Quarterly', days: '90', key: 'quarterly_amount', plan_id: '3' },
    { name: 'Half Yearly', days: '180', key: 'halfyearly_amount', plan_id: '4' },
    { name: 'Yearly', key: 'yearly_amount', days: '365', plan_id: '5' },
    { name: 'Free Trial', key: 'yearly_amount', days: '60', plan_id: '1' }
  ];
  @ViewChild('showSubscriptionPlan') showSubscriptionPlan!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected auth: AuthService,
    private dialog: MatDialog
  ) {
    const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
    this.gradeListData = config?.grade || [];
    this.subjectList = config?.subjects || [];
    this.gradeList = config?.grade || [];
    this.curriculumList = config?.curriculum || [];
  }

  ngOnInit() {
    this.getTeacherList();
    this.getWatchlist();
  }

  getWatchlist() {
    const payload = {
      user_id: this.auth.getUserId(),
      teacher_id: this.selectedTeacher && this.selectedTeacher.length > 0 ? this.selectedTeacher : [],
      grade: this.selectedGrade && this.selectedGrade.length > 0 ? this.selectedGrade : [],
      subject: this.selectedSubject && this.selectedSubject.length > 0 ? this.selectedSubject : [],
      is_wishlist_only: 1
    };
    this.auth.postService(payload, Urls.reserveClassList).subscribe(
      (successData: any) => {
        if (successData.IsSuccess && Array.isArray(successData.ResponseObject)) {
          let classes = successData.ResponseObject;
          classes = classes.filter(
            (user: any, index: number, self: any[]) =>
              index === self.findIndex((u: any) => u.class_id === user.class_id)
          );

          classes = classes.filter((c: any) => c.is_wishlist == 1 || c.is_wishlist === true);

          const subjects = new Set<string>();
          classes.forEach((classData: any) => {
            if (classData.subject) {
              subjects.add(classData.subject.trim());
            }
            const gradeDetails = this.gradeList.find((grade: any) => grade.id == classData.grade);
            const curriculumDetails = this.curriculumList.find(
              (curriculum: any) => curriculum.id == classData.curriculum_id
            );
            classData.grade_name = gradeDetails ? gradeDetails.displayname : '';
            classData.curriculum_name = curriculumDetails ? curriculumDetails.curriculum_type : '';

            const tId = classData.teacher_id || classData.tutor_id || classData.created_by;
            if (tId && this.teacherList && this.teacherList.length > 0) {
              const matchingTeacher = this.teacherList.find(
                (t: any) => String(t.teacher_id || t.id || t.user_id) === String(tId)
              );
              if (matchingTeacher) {
                if (!classData.teacher_name || classData.teacher_name === 'Teacher') {
                  classData.teacher_name = matchingTeacher.display_name;
                }
                const tImg = matchingTeacher.profile_image || matchingTeacher.profile_picture || matchingTeacher.image;
                if (tImg && !classData.teacher_image) {
                  classData.teacher_image = tImg;
                }
              }
            }
          });

          if (this.subjectOptions.length === 0 && subjects.size > 0) {
            this.subjectOptions = Array.from(subjects);
          }

          if (this.selectedTeacher && this.selectedTeacher.length > 0) {
            classes = classes.filter((c: any) =>
              this.selectedTeacher.some((tId: any) => String(tId) === String(c.teacher_id))
            );
          }
          if (this.selectedGrade && this.selectedGrade.length > 0) {
            classes = classes.filter((c: any) =>
              this.selectedGrade.some((gId: any) => String(gId) === String(c.grade))
            );
          }
          if (this.selectedSubject && this.selectedSubject.length > 0) {
            classes = classes.filter((c: any) =>
              this.selectedSubject.some((s: any) => String(s).toLowerCase() === String(c.subject || '').toLowerCase())
            );
          }

          this.classListdata = classes;
        } else {
          this.classListdata = [];
        }
      },
      (error) => {
        console.error(error);
        this.classListdata = [];
      }
    );
  }

  toggleWishlist(classData: any) {
    const payload = {
      user_id: this.auth.getUserId(),
      class_id: classData.class_id || classData.id
    };
    classData.is_wishlist = false;
    this.classListdata = this.classListdata.filter((item: any) => (item.class_id || item.id) !== (classData.class_id || classData.id));

    this.auth.postService(payload, Urls.toggleWishlist).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          const msg = res.ResponseObject?.message || 'Removed from Watchlist';
          this.helper.presentToast(msg);
        } else {
          this.getWatchlist();
        }
      },
      error: (err) => {
        console.error(err);
        this.getWatchlist();
      }
    });
  }

  subscribeNow(classDetail: any) {
    this.classDetail = classDetail;
    this.dialog.open(this.showSubscriptionPlan, {
      panelClass: 'subscription_class_dialog',
      data: 'Edit',
      hasBackdrop: true,
      disableClose: true
    });
  }

  getTeacherList() {
    this.auth.postService({}, Urls.teacherList).subscribe((data: any) => {
      if (data && data.IsSuccess && Array.isArray(data.ResponseObject)) {
        this.teacherList = data.ResponseObject;
      }
    });
  }

  closePopup() {
    this.dialog.closeAll();
  }

  resetFilters() {
    this.selectedTeacher = [];
    this.selectedGrade = [];
    this.selectedSubject = [];
    this.getWatchlist();
  }

  getSubjectTheme(index: number) {
    const themes = [
      { bg: '#fff0e6', color: '#ff7f00' },
      { bg: '#f3e8ff', color: '#9333ea' },
      { bg: '#e6f4ea', color: '#16a34a' },
      { bg: '#e0f2fe', color: '#0284c7' },
      { bg: '#fef3c7', color: '#d97706' }
    ];
    return themes[index % themes.length];
  }

  getTeacherImage(classData: any, index: number = 0): string {
    const defaultAvatars = [
      'app/assets/etutor/home_page/tutor_avatar1.svg',
      'app/assets/etutor/home_page/tutor_avatar2.svg',
      'app/assets/etutor/home_page/tutor_avatar3.svg',
      'app/assets/etutor/home_page/tutor_avatar4.svg',
      'app/assets/etutor/home_page/tutor_avatar5.svg'
    ];
    if (classData && classData.teacher_image) return classData.teacher_image;
    return defaultAvatars[index % defaultAvatars.length];
  }

  getTeacherName(classData: any): string {
    if (classData && classData.teacher_name && classData.teacher_name !== 'Teacher') {
      return classData.teacher_name;
    }
    return 'Teacher';
  }

  handleImgError(event: any, index: number = 0) {
    const defaultAvatars = [
      'app/assets/etutor/home_page/tutor_avatar1.svg',
      'app/assets/etutor/home_page/tutor_avatar2.svg',
      'app/assets/etutor/home_page/tutor_avatar3.svg',
      'app/assets/etutor/home_page/tutor_avatar4.svg',
      'app/assets/etutor/home_page/tutor_avatar5.svg'
    ];
    event.target.src = defaultAvatars[index % defaultAvatars.length];
  }

  userSubscription(value: any) {
    const payload = {
      plan_id: value.plan_id,
      class_id: this.classDetail.class_id || this.classDetail.id,
      user_id: this.auth.getUserId(),
      status: '1'
    };
    this.auth.postService(payload, Urls.addStudentToClass).subscribe((sucessData: any) => {
      if (sucessData.IsSuccess) {
        this.helper.presentToast(sucessData.ResponseObject || 'Successfully subscribed to class!');
        this.closePopup();
        this.router.navigate(['/myaccount/myclasses/list']);
      } else {
        this.helper.presentErrorToast(sucessData.ErrorObject);
      }
    });
  }
}
