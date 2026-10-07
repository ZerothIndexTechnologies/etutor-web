import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { NgIf, NgFor, CommonModule, DecimalPipe } from "@angular/common";
import { ApiService } from "../../../../shared/services/api.service";
import { Urls } from "../../../../shared/services/urls";
import { NgSelectModule } from "@ng-select/ng-select";
import { SessionConstants } from "../../../../shared/services/sessionConstants";
import { Router, RouterLink } from "@angular/router";
import { HelperService } from '../../../../shared/services/helper.service';
import { CustomValidationService } from '../../../../shared/services/customValidations.service';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgFor,
    NgSelectModule,
    RouterLink,
    CommonModule,
    CapitalizePipe,
    DecimalPipe
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  teacherForm: FormGroup;
  studentForm: FormGroup;
  
  // Teacher Stepper Tab Flags
  showFirst: boolean = true;
  showSecond: boolean = false;
  showThird: boolean = false;
  showFourth: boolean = false;
  showFive: boolean = false;

  profileBase64: any;
  identityBase64: any;
  ugCertBase64: any;
  pgCertBase64: any;
  proFileupld: any;
  identityFile: any;
  ugFile: any;
  pgFile: any;

  public teacherStatus: string = '0';
  auth = inject(AuthService);
  api = inject(ApiService);
  helper = inject(HelperService);
  customValidator = inject(CustomValidationService);
  router = inject(Router);

  public profileData: any = {};
  public gradeListData: any = [];
  public curriculumList: any = [];
  public proofList: any = [];
  
  public editProfileDetails: boolean = false;
  public submittedTeacher: boolean = false;
  public submittedStudent: boolean = false;

  // Languages & Chips for Teacher Form
  selectedLanguages: string[] = [];
  availableLanguages: string[] = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Malayalam',
    'Kannada',
    'Marathi',
    'Bengali',
    'Gujarati',
    'Punjabi',
    'Odia',
    'Assamese',
    'Urdu',
    'Sanskrit',
    'French',
    'German',
    'Spanish'
  ];
  qualificationChips: string[] = [];
  subjectChips: string[] = [];

  // Student Profile specific properties
  public activeStudentTab: string = 'general';
  public subscribedClassesList: any[] = [];
  public activeSubscribedSubjects: string = '';
  public studentGradeName: string = '';
  public studentCurriculumName: string = '';
  public verificationStatus: string = '0';
  public rejectionNotes: string = '';

  get isTeacher(): boolean {
    return this.auth.isTeacherUser;
  }

  constructor(private fb: FormBuilder) {
    const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
    this.gradeListData = config?.grade || [];
    this.curriculumList = config?.curriculum || [];
    this.initProofList(config?.identification_proof);
    
    this.teacherForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mail: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      gender: ['Male', [Validators.required]],
      address: ['', Validators.required],
      aboutInfo: ['', Validators.required],
      language: [''],
      pin: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      qualification: [''],
      exp: ['', Validators.required],
      subTeach: [''],
      curriculum: ['', Validators.required],
      identity: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccnum: ['', Validators.required],
      ifsc: ['', Validators.required],
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

  initProofList(customList?: any[]): void {
    const defaultList = [
      { id: 1, proof_type: 'Aadhaar Card' },
      { id: 2, proof_type: 'PAN Card' },
      { id: 3, proof_type: 'Passport' },
      { id: 4, proof_type: 'Voter ID' },
      { id: 5, proof_type: 'Driving License' }
    ];

    const source = (customList && customList.length > 0)
      ? customList
      : (this.proofList && this.proofList.length > 0 ? this.proofList : []);

    const result: { id: any; proof_type: string }[] = [];
    const seen = new Set<string>();

    const add = (id: any, name: string) => {
      const trimmed = (name || '').trim();
      if (!trimmed || trimmed === '[object Object]') return;
      const key = trimmed.toLowerCase().replace(/aa/g, 'a');
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ id: id || trimmed, proof_type: trimmed });
      }
    };

    if (Array.isArray(source) && source.length > 0) {
      for (const item of source) {
        if (typeof item === 'string') {
          add(item, item);
        } else if (item && typeof item === 'object') {
          const typeName = item.proof_type || item.name || item.type || item.identification_proof;
          if (typeName && typeof typeName === 'string') {
            add(item.id || typeName, typeName);
          }
        }
      }
    }

    for (const def of defaultList) {
      add(def.id, def.proof_type);
    }

    this.proofList = result;
  }

  ngOnInit(): void {
    const config = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData) || '{}');
    if (config?.identification_proof && config.identification_proof.length > 0) {
      this.initProofList(config.identification_proof);
    }
    this.profileList();
  }

  onCollapseStepper(step: number): void {
    this.showFirst = step === 1;
    this.showSecond = step === 2;
    this.showThird = step === 3;
    this.showFourth = step === 4;
    this.showFive = step === 5;
  }

  isStepCompleted(step: number): boolean {
    if (step === 1) {
      return !!(
        (this.teacherForm.get('address')?.value || this.profileData?.address) &&
        (this.selectedLanguages.length > 0 || this.profileData?.language_proficiency)
      );
    }
    if (step === 2) {
      return !!(
        (this.qualificationChips.length > 0 || this.profileData?.qualification) &&
        (this.subjectChips.length > 0 || this.profileData?.subjects_you_teach)
      );
    }
    if (step === 3) {
      return !!(
        (this.teacherForm.get('bankName')?.value || this.profileData?.bank_name) &&
        (this.teacherForm.get('bankAccnum')?.value || this.profileData?.bank_account_number)
      );
    }
    if (step === 4) {
      return !!(this.profileData?.is_document_uploaded || this.identityBase64 || this.ugCertBase64);
    }
    if (step === 5) {
      return this.auth.isTeacherVerified;
    }
    return false;
  }

  cleanMerge(target: any, source: any): any {
    const result = { ...(target || {}) };
    if (!source) return result;
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== 'null' && String(val).trim() !== 'undefined') {
        if (Array.isArray(val) && val.length === 0 && Array.isArray(result[key]) && result[key].length > 0) {
          continue;
        }
        result[key] = val;
      }
    }
    return result;
  }

  profileList() {
    const isTeacherUser = this.isTeacher;
    const currentUserId = String(this.auth.getUserId());
    const localUser = this.auth.getUserDetails() || JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const savedTeacherProfile = JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}');
    const initialData = { ...localUser, ...savedTeacherProfile };

    if (initialData && Object.keys(initialData).length > 0) {
      this.profileData = { ...initialData };
      if (isTeacherUser) {
        this.patchTeacherForm(initialData);
      } else {
        this.patchStudentForm(initialData);
      }
    }

    const payload = isTeacherUser
      ? { filter_by: 'teacher', filter_value: currentUserId, user_id: currentUserId }
      : { user_id: currentUserId, student_id: currentUserId };
    const url = isTeacherUser ? Urls.teacherProfile : Urls.studentProfile;

    this.auth.postService(payload, url).subscribe({
      next: (successData: any) => {
        if (successData && successData.IsSuccess && successData.ResponseObject) {
          let fetchedData: any = null;
          const userEmail = (localUser?.email || '').toLowerCase();
          const userMobile = String(localUser?.mobile_number || '');

          if (Array.isArray(successData.ResponseObject)) {
            const matched = successData.ResponseObject.find(
              (item: any) =>
                String(item.user_id || item.id || item.student_id || item.teacher_id) === currentUserId ||
                (userEmail && item.email && String(item.email).toLowerCase() === userEmail) ||
                (userMobile && item.mobile_number && String(item.mobile_number) === userMobile)
            );
            fetchedData = matched || null;
          } else if (typeof successData.ResponseObject === 'object') {
            fetchedData = successData.ResponseObject;
          }

          if (fetchedData) {
            const combinedData = this.cleanMerge(initialData, fetchedData);
            this.profileData = combinedData;

            if (isTeacherUser) {
              this.patchTeacherForm(combinedData);
            } else {
              this.patchStudentForm(combinedData);
            }
          }
        }
      },
      error: (error: any) => console.error(error, 'error_profile_list')
    });

    if (isTeacherUser) {
      this.loadTeacherVerificationStatus();
    } else {
      this.loadStudentSubscriptions();
    }
  }

  patchTeacherForm(data: any) {
    if (!data) return;

    this.initProofList();

    const getFieldVal = (...keys: string[]): string => {
      const sources = [
        data,
        this.profileData,
        this.auth.getUserDetails(),
        JSON.parse(this.auth.getLocalStorage('user') || '{}'),
        JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}')
      ];
      for (const src of sources) {
        if (!src) continue;
        for (const k of keys) {
          if (src[k] !== undefined && src[k] !== null) {
            if (typeof src[k] === 'object') {
              const objVal = src[k].proof_type || src[k].name || src[k].type || src[k].identification_proof;
              if (objVal && typeof objVal === 'string' && objVal !== '[object Object]') {
                return objVal.trim();
              }
              continue;
            }
            const strVal = String(src[k]).trim();
            if (strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '[object Object]') {
              return strVal;
            }
          }
        }
      }
      return '';
    };

    const parseList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val.map((s: any) => String(s).trim()).filter(Boolean);
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.map((s: any) => String(s).trim()).filter(Boolean);
            }
          } catch (e) {}
        }
        return trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      return [];
    };

    // Extract Languages
    const langs = data.languages_known || data.language_proficiency || data.languages || data.language;
    const parsedLangs = parseList(langs);
    if (parsedLangs.length > 0) {
      this.selectedLanguages = Array.from(new Set([...this.selectedLanguages, ...parsedLangs]));
    }

    // Extract Qualifications
    const qualVal = data.qualifications || data.highest_qualification || data.qualification;
    const parsedQual = parseList(qualVal);
    if (parsedQual.length > 0) {
      this.qualificationChips = Array.from(new Set([...this.qualificationChips, ...parsedQual]));
    }

    // Extract Subjects Taught
    const subjectsVal = data.subjects_you_teach || data.subjects || data.subTeach || data.subject;
    const parsedSub = parseList(subjectsVal);
    if (parsedSub.length > 0) {
      this.subjectChips = Array.from(new Set([...this.subjectChips, ...parsedSub]));
    }

    const firstName = getFieldVal('first_name', 'firstName', 'name');
    const lastName = getFieldVal('last_name', 'lastName');
    const email = getFieldVal('email', 'mail', 'email_id');
    const mobile = getFieldVal('mobile_number', 'mobile', 'phone_number', 'phone');
    const gender = getFieldVal('gender') || 'Male';
    const address = getFieldVal('address', 'residence_address');
    const aboutInfo = getFieldVal('about_you', 'about_info', 'aboutInfo', 'bio', 'about', 'comment', 'description', 'user_about', 'teacher_about');
    const pin = getFieldVal('pin_code', 'pincode', 'pin', 'zip_code', 'zip');
    const city = getFieldVal('city', 'town', 'district');
    const state = getFieldVal('state', 'province', 'region');
    const exp = getFieldVal('experience_in_yrs', 'experience', 'exp', 'total_experience');
    const curriculum = getFieldVal('curriculum_type', 'curriculum', 'curriculum_id');
    const rawIdentity = getFieldVal('identification_proof_id', 'identification', 'identity_type', 'identity', 'identification_proof');
    const bankName = getFieldVal('bank_name', 'bankName', 'bank');
    const bankAccnum = getFieldVal('bank_account_number', 'account_number', 'bankAccnum', 'account_no');
    const ifsc = getFieldVal('IFSC_code', 'ifsc_code', 'ifsc', 'ifscCode');

    // Resolve matched proof type from proofList
    let matchedProofType = '';
    if (rawIdentity) {
      const normRaw = rawIdentity.toLowerCase().replace(/aa/g, 'a').trim();
      const matched = this.proofList.find((p: any) => {
        const normP = (p.proof_type || '').toLowerCase().replace(/aa/g, 'a').trim();
        return normP === normRaw || String(p.id).trim() === String(rawIdentity).trim();
      });
      if (matched) {
        matchedProofType = matched.proof_type;
      } else {
        matchedProofType = rawIdentity;
        this.proofList.push({ id: rawIdentity, proof_type: rawIdentity });
      }
    } else {
      matchedProofType = this.proofList[0]?.proof_type || 'Aadhaar Card';
    }

    this.teacherForm.patchValue({
      firstName: firstName || this.teacherForm.get('firstName')?.value || '',
      lastName: lastName || this.teacherForm.get('lastName')?.value || '',
      mail: email || this.teacherForm.get('mail')?.value || '',
      mobile: mobile || this.teacherForm.get('mobile')?.value || '',
      gender: gender || this.teacherForm.get('gender')?.value || 'Male',
      address: address || this.teacherForm.get('address')?.value || '',
      aboutInfo: aboutInfo || this.teacherForm.get('aboutInfo')?.value || '',
      language: this.selectedLanguages.join(', '),
      pin: pin || this.teacherForm.get('pin')?.value || '',
      city: city || this.teacherForm.get('city')?.value || '',
      state: state || this.teacherForm.get('state')?.value || '',
      qualification: this.qualificationChips.join(', '),
      exp: exp || this.teacherForm.get('exp')?.value || '',
      subTeach: this.subjectChips.join(', '),
      curriculum: curriculum || this.teacherForm.get('curriculum')?.value || '',
      identity: matchedProofType || this.teacherForm.get('identity')?.value || '',
      bankName: bankName || this.teacherForm.get('bankName')?.value || '',
      bankAccnum: bankAccnum || this.teacherForm.get('bankAccnum')?.value || '',
      ifsc: ifsc || this.teacherForm.get('ifsc')?.value || '',
    });

    if (aboutInfo) {
      this.profileData.about_you = aboutInfo;
      this.profileData.about_info = aboutInfo;
      this.profileData.aboutInfo = aboutInfo;
    }
    if (address) {
      this.profileData.address = address;
      this.profileData.residence_address = address;
    }
    if (pin) {
      this.profileData.pin_code = pin;
      this.profileData.pincode = pin;
    }
    if (city) this.profileData.city = city;
    if (state) this.profileData.state = state;
    if (exp) this.profileData.experience_in_yrs = exp;
    if (curriculum) this.profileData.curriculum_type = curriculum;
    if (matchedProofType) this.profileData.identification_proof_id = matchedProofType;
    if (bankName) this.profileData.bank_name = bankName;
    if (bankAccnum) this.profileData.bank_account_number = bankAccnum;
    if (ifsc) this.profileData.IFSC_code = ifsc;
  }

  loadTeacherVerificationStatus() {
    const userObj = this.profileData || JSON.parse(this.auth.getLocalStorage('user') || '{}');
    const userEmail = (userObj?.email || this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    const userId = this.auth.getUserId() || userObj?.id || userObj?.user_id || userObj?.teacher_id;
    const payload = {
      id: userId ? userId.toString() : '',
      user_id: userId,
      email: userEmail
    };
    const url = 'common/notifyTeacherProfileStatus?id=' + (userId ? userId.toString() : '');
    this.auth.postService(payload, url).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && res.ResponseObject) {
          const status = String(res.ResponseObject.is_account_verified ?? '0');
          this.teacherStatus = status;
          this.rejectionNotes = res.ResponseObject.rejection_notes || '';
          this.verificationStatus = this.teacherStatus;

          const currentUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          if (currentUser && Object.keys(currentUser).length > 0) {
            currentUser.is_account_verified = status;
            this.auth.setLocalStorage('user', JSON.stringify(currentUser));
          }
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  // Language & Chip handlers
  qualInputText: string = '';
  subjectInputText: string = '';

  onLanguageChange(selected: any): void {
    if (Array.isArray(selected)) {
      this.selectedLanguages = selected;
    }
    this.teacherForm.patchValue({ language: this.selectedLanguages.join(', ') });
  }

  handleKeyDown(event: any, type: string): void {
    let value = (event.target as HTMLInputElement).value ? (event.target as HTMLInputElement).value.trim() : '';
    if ((event.key === 'Enter' || event.key === ',') && value) {
      event.preventDefault();
      if (type === 'qualification') {
        if (!this.qualificationChips.includes(value)) {
          this.qualificationChips.push(value);
        }
        this.teacherForm.patchValue({ qualification: this.qualificationChips.join(', ') });
        this.qualInputText = '';
      } else if (type === 'subjectTeach' || type === 'subject') {
        if (!this.subjectChips.includes(value)) {
          this.subjectChips.push(value);
        }
        this.teacherForm.patchValue({ subTeach: this.subjectChips.join(', ') });
        this.subjectInputText = '';
      }
    }
  }

  addQualOnBlur(): void {
    if (this.qualInputText && this.qualInputText.trim()) {
      if (!this.qualificationChips.includes(this.qualInputText.trim())) {
        this.qualificationChips.push(this.qualInputText.trim());
      }
      this.teacherForm.patchValue({ qualification: this.qualificationChips.join(', ') });
      this.qualInputText = '';
    }
  }

  addSubjectOnBlur(): void {
    if (this.subjectInputText && this.subjectInputText.trim()) {
      if (!this.subjectChips.includes(this.subjectInputText.trim())) {
        this.subjectChips.push(this.subjectInputText.trim());
      }
      this.teacherForm.patchValue({ subTeach: this.subjectChips.join(', ') });
      this.subjectInputText = '';
    }
  }

  removeQualificationChip(chip: string): void {
    this.qualificationChips = this.qualificationChips.filter(c => c !== chip);
    this.teacherForm.patchValue({ qualification: this.qualificationChips.join(', ') });
  }

  removeSubjectChip(chip: string): void {
    this.subjectChips = this.subjectChips.filter(c => c !== chip);
    this.teacherForm.patchValue({ subTeach: this.subjectChips.join(', ') });
  }

  // File Upload Handlers
  onFileSelected(event: Event, type: string = 'profile'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'profile') {
        this.proFileupld = file;
        this.convertToBase64(file, 'profile');
      } else if (type === 'identity') {
        this.identityFile = file;
        this.convertToBase64(file, 'identity');
      } else if (type === 'ug') {
        this.ugFile = file;
        this.convertToBase64(file, 'ug');
      } else if (type === 'pg') {
        this.pgFile = file;
        this.convertToBase64(file, 'pg');
      }
    }
  }

  convertToBase64(file: File, type: string = 'profile'): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'profile') {
        this.profileBase64 = reader.result;
        if (this.profileData) {
          this.profileData.profile_image = this.profileBase64;
        }
        const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
        localUser.profile_image = this.profileBase64;
        this.auth.setLocalStorage('user', JSON.stringify(localUser));
        this.helper.presentToast('Profile picture updated successfully');
      } else if (type === 'identity') {
        this.identityBase64 = reader.result;
        this.helper.presentToast('Identity proof selected');
      } else if (type === 'ug') {
        this.ugCertBase64 = reader.result;
        this.helper.presentToast('Degree certificate selected');
      } else if (type === 'pg') {
        this.pgCertBase64 = reader.result;
        this.helper.presentToast('PG certificate selected');
      }
    };
    reader.readAsDataURL(file);
  }

  getIdentityDisplay(): string {
    const val = this.teacherForm?.get('identity')?.value || this.profileData?.identification_proof_id || this.profileData?.identification_proof || this.profileData?.proof_type;
    if (!val) return 'Aadhaar Card';
    if (typeof val === 'object') {
      return val.proof_type || val.name || val.type || 'Aadhaar Card';
    }
    const valStr = String(val).trim();
    if (valStr === '[object Object]' || valStr === '' || valStr === 'null' || valStr === 'undefined') {
      return 'Aadhaar Card';
    }
    const norm = valStr.toLowerCase().replace(/aa/g, 'a');
    const found = this.proofList?.find((p: any) => {
      const normP = (p.proof_type || '').toLowerCase().replace(/aa/g, 'a');
      return normP === norm || String(p.id).trim() === valStr;
    });
    return found ? found.proof_type : valStr;
  }

  toggleEditMode() {
    this.editProfileDetails = !this.editProfileDetails;
    if (this.editProfileDetails) {
      this.initProofList();
      if (this.isTeacher && this.profileData && Object.keys(this.profileData).length > 0) {
        this.patchTeacherForm(this.profileData);
      }
    }
  }

  submitTeacherForm() {
    this.submittedTeacher = true;
    this.teacherForm.markAllAsTouched();

    const formVal = this.teacherForm.value;
    const langs = this.selectedLanguages.length > 0 ? this.selectedLanguages : (formVal.language ? [formVal.language] : []);
    const qual = this.qualificationChips.length > 0 ? this.qualificationChips.join(', ') : (formVal.qualification || '');
    const sub = this.subjectChips.length > 0 ? this.subjectChips.join(', ') : (formVal.subTeach || '');

    const reqObj: any = {
      user_id: this.auth.getUserId(),
      first_name: formVal.firstName,
      last_name: formVal.lastName,
      email: formVal.mail,
      mobile_number: formVal.mobile,
      gender: formVal.gender,
      address: formVal.address,
      residence_address: formVal.address,
      about_info: formVal.aboutInfo,
      about_you: formVal.aboutInfo,
      aboutInfo: formVal.aboutInfo,
      language_proficiency: langs,
      languages_known: langs,
      pin_code: formVal.pin,
      pincode: formVal.pin,
      pin: formVal.pin,
      city: formVal.city,
      town: formVal.city,
      state: formVal.state,
      province: formVal.state,
      highest_qualification: qual,
      qualification: qual,
      qualifications: qual,
      experience_in_yrs: formVal.exp,
      experience: formVal.exp,
      exp: formVal.exp,
      subjects_you_teach: sub,
      subTeach: sub,
      curriculum_type: formVal.curriculum,
      curriculum: formVal.curriculum,
      identification_proof_id: formVal.identity,
      bank_name: formVal.bankName,
      bankName: formVal.bankName,
      bank_account_number: formVal.bankAccnum,
      bankAccnum: formVal.bankAccnum,
      IFSC_code: formVal.ifsc,
      ifsc: formVal.ifsc,
    };

    if (this.identityBase64) {
      reqObj.identification_proof_image = [{ image: this.identityBase64, type: 'image/jpeg', upload_type: 'identity' }];
    }
    if (this.ugCertBase64) {
      reqObj.UG_certificate = [{ image: this.ugCertBase64, type: 'image/jpeg', upload_type: 'UG_certificate' }];
    }
    if (this.pgCertBase64) {
      reqObj.PG_certificate = [{ image: this.pgCertBase64, type: 'image/jpeg', upload_type: 'PG_certificate' }];
    }

    this.auth.postService(reqObj, Urls.becometutor).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Teacher profile saved successfully');
          this.editProfileDetails = false;
          const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          const updatedUser = { ...localUser, ...reqObj };
          this.auth.setLocalStorage('user', JSON.stringify(updatedUser));
          this.auth.setLocalStorage('teacherProfile', JSON.stringify(updatedUser));
          this.profileData = updatedUser;
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Failed to save teacher profile');
        }
      },
      error: () => this.helper.presentErrorToast('Error updating teacher profile')
    });
  }

  // Student methods
  patchStudentForm(data: any) {
    if (!data) return;
    let gradeId = data.grade_id || data.grade || '';
    const matchedGrade = this.gradeListData.find((g: any) => g.id == gradeId || g.displayname == gradeId);
    if (matchedGrade) {
      this.studentGradeName = matchedGrade.displayname;
      gradeId = matchedGrade.id;
    } else if (typeof gradeId === 'string') {
      this.studentGradeName = gradeId;
    }

    let curriculumId = data.curriculum_id || data.curriculum || '';
    const matchedCurriculum = this.curriculumList.find((c: any) => c.id == curriculumId || c.curriculum_type == curriculumId);
    if (matchedCurriculum) {
      this.studentCurriculumName = matchedCurriculum.curriculum_type;
      curriculumId = matchedCurriculum.id;
    } else if (typeof curriculumId === 'string') {
      this.studentCurriculumName = curriculumId;
    }

    this.studentForm.patchValue({
      firstName: data?.first_name || '',
      lastName: data?.last_name || '',
      mail: data?.email || data?.mail || '',
      mobile: data?.mobile_number || data?.mobile || '',
      gender: data?.gender || '',
      grade: matchedGrade ? matchedGrade.id : gradeId,
      curriculum: curriculumId,
    });
  }

  getGradeDisplayName(): string {
    const val = this.studentForm.get('grade')?.value;
    if (!val) return this.studentGradeName || '—';
    const found = this.gradeListData.find((g: any) => g.id == val || g.displayname == val);
    return found ? found.displayname : (this.studentGradeName || String(val));
  }

  getCurriculumDisplayName(): string {
    const val = this.studentForm.get('curriculum')?.value;
    if (!val) return this.studentCurriculumName || '—';
    const found = this.curriculumList.find((c: any) => c.id == val || c.curriculum_type == val);
    return found ? found.curriculum_type : (this.studentCurriculumName || String(val));
  }

  setStudentTab(tabName: string) {
    this.activeStudentTab = tabName;
  }

  loadStudentSubscriptions() {
    const currentUserId = this.auth.getUserId();
    if (!currentUserId) return;
    this.auth.postService({ student_id: currentUserId }, Urls.getSubscribedClasses).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.subscribedClassesList = res.ResponseObject;
          const subjects = this.subscribedClassesList.map((item: any) => item.subject || item.title || item.class_name).filter(Boolean);
          this.activeSubscribedSubjects = Array.from(new Set(subjects)).join(', ');
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  getProfileImage(): string {
    if (this.profileBase64) return this.profileBase64;
    if (this.profileData && this.profileData.profile_image) return this.profileData.profile_image;
    return 'app/assets/etutor/avatar.svg';
  }

  handleAvatarError(event: any) {
    event.target.src = 'app/assets/etutor/avatar.svg';
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

    this.auth.postService(payload, Urls.updateStudentProfile).subscribe({
      next: (res: any) => {
        if (res.IsSuccess) {
          this.helper.presentToast('Profile updated successfully');
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

  resetForm() {
    this.editProfileDetails = false;
    this.profileList();
  }

  onLogout() {
    this.auth.signOut();
  }
}
