import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveClassListComponent } from './reserve-class-list.component';

describe('AddClassComponent', () => {
  let component: ReserveClassListComponent;
  let fixture: ComponentFixture<ReserveClassListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserveClassListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReserveClassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
