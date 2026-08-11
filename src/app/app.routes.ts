import { Routes } from '@angular/router';
import { HomeComponent } from './project/prelogin/home/home.component';
import { AboutUsComponent } from './project/prelogin/about-us/about-us.component';
import { OurAppComponent } from './project/prelogin/our-app/our-app.component';
import { ContactComponent } from './project/prelogin/contact/contact.component';
import { LoginComponent } from './project/prelogin/login/login.component';
import { SignUpComponent } from './project/prelogin/sign-up/sign-up.component';
import { MyaccountModule } from './project/postlogin/myaccount/myaccount.module';
import { BecomeTutorComponent } from './project/postlogin/become-tutor/become-tutor.component';
import { AuthGuard } from './shared/services/auth.guard';
import { SubjectDetailsComponent } from './project/prelogin/subject_details/subject_details.component';
import { TeacherDetailsComponent } from './project/prelogin/teacher_details/teacher_details.component';
import { PlansSubscriptionComponent } from './plans-subscription/plans-subscription.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'subject/:id',
    component: SubjectDetailsComponent,
  },
  {
    path: 'teacher/:id',
    component: TeacherDetailsComponent,
  },
  {
    path: 'aboutus',
    component: AboutUsComponent,
  },
  {
    path: 'ourapp',
    component: OurAppComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'tutor',
    canActivate: [AuthGuard],
    component: BecomeTutorComponent,
  },
  {
    path: 'myaccount',
    canActivate: [AuthGuard],
    loadChildren: () => MyaccountModule,
  },
  {
    path: 'subscription',
    component: PlansSubscriptionComponent,
  },
];
