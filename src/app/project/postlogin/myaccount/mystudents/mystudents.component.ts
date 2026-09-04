import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { HelperService } from '../../../../shared/services/helper.service';
import { Urls } from '../../../../shared/services/urls';

@Component({
  selector: 'app-mystudents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mystudents.component.html',
  styleUrl: './mystudents.component.scss'
})
export class MyStudentsComponent implements OnInit {
  public studentList: any[] = [];
  public selectedStudent: any = null;
  public showDetailModal: boolean = false;
  public loading: boolean = false;

  private auth = inject(AuthService);
  private helper = inject(HelperService);

  ngOnInit(): void {
    this.loadMyStudents();
  }

  loadMyStudents(): void {
    this.loading = true;
    const userId = this.auth.getUserId();
    this.auth.postService<any>({ teacher_id: userId }, Urls.getTeacherStudents).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.studentList = res.ResponseObject;
        } else {
          this.studentList = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  openStudentDetails(student: any): void {
    this.selectedStudent = student;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedStudent = null;
  }

  sendReminder(student: any): void {
    const payload = {
      student_id: student.student_id || student.id,
      class_id: 1
    };
    this.auth.postService<any>(payload, Urls.sendClassReminderEmail).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast(`10-Minute Class Reminder Email sent to ${student.name}!`);
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Failed to send reminder.');
        }
      },
      error: (err: any) => {
        this.helper.presentErrorToast('Failed to send reminder alert.');
      }
    });
  }
}
