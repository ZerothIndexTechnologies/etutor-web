import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Urls } from '../../../shared/services/urls';
import { HelperService } from '../../../shared/services/helper.service';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {CustomValidationService} from "../../../shared/services/customValidations.service";

@Component({
  selector: 'app-become-tutor',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgForOf, NgIf],
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
  profileBase64: any;
  identityBase64: any;
  ugCertBase64: any;
  pgCertBase64: any;
  otherCertBase64: any = [];
  curriculumList: any;
  proofList: any;
  langChips: string[] = [];
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

  ngOnInit(): void {
    this.onCollapseStepper(1);
    const configData = JSON.parse(this.auth.getLocalStorage('configData'));
    this.curriculumList =
      configData.curriculum.length > 0 ? configData.curriculum : [];
    this.proofList =
      configData.identification_proof.length > 0
        ? configData.identification_proof
        : [];
    console.log(this.proofList, 'profiel')
    this.stepper2.controls['identity'].patchValue('Aadhar Card');
    this.stepper2.controls['identity'].disable();
  }

  onCollapseStepper(v: any) {
    if (v == 1) {
      this.showFirst = true;
      this.showSecond = false;
      this.showThird = false;
      this.showFourth = false;
      this.showFive = false;
    }
    if (v == 2) {
      this.showFirst = false;
      this.showSecond = true;
      this.showThird = false;
      this.showFourth = false;
      this.showFive = false;
    }
    if (v == 3) {
      this.showFirst = false;
      this.showSecond = false;
      this.showThird = true;
      this.showFourth = false;
      this.showFive = false;
    }
    if (v == 4) {
      this.showFirst = false;
      this.showSecond = false;
      this.showThird = false;
      this.showFourth = true;
      this.showFive = false;
    }
  }

  stepSubmit(v: number) {
    if (v == 2) {
      if (this.langChips.length > 0) {
        this.stepper.controls['language'].patchValue(this.langChips);
      }

      if (this.stepper.invalid) {
        this.customValidater.validateAllFormFields(this.stepper);
        this.helper.presentErrorToast('Form is Invalid');
        return;
      } else if (!this.profileBase64) {
        this.helper.presentErrorToast('Upload profile');
        return;
      }
      this.showFirst = false;
      this.showSecond = true;
      this.showThird = false;
      this.showFourth = false;
      this.showFive = false;
    }
    if (v == 3) {
      if (this.qualificationChips.length > 0) {
        this.stepper1.controls['qualification'].patchValue(
          this.qualificationChips
        );
      }
      if (this.subjectChips.length > 0) {
        this.stepper1.controls['subTeach'].patchValue(this.subjectChips);
      }
      if (this.stepper1.invalid) {
        this.customValidater.validateAllFormFields(this.stepper1);
        this.helper.presentErrorToast('Form is Invalid');
        return;
      }

      this.showFirst = false;
      this.showSecond = false;
      this.showThird = true;
      this.showFourth = false;
      this.showFive = false;
    }
    if (v == 4) {
      if (this.stepper2.invalid) {
        this.customValidater.validateAllFormFields(this.stepper2);
        this.helper.presentErrorToast('Form is Invalid');
        return;
      } else if (!this.identityBase64) {
        this.helper.presentErrorToast('Upload the mandatory documents');
        return;
      }
      console.log(this.stepper2, 'dasda');
      this.showFirst = false;
      this.showSecond = false;
      this.showThird = false;
      this.showFourth = true;
      this.showFive = false;
    }
    if (v == 5) {
      if (!this.ugCertBase64 || !this.pgCertBase64) {
        this.helper.presentErrorToast('Upload the mandatory documents');
        return;
      } else {
        this.onFinalSubmit();
      }
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
      first_name: this.auth.getUserDetails().first_name,
      last_name: this.auth.getUserDetails().last_name,
      email: this.auth.getUserDetails().email,
      mobile_number: this.auth.getUserDetails().mobile_number,
      profile_image: [
        {
          image: this.profileBase64,
          type: 'image/jpeg',
          upload_type: 'profile_image',
        },
      ],
      about_you: this.stepper.value.aboutInfo,
      address: this.stepper.value.address,
      city: this.stepper.value.city,
      state: this.stepper.value.state,
      pincode: this.stepper.value.pin,
      language_proficiency: this.stepper.value.language.toString(),
      qualification: this.stepper1.value.qualification.toString(),
      experience_in_yrs: this.stepper1.value.exp,
      subjects_you_teach: this.stepper1.value.subTeach.toString(),
      curriculum_type: this.stepper1.value.curriculum,
      identification_proof_id: this.stepper2.controls['identity'].value,
      identification_proof_image: [
        {
          image: this.identityBase64,
          type: 'image/jpeg',
          upload_type: 'identity',
        },
      ],
      bank_name: this.stepper2.value.bankName,
      bank_account_number: this.stepper2.value.bankAccnum,
      IFSC_code: this.stepper2.value.ifsc,
      UG_certificate: [
        {
          image: this.ugCertBase64,
          type: 'image/jpeg',
          upload_type: 'UG_certificate',
        },
      ],
      PG_certificate: [
        {
          image: this.pgCertBase64,
          type: 'image/jpeg',
          upload_type: 'PG_certificate',
        },
      ],
      other_certificates: otherDoc,
    };
    console.log(reqObj, 'asdasd')
    return this.auth.postService(reqObj, Urls.becometutor).subscribe({
      next: (successData) => {
        if (successData.IsSuccess) {
          this.showFirst = false;
          this.showSecond = false;
          this.showThird = false;
          this.showFourth = false;
          this.showFive = true;
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
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'profile') {
        this.profileBase64 = reader.result;
      } else if (type === 'identity') {
        this.identityBase64 = reader.result;
      } else if (type === 'ug') {
        this.ugCertBase64 = reader.result;
      } else if (type === 'pg') {
        this.pgCertBase64 = reader.result;
      } else {
        this.otherCertBase64.push(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  handleKeyDown(event: any, type: any): void {
    let control: any;
    if (type === 'language') {
      control = this.stepper.get('language');
    } else if (type === 'qualification') {
      control = this.stepper1.get('qualification');
    } else {
      control = this.stepper1.get('subTeach');
    }

    if (
      (event.key === 'Enter' || event.key === ',') &&
      control?.value.trim() !== ''
    ) {
      event.preventDefault();
      if (type == 'language') {
        this.addChip(control?.value.trim());
      } else if (type == 'qualification') {
        this.addQualificationChip(control?.value.trim());
      } else {
        this.addSubjectChip(control?.value.trim());
      }
      control?.reset();
    } else if (event.key === 'Backspace' && control?.value === '') {
      if (type == 'language') {
        this.removeLastChip();
      } else if (type == 'qualification') {
        this.removeQualificationLastChip();
      } else {
        this.removeSubjectLastChip();
      }
    }
  }

  addChip(text: string): void {
    this.langChips.push(text);
  }

  removeChip(chip: string): void {
    this.langChips = this.langChips.filter((c) => c !== chip);
  }

  removeLastChip(): void {
    this.langChips.pop();
  }

  addQualificationChip(text: string): void {
    this.qualificationChips.push(text);
  }

  removeQualificationChip(chip: string): void {
    this.qualificationChips = this.qualificationChips.filter((c) => c !== chip);
  }

  removeQualificationLastChip(): void {
    this.qualificationChips.pop();
  }

  addSubjectChip(text: string): void {
    this.subjectChips.push(text);
  }

  removeSubjectChip(chip: string): void {
    this.subjectChips = this.subjectChips.filter((c) => c !== chip);
  }

  removeSubjectLastChip(): void {
    this.subjectChips.pop();
  }

  getCityAndStateListByPincode() {
    if (this.stepper.value.pin.trim().length == 6) {
      const payload = {
        pincode: this.stepper.value.pin
      };
      this.auth.postService(payload, Urls.getStateByPincode).subscribe((successData: any) => {
        console.log(successData, 'suuccesData');
        if (successData.IsSuccess) {
          this.stepper.get('city')?.patchValue(successData.ResponseObject.city)
          this.stepper.get('state')?.patchValue(successData.ResponseObject.state)
        }
      }, (error: any) => console.error(error, 'error_Pincode'))
    }
  }
}
