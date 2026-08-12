import { Component, inject, OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { NgIf, NgForOf, NgFor, CommonModule } from '@angular/common';
import { SessionConstants } from '../../../../shared/services/sessionConstants';
import { AuthService } from '../../../../shared/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { HelperService } from '../../../../shared/services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { Urls } from '../../../../shared/services/urls';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import {Router} from "@angular/router";
import {NgSelectComponent} from "@ng-select/ng-select";

@Component({
  selector: 'app-reserve-class-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    NgFor,
    NgxMaterialTimepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    NgSelectComponent
  ],
  templateUrl: './reserve-class-list.component.html',
  styleUrl: './reserve-class-list.component.scss',
})
export class ReserveClassListComponent implements OnInit {
  protected subjectList: any = [];
  protected gradeList: any = [];
  protected curriculumList: any = [];
  protected classListdata: any = [];
  public teacherList: any = [];
  helper = inject(HelperService);
  protected type = '';
  protected gradeListData: any = [];
  public selectedTeacher: any[] = [];
  public selectedGrade: any[] = [];
  public selectedSubject: any[] = [];
  public subjectOptions: string[] = [];
  public classDetail: any = {};
  public subscriptionPlan = [{name: 'Monthly', key: 'monthly_amount', days: '30', plan_id: '2'}, {name: 'Quarterly', days: '90', key: 'quarterly_amount', plan_id: '3'},
    {name: 'Half Yearly', days: '180', key: 'halfyearly_amount', plan_id: '4'}, {name: 'Yearly', key: 'yearly_amount', days: '365', plan_id: '5'}
    , {name: 'Free Trial', key: 'yearly_amount', days: '60', plan_id: '1'}]
  @ViewChild('addOrUpdateClass') modalContent!: TemplateRef<any>;
  @ViewChild('showSubscriptionPlan') showSubscriptionPlan!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private router: Router, protected auth: AuthService, private dialog: MatDialog) {
    const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
    this.gradeListData = config?.grade || [];
    this.subjectList = config?.subjects || [];
    this.gradeList = config?.grade || [];
    this.curriculumList = config?.curriculum || [];
  }

  ngOnInit() {
    this.getTeacherList();
    this.reserveClassList();
  }

  reserveClassList() {
    const payload = {
      user_id: this.auth.getUserId(),
      teacher_id: this.selectedTeacher && this.selectedTeacher.length > 0 ? this.selectedTeacher : [],
      grade: this.selectedGrade && this.selectedGrade.length > 0 ? this.selectedGrade : [],
      subject: this.selectedSubject && this.selectedSubject.length > 0 ? this.selectedSubject : []
    };
    console.log(payload, 'reserveClassList payload');
    this.auth.postService(payload, Urls.reserveClassList).subscribe(
      (successData: any) => {
        if (successData.IsSuccess && Array.isArray(successData.ResponseObject)) {
          let classes = successData.ResponseObject;
          
          classes = classes.filter(
            (user: any, index: number, self: any[]) =>
              index === self.findIndex((u: any) => u.class_id === user.class_id)
          );

          // Populate subject options dynamically from available classes
          const subjects = new Set<string>();
          classes.forEach((classData: any) => {
            if (classData.subject) {
              subjects.add(classData.subject.trim());
            }
            const gradeDetails = this.gradeList.find(
              (grade: any) => grade.id == classData.grade
            );
            const curriculumDetails = this.curriculumList.find(
              (curriculum: any) => curriculum.id == classData.curriculum_id
            );
            const fullNameOfDays = (classData.days || '').split(',');
            let fullDays: any = [];
            fullNameOfDays.forEach((days: string) => {
              fullDays.push(days == 'Mon' ? 'Monday' : days == 'Tue' ? 'Tuesday' : days == 'Wed' ? 'Wednesday'
                  : days == 'Thu' ? 'Thursday' : days == 'Fri' ? 'Friday' : days == 'Sat' ? 'Saturday' : 'Sunday');
            });
            classData.grade_name = gradeDetails ? gradeDetails.displayname : '';
            classData.curriculum_name = curriculumDetails
              ? curriculumDetails.curriculum_type
              : '';
          });

          if (this.subjectOptions.length === 0 && subjects.size > 0) {
            this.subjectOptions = Array.from(subjects);
          }

          // Client-side filtering fallback
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
          if (!successData.IsSuccess) {
            this.helper.presentErrorToast(successData.ErrorObject);
          }
          this.classListdata = [];
        }
        console.log(this.classListdata, 'classListdata');
      },
      (error) => console.error(error, 'error')
    );
  }

  subscribeNow(classDetail: any) {
    this.classDetail = classDetail;
    console.log(this.classDetail, 'classDetail');
    this.dialog.open(this.showSubscriptionPlan, {

      panelClass: 'subscription_class_dialog',
      data: 'Edit',
      hasBackdrop: true,
      disableClose: true
    })
  }

  getTeacherList() {
    const teacherListpayload = {
      filter_by_city: [],
      filter_by_language: [],
      filter_by_subject: [],
      filter_by_gender: [],
      filter_by_curriculum: [],
      filter_by_grade: [],
    };
    this.auth.postService(teacherListpayload, Urls.teacherListFilter).subscribe(
      (successData: any) => {
        console.log(successData, 'teacherList');
        if (successData && successData.IsSuccess && Array.isArray(successData.ResponseObject) && successData.ResponseObject.length > 0) {
          this.teacherListSuccess(successData);
        } else {
          // Fallback to getTeacherList
          this.auth.postService({}, Urls.teacherList).subscribe((fallbackData: any) => {
            this.teacherListSuccess(fallbackData);
          });
        }
      },
      (error) => {
        console.error(error, 'error_teacherList');
        this.auth.postService({}, Urls.teacherList).subscribe((fallbackData: any) => {
          this.teacherListSuccess(fallbackData);
        });
      }
    );
  }

  teacherListSuccess(successData: any = {}) {
    let teachers = successData.IsSuccess && Array.isArray(successData.ResponseObject)
      ? successData.ResponseObject.filter(
        (user: any, index: number, self: any[]) =>
          index === self.findIndex((u: any) => (u.teacher_id || u.id) === (user.teacher_id || user.id))
      )
      : [];
    teachers.forEach((teacher: any) => {
      const fn = (teacher.first_name || '').trim();
      const ln = (teacher.last_name || '').trim();
      const fullName = (fn + ' ' + ln).trim();
      teacher.teacher_id = teacher.teacher_id || teacher.id;
      teacher.display_name = fullName.length > 0 ? fullName : (teacher.email || 'Teacher #' + teacher.teacher_id);
    });
    this.teacherList = teachers;
    console.log(this.teacherList, 'teacherList');
  }

  closePopup() {
    this.dialog.closeAll();
  }

  userSubscription(value: any) {
    const payload = {
      plan_id: value.plan_id,
      class_id: this.classDetail.class_id || this.classDetail.id,
      user_id: this.auth.getUserId(),
      status: '1'
    };
    this.auth.postService(payload, Urls.addStudentToClass).subscribe((sucessData: any) => {
      console.log(sucessData, 'userSubscription success');
      if (sucessData.IsSuccess) {
        this.helper.presentToast(sucessData.ResponseObject || 'Successfully subscribed to class!');
        this.closePopup();
        this.router.navigate(['/myaccount/myclasses/list']);
      } else {
        this.helper.presentErrorToast(sucessData.ErrorObject);
      }
    }, (error) => console.error(error, 'error_subscription'));
  }
}
