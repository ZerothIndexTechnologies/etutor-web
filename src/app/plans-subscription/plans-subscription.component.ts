import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-plans-subscription',
  standalone: true,
  imports: [NgClass],
  templateUrl: './plans-subscription.component.html',
  styleUrl: './plans-subscription.component.scss',
})
export class PlansSubscriptionComponent implements OnInit {
  showCard: boolean;
  constructor() {
    this.showCard = true;
  }

  ngOnInit(): void {}

  showFields(): void {
    this.showCard = !this.showCard;
  }
}
