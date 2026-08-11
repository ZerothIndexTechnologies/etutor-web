import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../shared/services/auth.service';
import {ReactiveFormsModule} from '@angular/forms';
import {NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {ApiService} from "../../../../shared/services/api.service";
import {HttpClient} from "@angular/common/http";
import {Urls} from "../../../../shared/services/urls";
import {NgSelectComponent} from "@ng-select/ng-select";
import {SessionConstants} from "../../../../shared/services/sessionConstants";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgSelectComponent, RouterLink],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent {
  teacherForm: FormGroup;
  studentForm: FormGroup;
  profileBase64: any;
  proFileupld: any;
  public teacherStatus = '0';
  auth = inject(AuthService);
  api = inject(ApiService);
  public profileData: any = {}
  public gradeListData: any = [];
  public curriculumList: any = [];
  public editProfileDetails = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.gradeListData = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).grade;
    this.curriculumList = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).curriculum;
    this.teacherForm = this.fb.group({
      subject: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      language: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      identification: ['', Validators.required],
      qualification: ['', Validators.required],
      duration: ['', Validators.required],
      mail: ['', Validators.required, Validators.email],
      address: ['', Validators.required],
    });
    this.studentForm = this.fb.group({
      pName: ['', Validators.required],
      gender: ['', Validators.required],
      mobile: ['', Validators.required],
      class: ['', [Validators.required]],
      school: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
    });
    this.profileList();
  }

  profileList() {
    const payload = {
      filter_by: 'teacher',
      filter_value: this.auth.getUserId()
    }
    const url = this.auth.getUserType === '1' ? Urls.teacherProfile : Urls.studentProfile;
    this.auth.postService(this.auth.getUserType === '1' ? payload: {}, url).subscribe((successData: any) => {
      console.log(successData, 'successData');
      if (successData.IsSuccess) {
        this.profileData = successData.ResponseObject.length != 0 ? successData.ResponseObject[0] : {};
        console.log(this.profileData, 'profileData');
      }
    }, (error) => console.error(error, 'error_profile_list'))
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
    this.router.navigate(['myaccount/change-password'])
  }


}
