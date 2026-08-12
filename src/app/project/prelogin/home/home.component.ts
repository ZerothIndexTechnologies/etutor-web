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
      title: 'Mathematics',
      aliases: ['Mathematics', 'Maths', 'Math'],
    },
    {
      src: 'app/assets/etutor/home_page/english.png',
      title: 'English',
      aliases: ['English'],
    },
    {
      src: 'app/assets/etutor/home_page/science.png',
      title: 'Science',
      aliases: ['Science'],
    },
    {
      src: 'app/assets/etutor/home_page/social.png',
      title: 'Social',
      aliases: ['Social', 'Social Science', 'Social Studies'],
    },
    {
      src: 'app/assets/etutor/home_page/physics.png',
      title: 'Physics',
      aliases: ['Physics'],
    },
    {
      src: 'app/assets/etutor/home_page/chemistry.png',
      title: 'Chemistry',
      aliases: ['Chemistry'],
    },
    {
      src: 'app/assets/etutor/home_page/science.png',
      title: 'Biology',
      aliases: ['Biology'],
    },
    {
      src: 'app/assets/etutor/home_page/yoga.png',
      title: 'Yoga',
      aliases: ['Yoga'],
    },
    {
      src: 'app/assets/etutor/home_page/guitar.png',
      title: 'Guitar',
      aliases: ['Guitar'],
    },
    {
      src: 'app/assets/etutor/home_page/piano.png',
      title: 'Piano',
      aliases: ['Piano'],
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

  protected subjectList: any = [];

  auth = inject(AuthService);
  router = inject(Router);
  constructor() {
    const element = document.getElementById('e-tutor') as HTMLElement;
    if (element) {
      element.style.overflowX = 'hidden';
    }
    
    let subjects = [];
    try {
      const config = this.auth.getLocalStorage(SessionConstants.configData);
      if (config) {
        const parsed = JSON.parse(config);
        subjects = parsed?.subjects || [];
      }
    } catch (e) {
      console.warn('Config data parse error', e);
    }

    if (!subjects || subjects.length === 0) {
      subjects = [
        { subject: 'Mathematics' },
        { subject: 'English' },
        { subject: 'Science' },
        { subject: 'Social' },
        { subject: 'Environment Studies (EVS)' },
        { subject: 'Physics' },
        { subject: 'Chemistry' },
        { subject: 'Biology' },
        { subject: 'Computer Science' },
        { subject: 'Informatics Practices' },
        { subject: 'Accountancy' },
        { subject: 'Business Studies' },
        { subject: 'Economics' },
      ];
    }

    this.subjectList = this.mergeSubjectData(this.subjectListImage, subjects);
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
      const titleName = (item.subject || item.title || '').trim().toLowerCase();
      
      let iconSrc = 'app/assets/etutor/home_page/science.png';

      if (titleName.includes('math')) {
        iconSrc = 'app/assets/etutor/home_page/math.png';
      } else if (titleName.includes('english')) {
        iconSrc = 'app/assets/etutor/home_page/english.png';
      } else if (titleName.includes('physic')) {
        iconSrc = 'app/assets/etutor/home_page/physics.png';
      } else if (titleName.includes('chemist')) {
        iconSrc = 'app/assets/etutor/home_page/chemistry.png';
      } else if (titleName.includes('biol')) {
        iconSrc = 'app/assets/etutor/home_page/science.png';
      } else if (titleName.includes('social') || titleName.includes('evs') || titleName.includes('environ')) {
        iconSrc = 'app/assets/etutor/home_page/social.png';
      } else if (titleName.includes('comput') || titleName.includes('informa') || titleName.includes('program')) {
        iconSrc = 'app/assets/etutor/home_page/book_lesson.svg';
      } else if (titleName.includes('account') || titleName.includes('busi') || titleName.includes('econ')) {
        iconSrc = 'app/assets/etutor/home_page/review_chart.svg';
      } else if (titleName.includes('histor') || titleName.includes('geogr') || titleName.includes('polit') || titleName.includes('psych') || titleName.includes('soci')) {
        iconSrc = 'app/assets/etutor/home_page/share_goal.svg';
      } else if (titleName.includes('hind') || titleName.includes('sanskr') || titleName.includes('tamil') || titleName.includes('language')) {
        iconSrc = 'app/assets/etutor/home_page/english.png';
      } else if (titleName.includes('guitar')) {
        iconSrc = 'app/assets/etutor/home_page/guitar.png';
      } else if (titleName.includes('piano')) {
        iconSrc = 'app/assets/etutor/home_page/piano.png';
      } else if (titleName.includes('yoga') || titleName.includes('sport') || titleName.includes('physic')) {
        iconSrc = 'app/assets/etutor/home_page/yoga.png';
      } else {
        const matched = subjectListImage.find(subj => {
          const primary = subj.title.toLowerCase();
          return titleName === primary || titleName.includes(primary) || primary.includes(titleName);
        });
        if (matched) {
          iconSrc = matched.src;
        }
      }

      return { ...item, src: iconSrc };
    });
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = 'app/assets/etutor/home_page/science.png';
    }
  }
}
