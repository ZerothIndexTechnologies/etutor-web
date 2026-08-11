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
  public selectedTeacher = [];
  public selectedGrade = [];
  public classDetail: any = {};
  public subscriptionPlan = [{name: 'Monthly', key: 'monthly_amount', days: '30', plan_id: '2'}, {name: 'Quarterly', days: '90', key: 'quarterly_amount', plan_id: '3'},
    {name: 'Half Yearly', days: '180', key: 'halfyearly_amount', plan_id: '4'}, {name: 'Yearly', key: 'yearly_amount', days: '365', plan_id: '5'}
    , {name: 'Free Trial', key: 'yearly_amount', days: '60', plan_id: '1'}]
  @ViewChild('addOrUpdateClass') modalContent!: TemplateRef<any>;
  @ViewChild('showSubscriptionPlan') showSubscriptionPlan!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private router: Router, protected auth: AuthService, private dialog: MatDialog) {
    this.gradeListData = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).grade;
    this.subjectList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).subjects;
    this.gradeList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).grade;
    this.curriculumList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).curriculum;
  }

  ngOnInit() {
    this.getTeacherList();
    this.reserveClassList();
  }

  reserveClassList() {
    const payload = {
      teacher_id: this.selectedTeacher,
      grade: this.selectedGrade
    }
    console.log(payload)
    this.auth.postService(payload, Urls.reserveClassList).subscribe(
      (successData: any) => {
        if (successData.IsSuccess) {
          this.classListdata = successData.IsSuccess
            ? successData.ResponseObject.filter(
              (user: any, index: number, self: any[]) =>
                index === self.findIndex((u: any) => u.class_id === user.class_id)
            )
            : [];
          successData.ResponseObject.forEach((classData: any) => {
            const gradeDetails = this.gradeList.find(
              (grade: any) => grade.id == classData.grade
            );
            const curriculumDetails = this.curriculumList.find(
              (curriculum: any) => curriculum.id == classData.curriculum_id
            );
            const fullNameOfDays = classData.days.split(',');
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
        } else {
          this.helper.presentErrorToast(successData.ErrorObject);
        }
        this.classListdata = successData.IsSuccess ? successData.ResponseObject : [];
        this.classListdata = successData.IsSuccess
          ? successData.ResponseObject.filter(
            (user: any, index: number, self: any[]) =>
              index === self.findIndex((u: any) => u.class_id === user.class_id)
          )
          : [];
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
        this.teacherListSuccess(successData);
      },
      (error) => {
        console.error(error, 'error_teacherList');
      }
    );
  }

  teacherListSuccess(successData: any = {}) {
    this.teacherList = successData.IsSuccess
      ? successData.ResponseObject.filter(
        (user: any, index: number, self: any[]) =>
          index === self.findIndex((u: any) => u.teacher_id === user.teacher_id)
      )
      : [];
    this.teacherList.forEach((teacher: any) => {
      teacher.display_name = teacher.first_name + ' ' + teacher.last_name;
    })
    console.log(this.teacherList, 'teacherList');
  }

  closePopup() {
    this.dialog.closeAll();
  }

  userSubscription(value: any) {
    const payload = {
      plan_id: value.plan_id,
      class_id: this.classDetail.class_id,
      status: '1'
    }
    this.auth.postService(payload, Urls.addStudentToClass).subscribe((sucessData: any) =>{
      console.log(sucessData, 'ssss')
      if (sucessData.IsSuccess) {
        this.helper.presentToast(sucessData.ResponseObject);
        this.closePopup();
        this.router.navigate(['/myaccount/myclasses/list'])
      } else {
        this.helper.presentErrorToast(sucessData.ErrorObject);
      }
    }, (error) => console.error(error, 'error_suc'))
  }
}
