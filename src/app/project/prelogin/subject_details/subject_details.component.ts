import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { SessionConstants } from '../../../shared/services/sessionConstants';
import { Urls } from '../../../shared/services/urls';
import { EnvironmentService } from '../../../environment.service';
import { NgForOf, NgIf } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    MatAccordion,
    MatExpansionPanelHeader,
    MatExpansionPanel,
    NgIf,
    NgSelectComponent,
    FormsModule,
    NgForOf,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  templateUrl: './subject_details.component.html',
  styleUrl: './subject_details.component.scss',
})
export class SubjectDetailsComponent {
  customOptions: OwlOptions = {
    items: 4,
    dots: true,
    nav: false,
    margin: 50,
    autoWidth: true,
    autoHeight: true,
    autoplay: false,
  };

  protected teacherList: any = [
    {
      teacher_id: '3',
      first_name: 'xxx',
      last_name: 'yyyy',
      gender: 'Male',
      mobile_number: '9000000002',
      email: 'umanatesanuu96@gmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar1.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '7',
      first_name: 'xxx',
      last_name: 'yyyy',
      gender: 'Male',
      mobile_number: '9000000003',
      email: 'umanatesan96@gmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar2.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '19',
    },
    {
      teacher_id: '8',
      first_name: 'sasas',
      last_name: 'saasasasas',
      gender: 'Female',
      mobile_number: '8300674435',
      email: 'asdasdf@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar3.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '9',
      first_name: 'Ahs',
      last_name: 'Dhhd',
      gender: 'Male',
      mobile_number: '8300649484',
      email: 'Arulss@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar4.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '10',
      first_name: 'Cavs',
      last_name: 'Hehdhhd',
      gender: 'Male',
      mobile_number: '864646464664646',
      email: 'Ashha@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar1.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '11',
      first_name: 'Vdbsbd',
      last_name: 'Djdjhd',
      gender: 'Male',
      mobile_number: '864949495995',
      email: 'Vsbsbh@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar2.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '12',
      first_name: 'Bddbdbd',
      last_name: 'Durhhrh',
      gender: 'Male',
      mobile_number: '8436494949',
      email: 'Vdvsbbd@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar4.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '13',
      first_name: 'Asd',
      last_name: 'Dfdf',
      gender: 'Male',
      mobile_number: '86568685656',
      email: 'asdasd@yopmail.com',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar1.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
    {
      teacher_id: '14',
      first_name: '',
      last_name: '',
      gender: 'Male',
      mobile_number: null,
      email: '',
      profile_image: ['app/assets/etutor/home_page/tutor_avatar2.svg'],
      qualifications: 'B.sc(Maths), M.sc(Maths)',
      experience: '3',
      subjects_you_teach: 'maths, science',
      curriculum_type: '0',
      about_you: "i'm a ggid teacher",
      address: 'address 1',
      city: 'chennai',
      state: 'tamilnadu',
      pincode: '600001',
      is_document_uploaded: '1',
      doc_id: '4',
    },
  ];
  customOptions1: OwlOptions = {
    items: 3,
    dots: false,
    nav: false,
    margin: 40,
    autoWidth: false,
    autoHeight: false,
    autoplay: false,
  };
  items1 = [
    {
      img: 'app/assets/etutor/home_page/person_1.png',
      name: 'Willison',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_2.png',
      name: 'Hellena John',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_3.png',
      name: 'Randyson',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_1.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_2.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_3.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/person_1.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/opening_image.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
    {
      img: 'app/assets/etutor/home_page/opening_image.png',
      name: 'Manisha',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
      role: 'Student',
    },
  ];

  protected matExpansionData = ['1', '2', '3', '4', '5'];
  protected auth = inject(AuthService);
  protected environment = inject(EnvironmentService);
  protected router = inject(Router);
  protected subjectDetails: any;
  protected envImg: any;
  protected cityListData: any = [];
  protected languageListData: any = [];
  protected curriculumData: any = [];
  protected gradeListData: any = [];
  protected stateListData: any = [];
  protected selectedStates: any = '21';
  protected selectedCity: any = ['Chennai'];
  protected selectedLanguage: any = ['Tamil'];
  protected selectedGender: any = [];
  protected selectedCurriculum: any = [];
  protected selectedGrade: any = [];
  protected selectedSubject: any = ['english'];
  protected subjectListData: any = [];
  protected genderListData: any = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'others', label: 'Others' },
  ];

  constructor() {
    this.subjectDetails = JSON.parse(this.auth.getLocalStorage(SessionConstants.subject_details));
    console.log(this.subjectDetails);
    this.envImg = this.environment.imgUrl;
    console.log(this.envImg, 'envImg');
    this.subjectListData = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).subjects;
    this.selectedSubject = [this.subjectDetails.subject];
    this.curriculumList();
    this.gradeList();
    this.stateList();
    this.languageList();
    this.getTeacherList();
  }

  routeToTeacherDetail(data: any) {
    const teacherListpayload = {
      filter_by: 'subject',
      filter_value: [this.subjectDetails.subject],
    };
    this.auth.setLocalStorage(
      'subject_TeacherList',
      JSON.stringify(teacherListpayload)
    );
    this.auth.setLocalStorage('teacher_details', JSON.stringify(data));
    this.router.navigate(['/teacher/' + data.first_name + '' + data.last_name]);
  }

  cityList(calledType = '') {
    const teacherListpayload = {
      state_id: this.selectedStates,
    };
    this.auth.postService(teacherListpayload, Urls.citiesList).subscribe((successData: any) => {
        console.log(successData, 'teacherList');
        this.cityListData = successData.IsSuccess ? successData.ResponseObject : [];
        if (calledType != '') {
          this.selectedCity = [];
          this.getTeacherList();
        }
      },
      (error) => {
        console.error(error, 'error_teacherList');
      }
    );
  }
  togglePanel(open: boolean) {
    const panelElement = document.querySelector(
      '.filter-accordion'
    ) as HTMLElement;
    if (panelElement) {
      panelElement.style.overflow = open ? 'visible' : 'hidden';
    }
  }

  curriculumList() {
    this.curriculumData = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).curriculum;
  }

  gradeList() {
    this.gradeListData = JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).grade;
  }

  languageList() {
    this.auth.postService({}, Urls.languageList).subscribe((successData: any) => {
        console.log(successData, 'languageList');
        this.languageListData = successData.IsSuccess ? successData.ResponseObject : [];
      },
      (error) => {
        console.error(error, 'error_teacherList');
      }
    );
  }

  stateList(calledType = '') {
    const stateListpayload = {
      country_id: 105,
    };
    this.auth.postService(stateListpayload, Urls.statesList).subscribe((successData: any) => {
        console.log(successData, 'statesList');
        this.stateListData = successData.IsSuccess ? successData.ResponseObject : [];
        this.cityList(calledType);
      },
      (error) => {console.error(error, 'error_teacherList');}
    );
  }

  getTeacherList() {
    const teacherListpayload = {
      filter_by_city: this.selectedCity ?? [],
      filter_by_language: this.selectedLanguage ?? [],
      filter_by_subject: this.selectedSubject ?? [],
      filter_by_gender: this.selectedGender ?? [],
      filter_by_curriculum: this.selectedCurriculum ?? [],
      filter_by_grade: this.selectedGrade ?? [],
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
    this.teacherList = successData.IsSuccess ? successData.ResponseObject : [];
    this.teacherList.forEach((teacher: any) => {
      teacher.profile_image = ['app/assets/etutor/home_page/tutor_avatar1.svg'];
    });
  }
}
