import {Component, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {FooterComponent} from './layout/footer/footer.component';
import {HeaderComponent} from './layout/header/header.component';
import {MaterialCoreModule} from './shared/modules/materialcore.module';
import {ApiService} from './shared/services/api.service';
import {Urls} from './shared/services/urls';
import {AuthService} from './shared/services/auth.service';
import {SessionConstants} from './shared/services/sessionConstants';
import {PostHeaderComponent} from './layout/post-header/post-header.component';
import {filter} from "rxjs";
import {DatePipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    PostHeaderComponent,
    MaterialCoreModule,
    NgIf,
  ],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Etutor';
  api = inject(ApiService);
  auth = inject(AuthService);
  currentUrl: string = '';

  constructor(private router: Router, public datePipe: DatePipe) {
  }

  ngOnInit() {
    // const currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? '';
    // this.auth.setLocalStorage('lastLoggedInDay', currentDate);
    // console.log(currentDate, 'todayDate');
    this.getConfigData();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        console.log('Current URL:', this.currentUrl);
      });
  }

  getConfigData() {
    this.api.get(Urls.getConfiguration).subscribe({
      next: (data: any) => {
        if (data) {
          const govSubjects = [
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
          const currentSubjects = data.subjects || [];
          const combined = [...currentSubjects, ...govSubjects];
          const uniqueMap = new Map();
          combined.forEach((item: any) => {
            const name = (item.subject_name || item.subject || String(item)).trim();
            if (name && !uniqueMap.has(name.toLowerCase())) {
              uniqueMap.set(name.toLowerCase(), item);
            }
          });
          data.subjects = Array.from(uniqueMap.values());
          this.auth.setLocalStorage(SessionConstants.configData, JSON.stringify(data));
        }
      },
      error: (err) => {
        console.warn('Could not fetch remote configuration, using fallback configData:', err);
        const fallbackConfig = {
          grade: [
            { id: 1, displayname: '1 Grade' }, { id: 2, displayname: '2 Grade' },
            { id: 3, displayname: '3 Grade' }, { id: 4, displayname: '4 Grade' },
            { id: 5, displayname: '5 Grade' }, { id: 6, displayname: '6 Grade' },
            { id: 7, displayname: '7 Grade' }, { id: 8, displayname: '8 Grade' },
            { id: 9, displayname: '9 Grade' }, { id: 10, displayname: '10 Grade' },
            { id: 11, displayname: '11 Grade' }, { id: 12, displayname: '12 Grade' }
          ],
          curriculum: [
            { id: 1, curriculum_type: 'CBSE' }, { id: 2, curriculum_type: 'ICSE' },
            { id: 3, curriculum_type: 'State Board' }, { id: 4, curriculum_type: 'IB' },
            { id: 5, curriculum_type: 'IGCSE' }
          ],
          subjects: [
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
          ]
        };
        const existing = this.auth.getLocalStorage(SessionConstants.configData);
        if (!existing || existing === 'null' || existing === 'undefined') {
          this.auth.setLocalStorage(SessionConstants.configData, JSON.stringify(fallbackConfig));
        }
      }
    });
  }

}
