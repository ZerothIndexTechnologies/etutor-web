import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansSubscriptionComponent } from './plans-subscription.component';

describe('PlansSubscriptionComponent', () => {
  let component: PlansSubscriptionComponent;
  let fixture: ComponentFixture<PlansSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansSubscriptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlansSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
