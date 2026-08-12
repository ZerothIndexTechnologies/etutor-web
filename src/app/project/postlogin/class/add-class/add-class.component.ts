import {Component, inject, TemplateRef, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Urls} from "../../../../shared/services/urls";
import {AuthService} from "../../../../shared/services/auth.service";
import {HelperService} from "../../../../shared/services/helper.service";
import {CustomValidationService} from "../../../../shared/services/customValidations.service";
import {SessionConstants} from "../../../../shared/services/sessionConstants";
import {Dialog} from "@angular/cdk/dialog";
import {TimezoneService} from "../../../../shared/services/timezone.service";

@Component({
  selector: 'app-add-class',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgxMaterialTimepickerModule,
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './add-class.component.html',
  styleUrl: './add-class.component.scss'
})
export class AddClassComponent {

  public classForm: FormGroup;
  public daysList: any = [];
  public type: any = 'add'
  public auth = inject(AuthService);
  public helper = inject(HelperService);
  public customValidater = inject(CustomValidationService);
  public timezoneService = inject(TimezoneService);
  public selectedTimezone: string = this.timezoneService.getUserTimezone();
  public timezoneList = this.timezoneService.TIMEZONES;

  public subjectList: any = [];
  protected curriculumList: any = [];
  protected gradeList: any = [];
  public oldAvailabilityData: any = [];
  public dialog = inject(Dialog);
  @ViewChild('prompt') promptPop!: TemplateRef<any>;

  constructor(private fb: FormBuilder, public route: ActivatedRoute, private router: Router) {
    this.route.params.forEach((params: any) => {
      this.type = params.type;
      console.log(this.type, 'ssss')
    });
    this.classForm = this.fb.group(
      {
        subject: ['', Validators.required],
        curriculum: ['', Validators.required],
        grade: ['', Validators.required],
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
        amount_month: ['', Validators.required],
        amount_quarter: ['', Validators.required],
        amount_half_year: ['', Validators.required],
        amount_year: ['', Validators.required],
        meeting_link: [''],
        class_id: [''],
      },
      {validators: this.startTimeBeforeEndTimeValidator()}
    );
    try {
      const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
      this.gradeList = (config && config.grade && config.grade.length) ? config.grade : [
        { id: 1, displayname: '1 Grade' }, { id: 2, displayname: '2 Grade' },
        { id: 3, displayname: '3 Grade' }, { id: 4, displayname: '4 Grade' },
        { id: 5, displayname: '5 Grade' }, { id: 6, displayname: '6 Grade' },
        { id: 7, displayname: '7 Grade' }, { id: 8, displayname: '8 Grade' },
        { id: 9, displayname: '9 Grade' }, { id: 10, displayname: '10 Grade' },
        { id: 11, displayname: '11 Grade' }, { id: 12, displayname: '12 Grade' }
      ];
      this.curriculumList = (config && config.curriculum && config.curriculum.length) ? config.curriculum : [
        { id: 1, curriculum_type: 'CBSE' }, { id: 2, curriculum_type: 'ICSE' },
        { id: 3, curriculum_type: 'State Board' }, { id: 4, curriculum_type: 'IB' },
        { id: 5, curriculum_type: 'IGCSE' }
      ];
      this.subjectList = this.mergeSubjects(config && config.subjects ? config.subjects : []);
    } catch (e) {
      console.warn('Error reading configData:', e);
      this.subjectList = this.mergeSubjects([]);
    }
    this.daysArray();
    if (this.type != 'add') {
      const editClassData = JSON.parse(this.auth.getLocalStorage('editClass'));
      this.editClass(editClassData);
    }
  }

  public DEFAULT_GOVERNMENT_SUBJECTS: any[] = [
    { id: 1, subject: 'Mathematics', subject_name: 'Mathematics' },
    { id: 2, subject: 'English', subject_name: 'English' },
    { id: 3, subject: 'Science', subject_name: 'Science' },
    { id: 4, subject: 'Social Science', subject_name: 'Social Science' },
    { id: 5, subject: 'Environmental Studies (EVS)', subject_name: 'Environmental Studies (EVS)' },
    { id: 6, subject: 'Physics', subject_name: 'Physics' },
    { id: 7, subject: 'Chemistry', subject_name: 'Chemistry' },
    { id: 8, subject: 'Biology', subject_name: 'Biology' },
    { id: 9, subject: 'Computer Science', subject_name: 'Computer Science' },
    { id: 10, subject: 'Informatics Practices', subject_name: 'Informatics Practices' },
    { id: 11, subject: 'Accountancy', subject_name: 'Accountancy' },
    { id: 12, subject: 'Business Studies', subject_name: 'Business Studies' },
    { id: 13, subject: 'Economics', subject_name: 'Economics' },
    { id: 14, subject: 'History', subject_name: 'History' },
    { id: 15, subject: 'Geography', subject_name: 'Geography' },
    { id: 16, subject: 'Political Science', subject_name: 'Political Science' },
    { id: 17, subject: 'Psychology', subject_name: 'Psychology' },
    { id: 18, subject: 'Sociology', subject_name: 'Sociology' },
    { id: 19, subject: 'Hindi', subject_name: 'Hindi' },
    { id: 20, subject: 'Sanskrit', subject_name: 'Sanskrit' },
    { id: 21, subject: 'Tamil', subject_name: 'Tamil' },
    { id: 22, subject: 'Physical Education', subject_name: 'Physical Education' },
    { id: 23, subject: 'Yoga', subject_name: 'Yoga' },
    { id: 24, subject: 'Piano', subject_name: 'Piano' },
    { id: 25, subject: 'Guitar', subject_name: 'Guitar' }
  ];

  getSubjectName(subject: any): string {
    if (!subject) return '';
    if (typeof subject === 'string') return subject;
    return subject.subject_name || subject.subject || subject.displayname || String(subject);
  }

  getSubjectValue(subject: any): string {
    return this.getSubjectName(subject).toLowerCase();
  }

  mergeSubjects(apiSubjects: any[]): any[] {
    const combined = [...(apiSubjects || []), ...this.DEFAULT_GOVERNMENT_SUBJECTS];
    const uniqueMap = new Map();
    combined.forEach(item => {
      const name = this.getSubjectName(item).trim();
      if (name && !uniqueMap.has(name.toLowerCase())) {
        uniqueMap.set(name.toLowerCase(), item);
      }
    });
    return Array.from(uniqueMap.values());
  }

  editClass(classDetail: any) {
    console.log(classDetail, 'classDetaos');
    // this.type = 'Edit';
    this.classForm.controls['curriculum'].patchValue(classDetail.curriculum_id ?? '');
    this.classForm.controls['grade'].patchValue(classDetail.grade ?? '');
    if (this.type == 'edit') {
      this.classForm.controls['start_time'].patchValue(classDetail.start_time ?? '');
      this.classForm.controls['end_time'].patchValue(classDetail.end_time ?? '');
    }
    this.classForm.controls['amount_month'].patchValue(classDetail.monthly_amount ?? '');
    this.classForm.controls['meeting_link'].patchValue(classDetail.meeting_link ?? '');
    this.classForm.controls['amount_quarter'].patchValue(classDetail.quarterly_amount ?? '');
    this.classForm.controls['amount_half_year'].patchValue(classDetail.halfyearly_amount ?? '');
    this.classForm.controls['amount_year'].patchValue(classDetail.yearly_amount ?? '');
    this.classForm.controls['class_id'].patchValue(classDetail.class_id ?? '');
    this.getSubject(classDetail.subject);
  }

  getSubject(editClass = '') {
    if (this.classForm.get('grade')?.value && this.classForm.get('curriculum')?.value) {
      console.log('sec');
      const payload = {
        curriculum_id: this.classForm.get('curriculum')?.value,
        grade: this.classForm.get('grade')?.value,
      };
      console.log(payload);
      this.auth.postService(payload, Urls.subjectList).subscribe(
        (successData: any) => {
          console.log(successData, 'successData');
          const apiList = successData.IsSuccess && successData.ResponseObject ? successData.ResponseObject : [];
          this.subjectList = this.mergeSubjects(apiList);
          if (editClass) {
            this.classForm.controls['subject'].patchValue(editClass);
          }
          if (this.type == 'moreSession') {
            this.disableAllField();
          }
          this.getTeacherClassDetails();
        },
        (error: any) => {
          console.error(error, 'subject_error');
          this.subjectList = this.mergeSubjects([]);
        }
      );
    } else {
      this.subjectList = this.mergeSubjects([]);
    }
  }

  generateJitsiLink() {
    const rawSubject = this.classForm.controls['subject'].value || 'Class';
    const sanitizedSubject = rawSubject.replace(/[^a-zA-Z0-9]/g, '_');
    const roomUrl = `https://meet.jit.si/Etutor_Class_${sanitizedSubject}_${Date.now()}`;
    this.classForm.controls['meeting_link'].setValue(roomUrl);
    this.helper.presentToast('Jitsi Live Classroom URL auto-generated!');
  }

  submitClass() {
    this.enableAllField();
    if (this.classForm.valid && !this.checkForValidAmount && !this.checkValidAmountPerMonthOrYear('amount_quarter')
      && !this.checkValidAmountPerMonthOrYear('amount_half_year') && !this.checkValidAmountPerMonthOrYear('amount_year')) {
      if (this.daysList.some((day: any) => day.selected)) {
        let meetingValue = this.classForm.controls['meeting_link'].value ?? '';
        if (!meetingValue) {
          const rawSub = this.classForm.controls['subject'].value || 'Class';
          meetingValue = `https://meet.jit.si/Etutor_Class_${rawSub.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        }
        const meeting_link = meetingValue.includes('https') ? meetingValue : meetingValue.includes('http') ?
          meetingValue.replace(/^http:\/\//, 'https://') : 'https://' + meetingValue;
        const rawStartTime = this.classForm.controls['start_time'].value;
        const rawEndTime = this.classForm.controls['end_time'].value;
        const utcStartTime = this.timezoneService.convertLocalToUtc(rawStartTime, this.selectedTimezone);
        const utcEndTime = this.timezoneService.convertLocalToUtc(rawEndTime, this.selectedTimezone);

        const classPayload: any = {
          classes: [{
              meeting_link,
              curriculum_id: this.classForm.controls['curriculum'].value,
              grade: this.classForm.controls['grade'].value,
              subject: this.classForm.controls['subject'].value,
              days: this.daysList.filter((day: any) => {
                  return day.selected;
                }).map((value: any) => value.value).toString(),
              start_time: utcStartTime,
              end_time: utcEndTime,
              timezone: this.selectedTimezone,
              teacher_id: this.auth.getUserId(),
              monthly_amount: this.classForm.controls['amount_month'].value,
              quarterly_amount: this.classForm.controls['amount_quarter'].value,
              halfyearly_amount: this.classForm.controls['amount_half_year'].value,
              yearly_amount: this.classForm.controls['amount_year'].value,
            }],
        };
        if (this.type == 'edit') {
          classPayload['class_id'] = this.classForm.controls['class_id'].value;
        }
        console.log(classPayload, 'classPayload');
          this.auth.postService(classPayload, Urls.addClass).subscribe(
            (successData: any) => {
              console.log(successData, 'successData');
              if (successData.IsSuccess) {
                this.helper.presentToast('Class added successfully');
                this.router.navigate(['/myaccount/myclasses/list'])
              } else {
                this.helper.presentErrorToast(successData.ErrorObject);
              }
            },
            (error: any) => { console.error(error, 'error');});
      } else {
        this.helper.presentErrorToast('Kindly select at-least one day to proceed further');
      }
    } else {
      this.helper.presentErrorToast('Please enter all the field with valid data');
      this.customValidater.validateAllFormFields(this.classForm);
      setTimeout(() => {
        this.disableAllField()
      }, 1000)
    }
  }

  getTeacherClassDetails(calledFrom = '') {
    const payload = {
      curriculum_id: this.classForm.controls['curriculum'].value,
      grade: this.classForm.controls['grade'].value,
      subject: this.classForm.controls['subject'].value
    }
    console.log(payload, 'classDeatils');
    this.auth.postService(payload, Urls.teacherClassDetails).subscribe((successData) => {
        console.log(successData, 'successData');
        this.oldAvailabilityData = successData.IsSuccess && successData.ResponseObject.length != 0 ? successData.ResponseObject : [];
    }, (error) => console.error(error, 'error_teacherDetails'))
  }

  calculateSessionAmount() {
    if (this.classForm.controls['amount_month'].value.trim() != '' && parseInt(this.classForm.controls['amount_month'].value) != 0) {
      const monthPerAmount = this.classForm.controls['amount_month'].value;
      this.classForm.controls['amount_quarter'].patchValue(parseInt(monthPerAmount) * 3);
      this.classForm.controls['amount_half_year'].patchValue(parseInt(monthPerAmount) * 6);
      this.classForm.controls['amount_year'].patchValue(parseInt(monthPerAmount) * 12)
    } else if (this.classForm.controls['amount_month'].value.trim() == '') {
      this.classForm.controls['amount_quarter'].patchValue('');
      this.classForm.controls['amount_half_year'].patchValue('');
      this.classForm.controls['amount_year'].patchValue('');
    }
  }

  get checkForValidAmount() {
    return (
      this.classForm.controls['amount_month'].value.trim() != '' &&
      parseInt(this.classForm.controls['amount_month'].value) == 0
    );
  }

  checkValidAmountPerMonthOrYear(formControlName: any) {
    const formControlAmount = this.classForm.controls[formControlName].value
    const amount = this.classForm.controls['amount_month'].value;
    if (formControlAmount != '' && parseInt(formControlAmount) != 0) {
      if (amount.trim() != '' && parseInt(amount) != 0) {
        const maximumAmount = parseInt(amount) * (formControlName == 'amount_quarter' ? 3 :
          formControlName == 'amount_half_year' ? 6 : 12);
        return this.classForm.controls[formControlName].value > maximumAmount;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  daysArray() {
    this.daysList = [
      {id: 'Mon', value: 'Monday', selected: false},
      {id: 'Tue', value: 'Tuesday', selected: false},
      {id: 'Wed', value: 'Wednesday', selected: false},
      {id: 'Thu', value: 'Thursday', selected: false},
      {id: 'Fri', value: 'Friday', selected: false},
      {id: 'Sat', value: 'Saturday', selected: false},
      {id: 'Sun', value: 'Sunday', selected: false},
    ];
  }

  startTimeBeforeEndTimeValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const startTime = formGroup.get('start_time')?.value;
      const endTime = formGroup.get('end_time')?.value;
      if (!startTime || !endTime) {
        return null;
      }
      const convertTo24HourFormat = (timeStr: string): number => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        return hours * 60 + minutes;
      };

      const startInMinutes = convertTo24HourFormat(startTime);
      const endInMinutes = convertTo24HourFormat(endTime);
      return startInMinutes < endInMinutes
        ? null
        : {startTimeAfterEndTime: true};
    };
  }

  showDialog() {
    this.dialog.open(this.promptPop, {
      panelClass: 'availability_class_dialog',
      data: '',
      hasBackdrop: true,
      disableClose: false,
    });
    // const currentDate = new Date().toDateString();
    // this.auth.setLocalStorage('verificationStatusPopUp',
    //   JSON.stringify({ status: this.teacherStatus, date: currentDate })
    // );
  }

  closeAll() {
    this.dialog.closeAll();
  }

  disableAllField() {
    this.classForm.get('curriculum')?.disable();
    this.classForm.get('grade')?.disable();
    this.classForm.get('subject')?.disable();
    this.classForm.get('amount_month')?.disable();
    this.classForm.get('amount_quarter')?.disable();
    this.classForm.get('amount_half_year')?.disable();
    this.classForm.get('amount_year')?.disable();
  }

  enableAllField() {
    this.classForm.get('curriculum')?.enable();
    this.classForm.get('grade')?.enable();
    this.classForm.get('subject')?.enable();
    this.classForm.get('amount_month')?.enable();
    this.classForm.get('amount_quarter')?.enable();
    this.classForm.get('amount_half_year')?.enable();
    this.classForm.get('amount_year')?.enable();
  }

  protected readonly parseInt = parseInt;
}
