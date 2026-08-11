import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../project/prelogin/login/login.component';
import { SignUpComponent } from '../../project/prelogin/sign-up/sign-up.component';
import {filter} from "rxjs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  menus: any = [
    {
      name: 'Home',
      url: '',
      active: true,
    },
    {
      name: 'About Us',
      url: 'aboutus',
      active: false,
    },
    {
      name: 'Our App',
      url: 'ourapp',
      active: false,
    },
    {
      name: 'Contact',
      url: 'contact',
      active: false,
    },
  ];
  public currentUrl = '';

  constructor(private router: Router, private dialog: MatDialog) {
    this.router.events
      .pipe(filter((event) : event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event : NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        this.menus.forEach((items: any) => {
          const menuName = items.name.replace(/\s/g, "");
          items.active = this.currentUrl.toLowerCase().includes(menuName.toLowerCase());
        })
      });
  }

  ngOnInit(): void {
  }

  // i -  get the clicked menu index
  menuNavigation(obj: any, i: any): any {
    this.menus.forEach((a: any, indx: any) => {
      a.active = i === indx;
    });
    this.router.navigateByUrl(obj.url);
  }

  // to open login popup

  onLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '800px',
      height: '680px',
      panelClass: 'my-dialog',
      data: '',
      hasBackdrop: true,
      disableClose: false,
    });
  }

  // to open sign up popup

  onSingUp() {
    const dialogRef = this.dialog.open(SignUpComponent, {
      width: '900px',
      height: '680px',
      panelClass: 'my-dialog',
      data: '',
      hasBackdrop: true,
      disableClose: false,
    });
  }

  toTutor() {
    this.router.navigateByUrl('tutor');
  }
}
