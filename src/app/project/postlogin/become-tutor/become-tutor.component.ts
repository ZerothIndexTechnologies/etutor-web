import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { Urls } from '../../../shared/services/urls';
import { HelperService } from '../../../shared/services/helper.service';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { CustomValidationService } from "../../../shared/services/customValidations.service";
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-become-tutor',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgForOf, NgIf, DecimalPipe, NgSelectModule],
  templateUrl: './become-tutor.component.html',
  styleUrl: './become-tutor.component.scss',
})
export class BecomeTutorComponent implements OnInit {
  showFirst: any;
  showSecond: any;
  showThird: any;
  showFourth: any;
  showFive: any;
  stepper: FormGroup;
  stepper1: FormGroup;
  stepper2: FormGroup;
  auth = inject(AuthService);
  helper = inject(HelperService);
  customValidater = inject(CustomValidationService);
  router = inject(Router);
  teacherStatus: string = '0';
  rejectionNotes: string = '';
  checkingStatus: boolean = true;
  profileBase64: any;
  identityBase64: any;
  ugCertBase64: any;
  pgCertBase64: any;
  otherCertBase64: any = [];
  curriculumList: any;
  proofList: any;
  langChips: string[] = [];
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
  proFileupld: any;
  identityFile: any;
  ugFile: any;
  pgFile: any;
  otherFile: any = [];
  user: any;

  constructor(private fb: FormBuilder) {
    this.user = JSON.parse(this.auth.getLocalStorage('user'));

    this.stepper = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required]],
      address: ['', Validators.required],
      aboutInfo: ['', Validators.required],
      language: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pin: ['', Validators.required],
    });

    this.stepper1 = this.fb.group({
      qualification: ['', Validators.required],
      exp: ['', Validators.required],
      subTeach: ['', Validators.required],
      curriculum: ['', Validators.required],
    });

    this.stepper2 = this.fb.group({
      identity: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccnum: ['', Validators.required],
      ifsc: ['', Validators.required],
    });
  }

  getFullName(): string {
    if (!this.user) return 'TEACHER PROFILE';
    let first = (this.user.first_name || this.user.given_name || '').trim();
    let last = (this.user.last_name || this.user.family_name || '').trim();
    if (!first && !last && (this.user.name || this.user.full_name)) {
      const parts = (this.user.name || this.user.full_name).trim().split(' ');
      first = parts[0] || '';
      last = parts.slice(1).join(' ') || '';
    }
    const fullName = `${first} ${last}`.trim();
    return fullName ? fullName.toUpperCase() : 'TEACHER PROFILE';
  }

  get isApplicationSubmitted(): boolean {
    if (this.showFive) return true;
    const u = this.user || this.auth.getUserDetails() || {};
    
    // Safety check: Ensure profile does not belong to dummy record (e.g. JOHN V)
    const currentEmail = (this.auth.getUserDetails()?.email || u.email || '').toLowerCase().trim();
    if (u.first_name === 'JOHN' && u.last_name === 'V' && currentEmail !== 'john@example.com') {
      return false;
    }

    const status = String(this.teacherStatus || u.is_account_verified || '0');
    if (status === '1' || status === 'true') return false;

    return !!(
      (u.is_document_uploaded == '1' || u.is_document_uploaded === 1 || u.is_document_uploaded === true) ||
      u.application_submitted === true ||
      u.is_submitted === true
    );
  }

  ngOnInit(): void {
    this.onCollapseStepper(1);

    // If teacher account is already verified, do not show Become Tutor page -> redirect to My Account
    const uCheck = this.user || this.auth.getUserDetails() || {};
    if (this.auth.isTeacherUser && (this.auth.isTeacherVerified || uCheck.is_account_verified == '1' || uCheck.is_account_verified == 1)) {
      this.router.navigateByUrl('myaccount/myclasses/list');
      return;
    }

    // Sanitize user object to clear any legacy dummy record pollution (e.g. JOHN V, Johnson GM)
    const currentEmail = (this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    const isDummyName = (this.user && (
      (this.user.first_name === 'JOHN' && this.user.last_name === 'V' && currentEmail !== 'john@example.com') ||
      (this.user.first_name === 'Johnson' && (this.user.last_name === 'GM' || !this.user.last_name) && currentEmail !== 'johnson@example.com')
    ));
    if (isDummyName) {
      delete this.user.first_name;
      delete this.user.last_name;
      delete this.user.mobile_number;
      delete this.user.is_document_uploaded;
      delete this.user.application_submitted;
      delete this.user.address;
      delete this.user.about_you;
      delete this.user.qualifications;
      this.auth.setLocalStorage('user', JSON.stringify(this.user));
    }

    const configData = JSON.parse(this.auth.getLocalStorage('configData') || '{}');
    this.curriculumList =
      configData && configData.curriculum && configData.curriculum.length > 0 ? configData.curriculum : [];
    this.proofList =
      configData && configData.identification_proof && configData.identification_proof.length > 0
        ? configData.identification_proof
        : [
            { proof_type: 'Aadhar Card' },
            { proof_type: 'PAN Card' },
            { proof_type: 'Passport' },
            { proof_type: 'Voter ID' },
            { proof_type: 'Driving License' }
          ];
    console.log(this.proofList, 'profiel');
    if (!this.stepper2.controls['identity'].value) {
      this.stepper2.controls['identity'].patchValue('Aadhar Card');
    }
    this.stepper2.controls['identity'].enable();

    // 1. Patch from user object stored in localStorage
    if (this.user) {
      this.patchData(this.user);
    }

    // 2. Patch from Auth userDetails getter
    const userDetails = this.auth.getUserDetails();
    if (userDetails) {
      this.patchData(userDetails);
    }

    // 3. Patch from saved teacher profile if cached in localStorage
    const savedProfile = JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}');
    if (savedProfile && Object.keys(savedProfile).length > 0) {
      this.patchData(savedProfile);
    }

    // 4. Fetch teacher profile from backend API and patch (STRICT USER FILTERING ONLY)
    const currentUserId = String(this.auth.getUserId() || '').trim();
    const userEmail = (this.auth.getUserDetails()?.email || '').toLowerCase().trim();
    const userMobile = String(this.auth.getUserDetails()?.mobile_number || '').trim();

    if (currentUserId && currentUserId !== 'null') {
      const payload = {
        filter_by: 'teacher',
        filter_value: currentUserId,
        user_id: currentUserId,
        teacher_id: currentUserId
      };
      this.auth.postService(payload, Urls.teacherProfile).subscribe({
        next: (res: any) => {
          if (res.IsSuccess && res.ResponseObject) {
            let teacherData: any = null;

            if (Array.isArray(res.ResponseObject)) {
              teacherData = res.ResponseObject.find((item: any) => {
                const itemUserId = item.user_id ? String(item.user_id).trim() : '';
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
            } else if (res.ResponseObject && typeof res.ResponseObject === 'object') {
              const objUserId = res.ResponseObject.user_id ? String(res.ResponseObject.user_id).trim() : '';
              const objEmail = res.ResponseObject.email ? String(res.ResponseObject.email).toLowerCase().trim() : '';
              if (
                (currentUserId && objUserId && objUserId === currentUserId) ||
                (userEmail && objEmail && objEmail === userEmail)
              ) {
                teacherData = res.ResponseObject;
              }
            }

            if (teacherData) {
              this.patchData(teacherData);
            } else {
              // No teacher record exists in backend for this user => reset submission flags
              if (this.user) {
                this.user.is_document_uploaded = false;
                this.user.application_submitted = false;
                if (this.user.first_name === 'JOHN' && this.user.last_name === 'V') {
                  delete this.user.first_name;
                  delete this.user.last_name;
                  delete this.user.mobile_number;
                }
                this.auth.setLocalStorage('user', JSON.stringify(this.user));
              }
              const u = this.auth.getUserDetails();
              if (u) {
                u.is_document_uploaded = false;
                u.application_submitted = false;
                if (u.first_name === 'JOHN' && u.last_name === 'V') {
                  delete u.first_name;
                  delete u.last_name;
                  delete u.mobile_number;
                }
                this.auth.setUserDetails('user', u);
              }
            }
          }
        },
        error: (err: any) => console.error(err, 'error fetching teacher profile for patch')
      });
    }

    // 5. Fetch teacher status from backend API
    if (this.auth.getUserId()) {
      this.checkingStatus = true;
      const userEmail = (this.auth.getUserDetails()?.email || '').toLowerCase().trim();
      const statusPayload = {
        id: this.auth.getUserId().toString(),
        user_id: this.auth.getUserId(),
        email: userEmail
      };
      const statusUrl = 'common/notifyTeacherProfileStatus?id=' + this.auth.getUserId().toString();
      this.auth.postService(statusPayload, statusUrl).subscribe({
        next: (res: any) => {
          this.checkingStatus = false;
          if (res.IsSuccess && res.ResponseObject) {
            const status = String(res.ResponseObject.is_account_verified ?? '0');
            this.teacherStatus = status;
            this.rejectionNotes = res.ResponseObject.rejection_notes ?? '';

            const u = this.auth.getUserDetails() || {};
            u.is_account_verified = status;
            this.user = { ...this.user, ...u, is_account_verified: status };
            this.auth.setUserDetails('user', this.user);

            if (status === '1' || status === 'true') {
              this.router.navigateByUrl('myaccount/myclasses/list');
            }
          }
        },
        error: (err: any) => {
          this.checkingStatus = false;
          console.error(err, 'error checking status');
        }
      });
    } else {
      this.checkingStatus = false;
    }
  }

  patchData(data: any): void {
    if (!data) return;

    const loggedInEmail = (this.auth.getUserDetails()?.email || this.user?.email || '').toLowerCase().trim();
    const loggedInUserId = String(this.auth.getUserId() || '').trim();

    // Verification check: ensure incoming data belongs to THIS logged-in user
    if (data.email && loggedInEmail && String(data.email).toLowerCase().trim() !== loggedInEmail) {
      console.warn('Ignoring patchData: incoming email', data.email, 'does not match logged-in user email', loggedInEmail);
      return;
    }
    if (data.user_id && loggedInUserId && loggedInUserId !== 'null' && String(data.user_id).trim() !== loggedInUserId) {
      console.warn('Ignoring patchData: incoming user_id', data.user_id, 'does not match logged-in user_id', loggedInUserId);
      return;
    }

    // Clean merge: update this.user properties only with non-empty values from incoming data
    const currentObj = this.user || {};
    const updatedObj = { ...currentObj };
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== 'null' && String(val).trim() !== 'undefined') {
        if (Array.isArray(val) && val.length === 0 && Array.isArray(updatedObj[key]) && updatedObj[key].length > 0) {
          continue;
        }
        updatedObj[key] = val;
      }
    }
    this.user = updatedObj;

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

    // Helper to safely retrieve non-empty value across backend response, active user object, and local storage cache
    const getVal = (...keys: string[]): string => {
      const sources = [
        data,
        this.user,
        this.auth.getUserDetails(),
        JSON.parse(this.auth.getLocalStorage('user') || '{}'),
        JSON.parse(this.auth.getLocalStorage('teacherProfile') || '{}')
      ];
      for (const src of sources) {
        if (!src) continue;
        for (const k of keys) {
          if (src[k] !== undefined && src[k] !== null && String(src[k]).trim() !== '' && String(src[k]).trim() !== 'null' && String(src[k]).trim() !== 'undefined') {
            return String(src[k]).trim();
          }
        }
      }
      return '';
    };

    // Step 1 (Personal Details)
    const emailVal = getVal('email', 'email_id', 'user_email', 'mail');
    const mobileVal = getVal('mobile_number', 'mobile', 'phone', 'phone_number', 'contact_number');
    const addressVal = getVal('address', 'residence_address');
    const aboutVal = getVal('about_you', 'about_info', 'aboutInfo', 'bio', 'about', 'comment', 'description', 'user_about', 'teacher_about');
    const cityVal = getVal('city', 'town', 'district');
    const stateVal = getVal('state', 'province', 'region');
    const pinVal = getVal('pincode', 'pin_code', 'pin', 'zip_code', 'zip');

    if (emailVal) this.stepper.controls['email'].patchValue(emailVal);
    if (mobileVal) this.stepper.controls['mobile_number'].patchValue(mobileVal);
    if (addressVal) this.stepper.controls['address'].patchValue(addressVal);
    if (aboutVal) this.stepper.controls['aboutInfo'].patchValue(aboutVal);
    if (cityVal) this.stepper.controls['city'].patchValue(cityVal);
    if (stateVal) this.stepper.controls['state'].patchValue(stateVal);
    if (pinVal) this.stepper.controls['pin'].patchValue(pinVal);

    // Languages Known
    const langs = data.languages_known || data.language_proficiency || data.languages || data.language;
    const parsedLangs = parseList(langs);
    if (parsedLangs.length > 0) {
      this.selectedLanguages = Array.from(new Set([...this.selectedLanguages, ...parsedLangs]));
      this.langChips = [...this.selectedLanguages];
      this.stepper.controls['language'].patchValue(this.selectedLanguages.join(', '));
    }

    // Step 2 (Qualifications & Teaching Details)
    const qualVal = getVal('qualifications', 'highest_qualification', 'qualification');
    const expVal = getVal('experience', 'experience_in_yrs', 'exp', 'total_experience');
    const subVal = getVal('subjects_you_teach', 'subjects', 'subTeach', 'subject');
    const currVal = getVal('curriculum_type', 'curriculum', 'curriculum_id');

    if (qualVal) this.stepper1.controls['qualification'].patchValue(qualVal);
    if (expVal) this.stepper1.controls['exp'].patchValue(expVal);
    if (subVal) this.stepper1.controls['subTeach'].patchValue(subVal);
    if (currVal) this.stepper1.controls['curriculum'].patchValue(currVal);

    const parsedQual = parseList(qualVal);
    if (parsedQual.length > 0) {
      this.qualificationChips = Array.from(new Set([...this.qualificationChips, ...parsedQual]));
      this.stepper1.controls['qualification'].patchValue(this.qualificationChips.join(', '));
    }

    const parsedSub = parseList(subVal);
    if (parsedSub.length > 0) {
      this.subjectChips = Array.from(new Set([...this.subjectChips, ...parsedSub]));
      this.stepper1.controls['subTeach'].patchValue(this.subjectChips.join(', '));
    }

    // Step 3 (Bank & Identity Details)
    const proofId = getVal('identification_proof_id', 'identification', 'identity_type', 'identity', 'identification_proof') || 'Aadhar Card';
    const bName = getVal('bank_name', 'bankName', 'bank');
    const bAcc = getVal('bank_account_number', 'account_number', 'bankAccnum', 'account_no');
    const ifscCode = getVal('IFSC_code', 'ifsc_code', 'ifsc', 'ifscCode');

    if (proofId) this.stepper2.controls['identity'].patchValue(proofId);
    if (bName) this.stepper2.controls['bankName'].patchValue(bName);
    if (bAcc) this.stepper2.controls['bankAccnum'].patchValue(bAcc);
    if (ifscCode) this.stepper2.controls['ifsc'].patchValue(ifscCode);

    // Profile Image & Documents
    const profileImg = data.profile_image || data.picture || data.avatar || data.image;
    if (profileImg) {
      if (typeof profileImg === 'string' && (profileImg.startsWith('data:image') || profileImg.startsWith('http'))) {
        this.profileBase64 = profileImg;
      } else if (Array.isArray(profileImg) && profileImg.length > 0) {
        this.profileBase64 = profileImg[0].image || profileImg[0];
      } else if (typeof profileImg === 'string' && profileImg) {
        this.profileBase64 = profileImg;
      }
    }

    if (data.identification_proof_image) {
      if (typeof data.identification_proof_image === 'string') {
        this.identityBase64 = data.identification_proof_image;
      } else if (Array.isArray(data.identification_proof_image) && data.identification_proof_image.length > 0) {
        this.identityBase64 = data.identification_proof_image[0].image || data.identification_proof_image[0];
      }
    }

    if (data.UG_certificate) {
      if (typeof data.UG_certificate === 'string') {
        this.ugCertBase64 = data.UG_certificate;
      } else if (Array.isArray(data.UG_certificate) && data.UG_certificate.length > 0) {
        this.ugCertBase64 = data.UG_certificate[0].image || data.UG_certificate[0];
      }
    }

    if (data.PG_certificate) {
      if (typeof data.PG_certificate === 'string') {
        this.pgCertBase64 = data.PG_certificate;
      } else if (Array.isArray(data.PG_certificate) && data.PG_certificate.length > 0) {
        this.pgCertBase64 = data.PG_certificate[0].image || data.PG_certificate[0];
      }
    }
  }

  onLanguageChange(event: any): void {
    const val = Array.isArray(event) ? event.join(',') : (event || '');
    this.stepper.controls['language'].patchValue(val);
  }

  submittedStep1 = false;
  submittedStep2 = false;
  submittedStep3 = false;

  setActiveStep(step: number): void {
    this.showFirst = step === 1;
    this.showSecond = step === 2;
    this.showThird = step === 3;
    this.showFourth = step === 4;
    this.showFive = step === 5;
  }

  validateStep1(): boolean {
    this.submittedStep1 = true;
    if (this.selectedLanguages && this.selectedLanguages.length > 0) {
      this.stepper.controls['language'].patchValue(this.selectedLanguages.join(','));
    } else if (this.langChips && this.langChips.length > 0) {
      this.stepper.controls['language'].patchValue(this.langChips.join(','));
    } else {
      this.stepper.controls['language'].patchValue('');
    }
    this.stepper.markAllAsTouched();
    this.customValidater.validateAllFormFields(this.stepper);

    if (this.stepper.invalid) {
      return false;
    }
    if (!this.profileBase64 && !this.user?.profile_image && !this.user?.is_document_uploaded && !this.user?.address) {
      return false;
    }
    return true;
  }

  validateStep2(): boolean {
    this.submittedStep2 = true;
    if (this.qualificationChips.length > 0) {
      this.stepper1.controls['qualification'].patchValue(this.qualificationChips.join(','));
    }
    if (this.subjectChips.length > 0) {
      this.stepper1.controls['subTeach'].patchValue(this.subjectChips.join(','));
    }
    this.stepper1.markAllAsTouched();
    this.customValidater.validateAllFormFields(this.stepper1);

    if (this.stepper1.invalid) {
      return false;
    }
    return true;
  }

  validateStep3(): boolean {
    this.submittedStep3 = true;
    this.stepper2.markAllAsTouched();
    this.customValidater.validateAllFormFields(this.stepper2);

    if (this.stepper2.invalid) {
      return false;
    }
    if (!this.identityBase64 && !this.user?.is_document_uploaded) {
      return false;
    }
    return true;
  }

  validateStep4(): boolean {
    if (!this.ugCertBase64 && !this.user?.is_document_uploaded) {
      return false;
    }
    return true;
  }

  isStepCompleted(step: number): boolean {
    if (step === 1) return this.stepper?.valid && ((this.selectedLanguages && this.selectedLanguages.length > 0) || (this.langChips && this.langChips.length > 0) || !!this.stepper.get('language')?.value);
    if (step === 2) return this.stepper1?.valid && (this.qualificationChips.length > 0 || !!this.stepper1.get('qualification')?.value);
    if (step === 3) return this.stepper2?.valid && (!!this.identityBase64 || !!this.user?.is_document_uploaded);
    if (step === 4) return !!(this.ugCertBase64 || this.user?.is_document_uploaded);
    if (step === 5) return !!this.showFive;
    return false;
  }

  onCollapseStepper(v: any) {
    const target = Number(v);
    if (target === 1) {
      this.setActiveStep(1);
      return;
    }

    // Require Step 1 validation for target steps >= 2
    if (!this.validateStep1()) {
      this.helper.presentErrorToast('Please fill all mandatory fields in Step 1 (Personal Details) first.');
      return;
    }
    if (target === 2) {
      this.setActiveStep(2);
      return;
    }

    // Require Step 2 validation for target steps >= 3
    if (!this.validateStep2()) {
      this.helper.presentErrorToast('Please fill all mandatory fields in Step 2 (Teaching Experience) first.');
      return;
    }
    if (target === 3) {
      this.setActiveStep(3);
      return;
    }

    // Require Step 3 validation for target steps >= 4
    if (!this.validateStep3()) {
      this.helper.presentErrorToast('Please fill all mandatory fields in Step 3 (Identity & Bank Details) first.');
      return;
    }
    if (target === 4) {
      this.setActiveStep(4);
      return;
    }

    // Require Step 4 validation for target steps >= 5
    if (!this.validateStep4()) {
      this.helper.presentErrorToast('Please upload mandatory documents in Step 4 first.');
      return;
    }
    if (target === 5) {
      this.setActiveStep(5);
    }
  }

  stepSubmit(v: number) {
    if (v == 2) {
      if (!this.validateStep1()) {
        this.helper.presentErrorToast('Please fill all required fields in Step 1 before proceeding.');
        return;
      }
      this.setActiveStep(2);
    }
    if (v == 3) {
      if (!this.validateStep2()) {
        this.helper.presentErrorToast('Please fill all required qualification fields in Step 2 before proceeding.');
        return;
      }
      this.setActiveStep(3);
    }
    if (v == 4) {
      if (!this.validateStep3()) {
        this.helper.presentErrorToast('Please fill all required bank and identity fields in Step 3 before proceeding.');
        return;
      }
      this.setActiveStep(4);
    }
    if (v == 5) {
      if (!this.validateStep4()) {
        this.helper.presentErrorToast('Please upload mandatory degree certificates in Step 4 before submitting.');
        return;
      }
      this.onFinalSubmit();
    }
  }

  onFinalSubmit() {
    console.log(this.otherCertBase64, 'multi');
    console.log(this.stepper2.value.identity, 'identity');
    console.log(this.stepper2.value, 'stepper');
    let otherDoc: any = [];
    this.otherCertBase64.forEach((file: any) => {
      otherDoc.push({
        image: file,
        type: 'image/jpeg',
        upload_type: 'other_certificate',
      });
    });
    const reqObj: any = {
      user_id: this.auth.getUserId(),
      role_id: this.auth.getRoleId(),
      first_name: this.auth.getUserDetails()?.first_name || '',
      last_name: this.auth.getUserDetails()?.last_name || '',
      email: this.stepper.value.email || this.auth.getUserDetails()?.email || '',
      mobile_number: this.stepper.value.mobile_number || this.auth.getUserDetails()?.mobile_number || '',
      profile_image: [
        {
          image: this.profileBase64,
          type: 'image/jpeg',
          upload_type: 'profile_image',
        },
      ],
      about_you: this.stepper.value.aboutInfo,
      about_info: this.stepper.value.aboutInfo,
      aboutInfo: this.stepper.value.aboutInfo,
      address: this.stepper.value.address,
      residence_address: this.stepper.value.address,
      city: this.stepper.value.city,
      town: this.stepper.value.city,
      state: this.stepper.value.state,
      province: this.stepper.value.state,
      pincode: this.stepper.value.pin,
      pin_code: this.stepper.value.pin,
      pin: this.stepper.value.pin,
      language_proficiency: this.stepper.value.language.toString(),
      languages_known: this.stepper.value.language.toString(),
      qualification: this.stepper1.value.qualification.toString(),
      highest_qualification: this.stepper1.value.qualification.toString(),
      qualifications: this.stepper1.value.qualification.toString(),
      experience_in_yrs: this.stepper1.value.exp,
      experience: this.stepper1.value.exp,
      exp: this.stepper1.value.exp,
      subjects_you_teach: this.stepper1.value.subTeach.toString(),
      subTeach: this.stepper1.value.subTeach.toString(),
      curriculum_type: this.stepper1.value.curriculum,
      curriculum: this.stepper1.value.curriculum,
      identification_proof_id: this.stepper2.controls['identity'].value,
      identification_proof_image: [
        {
          image: this.identityBase64,
          type: 'image/jpeg',
          upload_type: 'identity',
        },
      ],
      bank_name: this.stepper2.value.bankName,
      bankName: this.stepper2.value.bankName,
      bank_account_number: this.stepper2.value.bankAccnum,
      bankAccnum: this.stepper2.value.bankAccnum,
      IFSC_code: this.stepper2.value.ifsc,
      ifsc: this.stepper2.value.ifsc,
      UG_certificate: this.ugCertBase64 ? [
        {
          image: this.ugCertBase64,
          type: 'image/jpeg',
          upload_type: 'UG_certificate',
        },
      ] : [],
      PG_certificate: this.pgCertBase64 ? [
        {
          image: this.pgCertBase64,
          type: 'image/jpeg',
          upload_type: 'PG_certificate',
        },
      ] : [],
      other_certificates: otherDoc,
    };
    console.log(reqObj, 'asdasd')
    return this.auth.postService(reqObj, Urls.becometutor).subscribe({
      next: (successData: any) => {
        if (successData.IsSuccess) {
          this.showFirst = false;
          this.showSecond = false;
          this.showThird = false;
          this.showFourth = false;
          this.showFive = true;
          const localUser = JSON.parse(this.auth.getLocalStorage('user') || '{}');
          const newUserId = successData.user_id || successData.teacher_id;
          if (newUserId) {
            this.auth.setLocalStorage('user_id', JSON.stringify(newUserId));
          }
          const updatedUser = { ...localUser, ...reqObj, user_id: newUserId || localUser.user_id, teacher_id: newUserId || localUser.teacher_id, is_document_uploaded: true, application_submitted: true };
          this.user = updatedUser;
          this.auth.setLocalStorage('user', JSON.stringify(updatedUser));
          this.auth.setLocalStorage('teacherProfile', JSON.stringify(updatedUser));
          this.helper.presentToast(successData.ResponseObject);
          return true;
        } else {
          this.helper.presentErrorToast(
            successData.ErrorObject ? successData.ErrorObject : 'Failed'
          );
          return false;
        }
      },
    });
  }

  onFileSelected(event: Event, type: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'profile') {
        this.proFileupld = input.files[0];
        console.log(this.proFileupld, 'profile')
      } else if (type === 'identity') {
        this.identityFile = input.files[0];
      } else if (type === 'ug') {
        this.ugFile = input.files[0];
      } else if (type === 'pg') {
        this.pgFile = input.files[0];
      } else {
        Array.from(input.files).forEach((file: File) => {
          this.otherFile.push(file);
          this.convertToBase64(file, type);
        });
        return;
      }
      this.convertToBase64(file, type);
    }
  }

  convertToBase64(file: File, type: any): void {
    if (file.type && file.type.startsWith('image/') && file.size > 800 * 1024) {
      this.compressImage(file, 1600, 0.82, (compressedDataUrl: string) => {
        this.assignBase64(type, compressedDataUrl);
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.assignBase64(type, reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  private assignBase64(type: any, result: string): void {
    if (type === 'profile') {
      this.profileBase64 = result;
    } else if (type === 'identity') {
      this.identityBase64 = result;
    } else if (type === 'ug') {
      this.ugCertBase64 = result;
    } else if (type === 'pg') {
      this.pgCertBase64 = result;
    } else {
      this.otherCertBase64.push(result);
    }
  }

  private compressImage(file: File, maxDimension: number, quality: number, callback: (result: string) => void): void {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e: any) => {
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          callback(dataUrl);
        } else {
          callback(e.target.result);
        }
      };
      img.onerror = () => {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  qualInputText: string = '';
  subjectInputText: string = '';

  handleKeyDown(event: any, type: any): void {
    const val = (event.target as HTMLInputElement).value || '';
    if ((event.key === 'Enter' || event.key === ',') && val.trim() !== '') {
      event.preventDefault();
      if (type === 'language') {
        this.addChip(val.trim());
      } else if (type === 'qualification') {
        this.addQualificationChip(val.trim());
      } else if (type === 'subjectTeach' || type === 'subject') {
        this.addSubjectChip(val.trim());
      }
    } else if (event.key === 'Backspace' && val === '') {
      if (type === 'language') {
        this.removeLastChip();
      } else if (type === 'qualification') {
        this.removeQualificationLastChip();
      } else if (type === 'subjectTeach' || type === 'subject') {
        this.removeSubjectLastChip();
      }
    }
  }

  addChip(text: string): void {
    if (text && !this.langChips.includes(text)) {
      this.langChips.push(text);
    }
  }

  removeChip(chip: string): void {
    this.langChips = this.langChips.filter((c) => c !== chip);
  }

  removeLastChip(): void {
    this.langChips.pop();
  }

  addQualificationChip(text: string): void {
    const trimmed = text ? text.trim() : '';
    if (trimmed && !this.qualificationChips.includes(trimmed)) {
      this.qualificationChips.push(trimmed);
    }
    this.stepper1.controls['qualification'].patchValue(this.qualificationChips.join(','));
    this.qualInputText = '';
  }

  removeQualificationChip(chip: string): void {
    this.qualificationChips = this.qualificationChips.filter((c) => c !== chip);
    this.stepper1.controls['qualification'].patchValue(this.qualificationChips.join(','));
  }

  removeQualificationLastChip(): void {
    this.qualificationChips.pop();
    this.stepper1.controls['qualification'].patchValue(this.qualificationChips.join(','));
  }

  addSubjectChip(text: string): void {
    const trimmed = text ? text.trim() : '';
    if (trimmed && !this.subjectChips.includes(trimmed)) {
      this.subjectChips.push(trimmed);
    }
    this.stepper1.controls['subTeach'].patchValue(this.subjectChips.join(','));
    this.subjectInputText = '';
  }

  removeSubjectChip(chip: string): void {
    this.subjectChips = this.subjectChips.filter((c) => c !== chip);
    this.stepper1.controls['subTeach'].patchValue(this.subjectChips.join(','));
  }

  removeSubjectLastChip(): void {
    this.subjectChips.pop();
    this.stepper1.controls['subTeach'].patchValue(this.subjectChips.join(','));
  }

  addQualOnBlur(): void {
    if (this.qualInputText && this.qualInputText.trim()) {
      this.addQualificationChip(this.qualInputText);
    }
  }

  addSubjectOnBlur(): void {
    if (this.subjectInputText && this.subjectInputText.trim()) {
      this.addSubjectChip(this.subjectInputText);
    }
  }

  getCityAndStateListByPincode() {
    // Automatic city & state selection via pincode removed per user requirement
  }
}
