import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../shared/services/auth.service';
import {ReactiveFormsModule} from '@angular/forms';
import {NgIf} from "@angular/common";
import {ApiService} from "../../../../shared/services/api.service";
import {Urls} from "../../../../shared/services/urls";
import {NgSelectComponent} from "@ng-select/ng-select";
import {SessionConstants} from "../../../../shared/services/sessionConstants";
import {Router, RouterLink} from "@angular/router";
import {HelperService} from '../../../../shared/services/helper.service';
import {CustomValidationService} from '../../../../shared/services/customValidations.service';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgSelectComponent, RouterLink],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  teacherForm: FormGroup;
  studentForm: FormGroup;
  profileBase64: any;
  proFileupld: any;
  public teacherStatus = '0';
  auth = inject(AuthService);
  api = inject(ApiService);
  helper = inject(HelperService);
  customValidator = inject(CustomValidationService);
  public profileData: any = {};
  public gradeListData: any = [];
  public curriculumList: any = [];
  public editProfileDetails = false;
  public submittedTeacher = false;
  public submittedStudent = false;

  public activeSubscribedSubjects: string = '';
  public studentGradeName: string = '';
  public studentCurriculumName: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
    this.gradeListData = config?.grade || [];
    this.curriculumList = config?.curriculum || [];
    
    this.teacherForm = this.fb.group({
      subject: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      language: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      identification: [''],
      qualification: ['', Validators.required],
      duration: [''],
      mail: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
    });

    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      gender: ['', Validators.required],
      grade: ['', Validators.required],
      curriculum: ['', Validators.required],
    });
  }

  public verificationStatus: string = '0';
  public rejectionNotes: string = '';

  ngOnInit(): void {
    this.profileList();
  }

  profileList() {
    const isTeacher = this.auth.getRoleId() === '2';
    const payload = isTeacher ? { filter_by: 'teacher', filter_value: this.auth.getUserId() } : { user_id: this.auth.getUserId() };
    const url = isTeacher ? Urls.teacherProfile : Urls.studentProfile;
    const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');

    if (localUser) {
      if (isTeacher) {
        this.patchTeacherForm(localUser);
      } else {
        this.patchStudentForm(localUser);
      }
    }

    this.auth.postService(payload, url).subscribe({
      next: (successData: any) => {
        console.log(successData, 'profileList successData');
        if (successData.IsSuccess) {
          const fetchedData = successData.ResponseObject && successData.ResponseObject.length != 0 ? successData.ResponseObject[0] : {};
          const combinedData = { ...localUser, ...fetchedData };
          this.profileData = combinedData;

          if (isTeacher) {
            this.patchTeacherForm(combinedData);
          } else {
            this.patchStudentForm(combinedData);
          }
        }
      },
      error: (error: any) => console.error(error, 'error_profile_list')
    });

    if (isTeacher) {
      this.loadTeacherVerificationStatus();
    } else {
      this.loadStudentSubscriptions();
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
      error: (err: any) => console.error(err, 'error fetching teacher status in profile')
    });
  }

  loadStudentSubscriptions() {
    const payload = {
      user_id: this.auth.getUserId()
    };
    this.auth.postService(payload, Urls.classList).subscribe({
      next: (res: any) => {
        if (res.IsSuccess && Array.isArray(res.ResponseObject)) {
          const subjects = new Set<string>();
          res.ResponseObject.forEach((item: any) => {
            if (item.subject) subjects.add(item.subject.trim());
          });
          this.activeSubscribedSubjects = Array.from(subjects).join(', ');
        }
      },
      error: (err: any) => console.error(err, 'error_load_subscriptions')
    });
  }

  patchTeacherForm(data: any) {
    if (!data) return;
    this.teacherForm.patchValue({
      subject: data?.subjects_you_teach || data?.subject || '',
      gender: data?.gender || '',
      language: data?.languages_known || data?.languages || data?.language || '',
      mobile: data?.mobile_number || data?.mobile || '',
      identification: data?.identification_proof_id || data?.identification || '',
      qualification: data?.qualifications || data?.qualification || '',
      duration: data?.experience !== undefined && data?.experience !== null ? data.experience : (data?.experience_in_yrs || data?.duration || ''),
      mail: data?.email || data?.mail || '',
      address: data?.address || '',
    });
  }

  patchStudentForm(data: any) {
    if (!data) return;
    this.studentForm.patchValue({
      firstName: data?.first_name || '',
      lastName: data?.last_name || '',
      mail: data?.email || data?.mail || '',
      mobile: data?.mobile_number || data?.mobile || '',
      gender: data?.gender || '',
      grade: data?.grade || data?.class || null,
      curriculum: data?.curriculum_type || data?.curriculum || null,
    });

    const gradeId = data?.grade || data?.class;
    const curriculumId = data?.curriculum_type || data?.curriculum;

    const matchedGrade = this.gradeListData.find((g: any) => g.id == gradeId);
    if (matchedGrade) {
      this.studentGradeName = matchedGrade.displayname;
    }

    const matchedCurriculum = this.curriculumList.find((c: any) => c.id == curriculumId || c.curriculum_type == curriculumId);
    if (matchedCurriculum) {
      this.studentCurriculumName = matchedCurriculum.curriculum_type;
    } else if (typeof curriculumId === 'string') {
      this.studentCurriculumName = curriculumId;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.proFileupld = input.files[0];
      this.convertToBase64(file);
    }
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.profileBase64 = reader.result;
    };
    reader.readAsDataURL(file);
  }

  routeToChangePassword() {
    this.router.navigate(['myaccount/change-password']);
  }

  routeToTutor() {
    this.router.navigate(['tutor']);
  }

  submitTeacherForm() {
    this.submittedTeacher = true;
    this.teacherForm.markAllAsTouched();
    if (this.teacherForm.invalid) {
      this.helper.presentErrorToast('Please fill all required fields');
      return;
    }

    const payload = {
      user_id: this.auth.getUserId(),
      email: this.teacherForm.value.mail,
      mobile_number: this.teacherForm.value.mobile,
      gender: this.teacherForm.value.gender,
      address: this.teacherForm.value.address,
      qualification: this.teacherForm.value.qualification,
      experience_in_yrs: this.teacherForm.value.duration,
      subjects_you_teach: this.teacherForm.value.subject,
      language_proficiency: this.teacherForm.value.language,
      identification_proof_id: this.teacherForm.value.identification
    };

    this.auth.postService(payload, Urls.becometutor).subscribe({
      next: (res: any) => {
        if (res.IsSuccess) {
          this.helper.presentToast('Teacher profile saved successfully');
          this.editProfileDetails = false;
          const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          const updatedUser = { ...localUser, ...payload };
          this.auth.setLocalStorage('user', JSON.stringify(updatedUser));
          this.profileData = updatedUser;
        } else {
          this.helper.presentErrorToast(res.ErrorObject || 'Failed to save profile');
        }
      },
      error: () => this.helper.presentErrorToast('Error saving profile details')
    });
  }

  submitStudentForm() {
    this.submittedStudent = true;
    this.studentForm.markAllAsTouched();
    if (this.studentForm.invalid) {
      this.helper.presentErrorToast('Please fill all required fields');
      return;
    }

    const payload = {
      user_id: this.auth.getUserId(),
      first_name: this.studentForm.value.firstName,
      last_name: this.studentForm.value.lastName,
      email: this.studentForm.value.mail,
      mobile_number: this.studentForm.value.mobile,
      gender: this.studentForm.value.gender,
      grade: this.studentForm.value.grade,
      curriculum_type: this.studentForm.value.curriculum
    };

    this.auth.postService(payload, 'user/updateStudentProfile').subscribe({
      next: (res: any) => {
        if (res.IsSuccess) {
          this.helper.presentToast('Student profile saved successfully');
          this.editProfileDetails = false;
          const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          const updatedUser = { ...localUser, ...payload };
          this.auth.setLocalStorage('user', JSON.stringify(updatedUser));
          this.profileData = updatedUser;
          this.patchStudentForm(updatedUser);
        } else {
          this.helper.presentErrorToast(res.ErrorObject || 'Failed to save profile');
        }
      },
      error: () => this.helper.presentErrorToast('Error saving student profile')
    });
  }
}
