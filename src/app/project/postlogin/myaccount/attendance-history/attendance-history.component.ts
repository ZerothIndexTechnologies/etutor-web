import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { Urls } from '../../../../shared/services/urls';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-history.component.html',
  styleUrl: './attendance-history.component.scss'
})
export class AttendanceHistoryComponent implements OnInit {
  public attendanceHistoryList: any[] = [];
  public loading: boolean = false;
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.loadAttendanceHistory();
  }

  loadAttendanceHistory(): void {
    this.loading = true;
    const payload = { student_id: this.auth.getUserId() };
    this.auth.postService<any>(payload, Urls.getAttendanceHistory).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.attendanceHistoryList = res.ResponseObject;
        } else {
          this.attendanceHistoryList = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
      }
    });
  }
}
