import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  NO_ERRORS_SCHEMA, OnInit,
} from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { AuthService } from '../../../shared/services/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Urls} from "../../../shared/services/urls";
import {NgFor, NgIf} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    MatAccordion,
    MatExpansionPanelHeader,
    MatExpansionPanel,
    NgFor,
    NgIf,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  templateUrl: './teacher_details.component.html',
  styleUrl: './teacher_details.component.scss',
})
export class TeacherDetailsComponent implements OnInit {
  customOptions: OwlOptions = {
    items: 4,
    dots: true,
    nav: false,
    margin: 50,
    autoWidth: true,
    autoHeight: true,
    autoplay: false,
  };
  items = [
    {
      img: 'app/assets/etutor/home_page/tutor_avatar1.svg',
      name: 'Manisha',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar2.svg',
      name: 'widson',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar3.svg',
      name: 'ron',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar4.svg',
      name: 'jensen',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar5.svg',
      name: 'robert',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar1.svg',
      name: 'sujay',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar2.svg',
      name: 'sujay',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
    {
      img: 'app/assets/etutor/home_page/tutor_avatar3.svg',
      name: 'sujay',
      location: 'Bengaluru (online)',
      rating: 4.5,
      price: '₹850/hr',
      description:
        "There are many variations of passengers of Loren Ipsum available, but the  majority suffered alternation in some form, by injected humour, or randomised words which don't look even slighlty believable",
    },
  ];
  customOptions1: OwlOptions = {
    items: 3,
    dots: false,
    nav: false,
    margin: 40,
    autoWidth: true,
    autoHeight: true,
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
  protected router = inject(Router);
  protected teacherDetails: any;
  protected teacherListPayload: any;
  protected teacherList : any = [];
  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(paramMap => {
      this.init()
    });
  }

  ngOnInit() {
  }

  init() {
    this.teacherDetails = JSON.parse(
      this.auth.getLocalStorage('teacher_details')
    );
    this.teacherListPayload = JSON.parse(this.auth.getLocalStorage('subject_TeacherList'));
    console.log(this.teacherListPayload, 'teacherListPayload');
    console.log(this.teacherDetails, 'teachDerTais');
    this.getTeacherList();

  }

  routeToTeacherDetail(data: any) {
    this.auth.setLocalStorage('subject_TeacherList', JSON.stringify(this.teacherListPayload));
    this.auth.setLocalStorage('teacher_details', JSON.stringify(data));
    this.router.navigate(['/teacher/' + data.first_name + '' + data.last_name]);
    window.scrollTo({top: 0})
    // window
  }

  getTeacherList() {
    console.log(this.teacherListPayload, 'teacherListPayload');
    this.auth.postService(this.teacherListPayload, Urls.teacherList).subscribe((successData: any) => {
      // console.log(successData, 'teacherList')
      this.teacherListSuccess(successData);
    }, (error) => {
      console.error(error, 'error_teacherList');
    })
  }

  teacherListSuccess(successData: any = {}) {
    this.teacherList = successData.IsSuccess ? successData.ResponseObject : [];
    this.teacherList.forEach((teacher: any) => {
      teacher.profile_image = ['app/assets/etutor/home_page/tutor_avatar1.svg'];
    });
    this.teacherList = this.teacherList.filter((value: any) => {
      return value.teacher_id != this.teacherDetails.teacher_id
    })
    // console.log(this.teacherList, 'teacgerList');
  }
}
