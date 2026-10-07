import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  public isMyAccountPage: boolean = false;
  private router = inject(Router);

  ngOnInit(): void {
    this.checkUrl(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkUrl(event.urlAfterRedirects);
      });
  }

  private checkUrl(url: string): void {
    this.isMyAccountPage = !!url && url.toLowerCase().includes('/myaccount');
  }
} 
