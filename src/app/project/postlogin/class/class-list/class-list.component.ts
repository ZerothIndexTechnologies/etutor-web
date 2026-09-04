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
import { LiveClassroomModalComponent } from '../../../../shared/live-classroom-modal/live-classroom-modal.component';

import { TimezoneService } from '../../../../shared/services/timezone.service';

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
    MatCardFooter,
    LiveClassroomModalComponent
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
  timezoneService = inject(TimezoneService);
  public displayTimezone: string = this.timezoneService.getUserTimezone();
  public timezoneList = this.timezoneService.TIMEZONES;

  protected type = '';
  public meetingLinkValue = '';

  public isLiveClassOpen: boolean = false;
  public activeRoomName: string = '';
  public activeRoomTitle: string = '';
  public currentUserName: string = 'User';

  @ViewChild('addOrUpdateClass') modalContent!: TemplateRef<any>;
  @ViewChild('deleteClassConfirmation') deleteClassConfirmation!: TemplateRef<any>;
  @ViewChild('meetingLink') meetingLink!: TemplateRef<any>;

  getFormattedTime(timeStr: string): string {
    return this.timezoneService.convertUtcToDisplay(timeStr, this.displayTimezone);
  }

  constructor(private fb: FormBuilder, private router: Router, protected auth: AuthService, private dialog: MatDialog) {
    try {
      const configStr = this.auth.getLocalStorage(SessionConstants.configData);
      const config = configStr ? JSON.parse(configStr) : null;
      this.subjectList = config?.subjects || [];
      this.gradeList = config?.grade || [];
      this.curriculumList = config?.curriculum || [];
    } catch (e) {
      this.subjectList = [];
      this.gradeList = [];
      this.curriculumList = [];
    }
  }

  public attendanceHistoryList: any[] = [];
  public activeTab: string = 'classes';
  public verificationStatus: string = '0';
  public rejectionNotes: string = '';

  loadAttendanceHistory(): void {
    const payload = { student_id: this.auth.getUserId() };
    this.auth.postService<any>(payload, Urls.getAttendanceHistory).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.attendanceHistoryList = res.ResponseObject;
        } else {
          this.attendanceHistoryList = [];
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  ngOnInit() {
    this.classList();
    if (this.auth.isTeacherUser) {
      this.loadTeacherVerificationStatus();
    } else {
      this.loadAttendanceHistory();
    }
  }

  loadTeacherVerificationStatus() {
    const url = 'common/notifyTeacherProfileStatus?id=' + this.auth.getUserId();
    this.auth.postService({}, url).subscribe({
      next: (res: any) => {
        if (res.IsSuccess && res.ResponseObject) {
          this.verificationStatus = res.ResponseObject.is_account_verified ?? '0';
          this.rejectionNotes = res.ResponseObject.rejection_notes ?? '';
        }
      },
      error: (err: any) => console.error(err, 'error fetching teacher status in class list')
    });
  }

  send10MinReminder(classDetail: any) {
    if (!classDetail || !classDetail.id) return;
    const payload = { class_id: classDetail.id };
    this.auth.postService(payload, Urls.sendClassReminderEmail || 'teacher/sendClassReminderEmail').subscribe({
      next: (res: any) => {
        if (res.IsSuccess) {
          this.helper.presentToast(res.ResponseObject || '10-minute pre-class alert emails sent!');
        } else {
          this.helper.presentErrorToast(res.ErrorObject || 'Failed to send alert emails');
        }
      },
      error: () => this.helper.presentErrorToast('Error sending 10-minute alert emails')
    });
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

  public activeClassId: number | null = null;

  joinNow(classData: any) {
    this.joinLiveRoom(classData);
  }

  joinLiveRoom(classData: any) {
    const classId = classData.id || classData.class_id;
    if (!classId) {
      this.helper.presentErrorToast('Invalid Class ID.');
      return;
    }

    this.helper.presentToast('Connecting to secure live classroom...');

    this.auth.postService({ class_id: classId }, Urls.joinLiveClass).subscribe({
      next: (response: any) => {
        if (response && response.IsSuccess && response.ResponseObject) {
          const data = response.ResponseObject;
          const jaasUrl = `https://8x8.vc/${data.appId}/${data.cleanRoom || data.roomName}?jwt=${data.jwt}`;
          
          // Open JaaS meeting in a new browser tab
          const newTab = window.open(jaasUrl, '_blank');
          if (!newTab) {
            // Popup blocker fallback
            this.activeClassId = classId;
            this.activeRoomName = data.cleanRoom || data.roomName;
            this.activeRoomTitle = data.title || classData.subject || 'Live Class';
            this.isLiveClassOpen = true;
          }
        } else {
          this.helper.presentErrorToast(response?.ErrorObject || 'Failed to join live class. Please check your subscription.');
        }
      },
      error: (err: any) => {
        const errorMsg = err?.error?.ErrorObject || 'Unable to join live class. Please check your subscription and scheduled start time.';
        this.helper.presentErrorToast(errorMsg);
      }
    });
  }

  parseTimeToDate(dateStr: string, timeStr: string): Date | null {
    if (!timeStr) return null;
    try {
      const today = new Date();
      let d = today;
      if (dateStr && dateStr !== '0000-00-00') {
        const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
        if (!isNaN(parsed.getTime())) d = parsed;
      }

      let hours = 0;
      let minutes = 0;
      const timeUpper = timeStr.trim().toUpperCase();
      const isPM = timeUpper.includes('PM');
      const isAM = timeUpper.includes('AM');

      const cleanTime = timeUpper.replace(/AM|PM/g, '').trim();
      const parts = cleanTime.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0);
    } catch (e) {
      return null;
    }
  }

  canShowLiveRoomButton(classData: any): boolean {
    if (!classData) return false;
    if (classData.status === 'COMPLETED' || classData.status === 'CANCELLED') return false;
    if (classData.status === 'LIVE') return true;

    try {
      const schedDate = classData.scheduled_date || classData.created_date || '';
      const startTimeStr = classData.start_time || '';
      if (!startTimeStr) return false;

      const startDateTime = this.timezoneService.getStartDateTime(schedDate, startTimeStr);
      if (!startDateTime) return false;

      const now = new Date();
      const fifteenMinsBeforeStart = new Date(startDateTime.getTime() - 15 * 60 * 1000);

      let endDateTime: Date | null = null;
      if (classData.end_time) {
        endDateTime = this.timezoneService.getStartDateTime(schedDate, classData.end_time);
      }
      if (!endDateTime) {
        endDateTime = new Date(startDateTime.getTime() + 2 * 3600 * 1000);
      }

      return (now >= fifteenMinsBeforeStart && now <= endDateTime);
    } catch (e) {
      return false;
    }
  }

  endLiveClass(classData: any) {
    const classId = classData.id || classData.class_id;
    if (!classId) return;

    this.auth.postService({ class_id: classId, status: 'COMPLETED' }, Urls.updateLiveClassStatus).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Class ended and marked as COMPLETED.');
          this.classList();
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Failed to end class.');
        }
      },
      error: () => this.helper.presentErrorToast('Error ending class.')
    });
  }

  closeLiveClass() {
    this.isLiveClassOpen = false;
    this.activeClassId = null;
  }

  public studentGradeName: string = '';

  classList() {
    const isStudent = this.auth.getRoleId() == '3';
    let userGradeId: any = null;
    let currentUserId: any = this.auth.getUserId();

    if (isStudent) {
      try {
        const studentDetails = this.auth.getUserDetails();
        if (studentDetails && studentDetails.grade) {
          userGradeId = studentDetails.grade;
        }
      } catch (e) {
        console.warn('Could not parse student details', e);
      }
    }

    const payload = {
      grade: userGradeId ? [userGradeId] : [],
      user_id: currentUserId,
      teacher_id: !isStudent && currentUserId ? [currentUserId] : []
    };

    this.auth.postService(payload, Urls.classList).subscribe(
      (successData: any) => {
        let classes: any[] = [];
        if (successData.IsSuccess && Array.isArray(successData.ResponseObject)) {
          classes = successData.ResponseObject;
          
          classes.forEach((classData: any) => {
            const gradeDetails = this.gradeList.find(
              (grade: any) => grade.id == classData.grade
            );
            const curriculumDetails = this.curriculumList.find(
              (curriculum: any) => curriculum.id == classData.curriculum_id
            );
            const fullNameOfDays = (classData.days || '').split(',');
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

          // Client-side filtering as safeguard
          if (!isStudent && currentUserId) {
            // For Teacher: show classes created by this teacher
            classes = classes.filter((item: any) => item.teacher_id == currentUserId);
          } else if (isStudent) {
            // For Student: show classes matching student's registered grade OR explicitly subscribed classes
            classes = classes.filter((item: any) => (userGradeId && item.grade == userGradeId) || item.is_subscribed == 1);
            if (userGradeId) {
              const matchedGrade = this.gradeList.find((g: any) => g.id == userGradeId);
              if (matchedGrade) {
                this.studentGradeName = matchedGrade.displayname;
              }
            }
          }
        } else if (!successData.IsSuccess) {
          this.helper.presentErrorToast(successData.ErrorObject);
        }

        this.classListdata = classes;
        console.log(this.classListdata, 'classListdata');
      },
      (error) => console.error(error, 'error')
    );
  }

  subscribeLiveClass(classData: any) {
    this.router.navigate(['/subscription'], { queryParams: { class_id: classData.class_id, subject: classData.subject } });
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

  generateJitsiLinkForClassList() {
    const subj = (this.classData.subject || 'Class').replace(/[^a-zA-Z0-9]/g, '_');
    this.meetingLinkValue = `https://meet.jit.si/Etutor_Class_${subj}_${Date.now()}`;
    this.helper.presentToast('Jitsi Live Classroom URL auto-generated!');
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
