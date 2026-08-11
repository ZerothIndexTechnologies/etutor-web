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
    this.api.get(Urls.getConfiguration).subscribe((data: any) => {
      if (data) {
        this.auth.setLocalStorage(SessionConstants.configData, JSON.stringify(data));
      }
    });
  }

}
