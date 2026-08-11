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

@Component({
  selector: 'app-class-list',
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
    MatCardFooter
  ],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss',
})
export class ClassListComponent implements OnInit {
  protected subjectList: any = [];
  protected gradeList: any = [];
  protected curriculumList: any = [];
  protected classListdata: any = [];
  protected classData: any = {};
  helper = inject(HelperService);
  protected type = '';
  public meetingLinkValue = '';
  @ViewChild('addOrUpdateClass') modalContent!: TemplateRef<any>;
  @ViewChild('deleteClassConfirmation') deleteClassConfirmation!: TemplateRef<any>;
  @ViewChild('meetingLink') meetingLink!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private router: Router, protected auth: AuthService, private dialog: MatDialog) {
    this.subjectList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).subjects;
    this.gradeList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).grade;
    this.curriculumList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).curriculum;
  }

  ngOnInit() {
    this.classList();
  }

  editClass(classDetail: any) {
    console.log(classDetail, 'classDetaos');
    this.auth.setLocalStorage('editClass', JSON.stringify(classDetail));
    this.router.navigate(['myaccount/myclasses/create-class/moreSession']);
  }

  updateMeetingLink(classDetail: any) {
    this.classData = classDetail;
    const meeting_link = classDetail.meeting_link ?? '';
    this.meetingLinkValue = meeting_link != '' ? (meeting_link.includes('https') ? meeting_link : meeting_link.includes('http') ?
      meeting_link.replace(/^http:\/\//, 'https://') : 'https://' + meeting_link) : '';
    console.log(this.meetingLinkValue, 'meetingLinkValue');
    this.dialog.open(this.meetingLink, {panelClass: 'preview_class_dialog', width: '800px',
      hasBackdrop: true, disableClose: true})
  }

  deleteClass(classDetail: any) {
    this.type = 'Delete';
    this.classData = classDetail;
    console.log(this.classData, 'classData');
    this.dialog.open(this.deleteClassConfirmation, {
      panelClass: 'preview_class_dialog',
      data: 'Edit',
      hasBackdrop: true,
      disableClose: true
    });
  }

  addClass() {
    this.router.navigate(['myaccount/myclasses/create-class/add']);
  }

  joinNow(classData: any) {
    if(classData.meeting_link) {
        window.open(classData.meeting_link, '_blank')
    } else {
      this.helper.presentErrorToast('The meeting link for this class is not updated for this class.');
    }
  }

  classList() {
    const payload  = {
      grade: [],
      teacher_id: []
    }
    this.auth.postService(payload, Urls.classList).subscribe(
      (successData: any) => {
        if (successData.IsSuccess) {
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
              fullDays.push(
                days == 'Mon' ? 'Monday' : days == 'Tue' ? 'Tuesday' : days == 'Wed' ? 'Wednesday' : days == 'Thu'
                  ? 'Thursday' : days == 'Fri' ? 'Friday' : days == 'Sat' ? 'Saturday' : 'Sunday');
            });
            classData.grade_name = gradeDetails ? gradeDetails.displayname : '';
            classData.curriculum_name = curriculumDetails
              ? curriculumDetails.curriculum_type
              : '';
          });
        } else {
          this.helper.presentErrorToast(successData.ErrorObject);
        }
        this.classListdata = successData.IsSuccess
          ? successData.ResponseObject
          : [];
        console.log(this.classListdata, 'classListdata');
      },
      (error) => console.error(error, 'error')
    );
  }

  closePopup() {
    this.dialog.closeAll();
  }

  deleteClassService() {
    const payload = {
      class_id: this.classData.class_id
    }
    this.auth.postService(payload, Urls.deleteClass).subscribe((successData: any) => {
      if (successData.IsSuccess) {
        this.helper.presentToast(successData.ResponseObject);
        this.closePopup();
        this.classList();
      } else {
        this.helper.presentErrorToast(successData.ErrorObject);
      }
    }, (error) => console.error(error, 'class_delete'))
  }

  updateClassMeetingLink() {
    if (this.meetingLinkValue != '') {
      const meeting_link = this.meetingLinkValue.includes('https') ? this.meetingLinkValue : this.meetingLinkValue.includes('http') ?
        this.meetingLinkValue.replace(/^http:\/\//, 'https://') : 'https://' + this.meetingLinkValue;
      const payload = {
        meeting_link,
        class_id: this.classData.class_id
      }
      this.auth.postService(payload, Urls.updateMettingLink).subscribe((successData: any) => {
        if (successData.IsSuccess) {
          this.helper.presentToast(successData.ResponseObject);
          this.closePopup();
          this.classList();
        } else {
          this.helper.presentErrorToast(successData.ErrorObject);
        }
      }, (error) => console.error(error, 'error_mettingLink'))
    } else {
      this.helper.presentErrorToast('Meeting Link should not be empty');
    }
  }
}

// export interface Day {
//   id: number;
//   value: string;
//   selected: boolean;
// }
//
// export interface ClassSchedule {
//   subject: string;
//   curriculum: string;
//   grade: string;
//   start_time: string;
//   end_time: string;
//   days: Day[];
//   sessionAmount: string;
// }

//
// validateClassSchedule(newClass: ClassSchedule, existingClasses: ClassSchedule[]): boolean {
//
//   const convertTo24HourFormat = (timeStr: string): number => {
//     const [time, period] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
//
//     if (period === 'PM' && hours !== 12) {
//       hours += 12;
//     } else if (period === 'AM' && hours === 12) {
//       hours = 0;
//     }
//     return hours * 60 + minutes;
//   };
//   const newClassStartTime = convertTo24HourFormat(newClass.start_time);
//   const newClassEndTime = convertTo24HourFormat(newClass.end_time);
//   console.log(newClassStartTime, newClassEndTime, 'newClassTime');
//
//   for (const existingClass of existingClasses) {
//     const existingClassStartTime = convertTo24HourFormat(existingClass.start_time);
//     const existingClassEndTime = convertTo24HourFormat(existingClass.end_time);
//
//     const overlappingDays = newClass.days.some((day: any) =>
//       day.selected && existingClass.days.some((existingDay: any) => existingDay.selected && existingDay.value === day.value)
//     );
//
//     if (overlappingDays) {
//       if (
//         (newClassStartTime >= existingClassStartTime && newClassStartTime < existingClassEndTime) ||
//         (newClassEndTime > existingClassStartTime && newClassEndTime <= existingClassEndTime) ||
//         (newClassStartTime <= existingClassStartTime && newClassEndTime >= existingClassEndTime)
//       ) {
//         return false;
//       }
//     }
//   }
//   return true;
// }
//
// validateClasses(calledFrom = '') {
//   if (this.areClassDetailsValid()) {
//     const rawClass = JSON.stringify(this.getClassDetailsValues());
//     const classValue = JSON.parse(rawClass);
//     const newClassIndex = classValue.length;
//     const newClass = classValue[newClassIndex - 1];
//     let existingClass = []
//     if (this.getClassDetailsValues().length > 1) {
//       const spliceNewClass = JSON.parse(rawClass);
//       spliceNewClass.splice(newClassIndex - 1, 1);
//       existingClass = spliceNewClass;
//     } else {
//       existingClass = []
//     }
//     const isValid = this.validateClassSchedule(newClass, existingClass);
//     if (isValid) {
//       if (calledFrom != '') {
//         this.submitClass();
//       } else {
//         this.buttonList.push({class_collapsed: false});
//         this.classDetails.push(this.createNewClassForm());
//       }
//     } else {
//       this.helper.presentErrorToast('Class times overlap with an existing class.');
//     }
//   } else {
//     this.helper.presentErrorToast('Kindly fill all the field with valid value');
//     this.customValidater.validateAllFormFields(this.classForm);
//   }
// }
