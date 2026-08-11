import { Component, inject, OnDestroy } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import {SessionConstants} from "../../../shared/services/sessionConstants";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy {
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

  private subjectListImage = [
    {
      src: 'app/assets/etutor/home_page/math.png',
      title: 'Maths',
      link: '/maths',
    },
    {
      src: 'app/assets/etutor/home_page/english.png',
      title: 'English',
      link: '/english',
    },
    {
      src: 'app/assets/etutor/home_page/yoga.png',
      title: 'Yoga',
      link: '/yoga',
    },
    {
      src: 'app/assets/etutor/home_page/guitar.png',
      title: 'Guitar',
      link: '/guitar',
    },
    {
      src: 'app/assets/etutor/home_page/piano.png',
      title: 'Piano',
      link: '/piano',
    },
    {
      src: 'app/assets/etutor/home_page/social.png',
      title: 'Social Science',
      link: '/social',
    },
    {
      src: 'app/assets/etutor/home_page/science.png',
      title: 'Science',
      link: '/science',
    },
    {
      src: 'app/assets/etutor/home_page/chemistry.png',
      title: 'Chemistry',
      link: '/chemistry',
    },
    {
      src: 'app/assets/etutor/home_page/physics.png',
      title: 'Physics',
      link: '/physics',
    },
  ];

  protected subjectList: any = [];

  icons = [
    {
      src: 'app/assets/etutor/home_page/math.png',
      title: 'Maths',
      link: '/maths',
    },
    {
      src: 'app/assets/etutor/home_page/english.png',
      title: 'English',
      link: '/english',
    },
    {
      src: 'app/assets/etutor/home_page/yoga.png',
      title: 'Yoga',
      link: '/yoga',
    },
    {
      src: 'app/assets/etutor/home_page/guitar.png',
      title: 'Guitar',
      link: '/guitar',
    },
    {
      src: 'app/assets/etutor/home_page/math.png',
      title: 'Maths',
      link: '/maths',
    },
    {
      src: 'app/assets/etutor/home_page/english.png',
      title: 'English',
      link: '/english',
    },
    {
      src: 'app/assets/etutor/home_page/yoga.png',
      title: 'Yoga',
      link: '/yoga',
    },
    {
      src: 'app/assets/etutor/home_page/guitar.png',
      title: 'Guitar',
      link: '/guitar',
    },
  ];

  course_list = [
    { name: 'Dance' },
    { name: 'Physics' },
    { name: 'Hindi' },
    { name: 'Geography' },
    { name: 'Python' },
    { name: 'Accounting' },
    { name: 'German' },
    { name: 'Computer Programming' },
    { name: 'Biology' },
    { name: 'Basic Computer' },
    { name: 'Badminton' },
    { name: 'Chemistry' },
    { name: 'Sanskrit' },
    { name: 'Tamil' },
    { name: 'Microsoft Excel' },
    { name: 'Drawing' },
    { name: 'Social Science' },
  ];

  auth = inject(AuthService);
  router = inject(Router);
  constructor() {
    const element = document.getElementById('e-tutor') as HTMLElement;
    if (element) {
      element.style.overflowX = 'hidden';
    }
    console.log(JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)), 'confifDara');
    this.subjectList = this.mergeSubjectData(this.subjectListImage, JSON.parse(this.auth.getLocalStorage(SessionConstants.configData)).subjects);
  }

  ngOnDestroy() {
    const element = document.getElementById('e-tutor') as HTMLElement;
    if (element) {
      element.style.overflowX = 'auto';
    }
  }

  routeToSubjectDetail(data: any) {
    this.auth.setLocalStorage(SessionConstants.subject_details, JSON.stringify(data));
    this.router.navigate(['/subject/' + data.subject]);
  }

  mergeSubjectData(subjectListImage: any[], array2: any[]): any[] {
    return array2.map(item => {
      const matchedSubject = subjectListImage.find(subject => subject.title === item.subject);
      if (matchedSubject) {
        return { ...item, src: matchedSubject.src };
      } else {
        return item;
      }
    });
  }
}
