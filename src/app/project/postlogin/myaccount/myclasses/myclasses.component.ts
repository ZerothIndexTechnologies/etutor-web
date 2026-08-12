import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveClassroomModalComponent } from '../../../../shared/live-classroom-modal/live-classroom-modal.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { TimezoneService } from '../../../../shared/services/timezone.service';

@Component({
  selector: 'app-myclasses',
  standalone: true,
  imports: [CommonModule, FormsModule, LiveClassroomModalComponent],
  templateUrl: './myclasses.component.html',
  styleUrl: './myclasses.component.scss'
})
export class MyclassesComponent implements OnInit {
  public isLiveClassOpen: boolean = false;
  public activeRoomName: string = '';
  public activeRoomTitle: string = '';
  public currentUserName: string = 'Student';

  public timezoneService: TimezoneService = new TimezoneService();
  public selectedTimezone: string = this.timezoneService.getUserTimezone();
  public timezoneList = this.timezoneService.TIMEZONES;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    try {
      const userDetails = this.auth.getUserDetails();
      if (userDetails && userDetails.name) {
        this.currentUserName = userDetails.name;
      } else if (userDetails && userDetails.first_name) {
        this.currentUserName = `${userDetails.first_name} ${userDetails.last_name || ''}`.trim();
      }
    } catch (e) {
      console.warn('Could not fetch user details:', e);
    }
  }

  joinClass(className: string = 'Mathematics Class', sessionTime: string = '10:00 AM') {
    // Generate secure room ID
    const sanitizedTitle = className.replace(/[^a-zA-Z0-9]/g, '_');
    this.activeRoomName = `Etutor_Class_${sanitizedTitle}`;
    this.activeRoomTitle = `${className} (${sessionTime})`;
    this.isLiveClassOpen = true;
  }

  closeLiveClass() {
    this.isLiveClassOpen = false;
  }
}

