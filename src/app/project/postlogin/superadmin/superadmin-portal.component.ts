import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { HelperService } from '../../../shared/services/helper.service';
import { Urls } from '../../../shared/services/urls';
import { SessionConstants } from '../../../shared/services/sessionConstants';

@Component({
  selector: 'app-superadmin-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './superadmin-portal.component.html',
  styleUrl: './superadmin-portal.component.scss'
})
export class SuperAdminPortalComponent implements OnInit {
  public activeTab: string = 'dashboard';

  // Dashboard Stats
  public stats: any = {
    totalTeachers: 0,
    pendingTeachers: 0,
    totalStudents: 0,
    activeSubscriptions: 0,
    totalClasses: 0,
    liveClasses: 0,
    totalRevenue: 45000
  };

  // Teachers & Bank Details
  public teacherList: any[] = [];
  public teacherFilter: string = '';
  public selectedTeacher: any = null;
  public rejectionNotes: string = '';
  public showTeacherModal: boolean = false;

  // Students & Subscriptions
  public studentList: any[] = [];

  // Country & State Setup
  public countryList: any[] = [];
  public stateList: any[] = [];
  public selectedCountryId: number = 1;

  // Fee Config
  public feeConfigList: any[] = [];
  public newFeeConfig: any = {
    country_id: 1,
    state_id: 1,
    curriculum_id: 1,
    grade_id: 9,
    subject: 'Mathematics',
    monthly_fee: 1000,
    quarterly_fee: 2800,
    halfyearly_fee: 5400,
    yearly_fee: 10000
  };
  public showFeeModal: boolean = false;

  // Transactions
  public studentTxns: any[] = [];
  public teacherPayouts: any[] = [];

  // Teacher Payout Filters
  public payoutFilter: any = {
    country_id: 0,
    state_id: 0,
    curriculum_id: 0,
    subject: ''
  };

  // Payment Settings
  public paymentGateways: any[] = [];

  private auth = inject(AuthService);
  private helper = inject(HelperService);
  private router = inject(Router);

  ngOnInit(): void {
    // Check Admin Session Guard
    const roleId = this.auth.getRoleId();
    if (roleId !== '1') {
      this.helper.presentErrorToast('Access restricted to SuperAdmin.');
      this.router.navigate(['/superadmin/login']);
      return;
    }

    this.loadDashboardStats();
    this.loadTeachers();
    this.loadStudents();
    this.loadCountries();
    this.loadStates();
    this.loadFeeConfigs();
    this.loadStudentTransactions();
    this.loadTeacherTransactions();
    this.loadPaymentSettings();
  }

  setTab(tabName: string): void {
    this.activeTab = tabName;
  }

  // 1. Dashboard
  loadDashboardStats(): void {
    this.auth.postService<any>({}, Urls.adminDashboardStats).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && res.ResponseObject) {
          this.stats = res.ResponseObject;
        }
      }
    });
  }

  // 2. Teachers List & Details / Verification
  loadTeachers(): void {
    const payload = { filter_by: this.teacherFilter };
    this.auth.postService<any>(payload, Urls.adminTeachersList).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.teacherList = res.ResponseObject;
        }
      }
    });
  }

  openTeacherDetails(teacher: any): void {
    this.selectedTeacher = teacher;
    this.rejectionNotes = teacher.rejection_notes || '';
    this.showTeacherModal = true;
  }

  closeTeacherModal(): void {
    this.showTeacherModal = false;
    this.selectedTeacher = null;
  }

  verifyTeacher(status: string): void {
    if (!this.selectedTeacher) return;
    if (status === '2' && !this.rejectionNotes) {
      this.helper.presentErrorToast('Please provide rejection notes.');
      return;
    }

    const payload = {
      teacher_id: this.selectedTeacher.teacher_id || this.selectedTeacher.id,
      is_account_verified: status,
      rejection_notes: this.rejectionNotes
    };

    this.auth.postService<any>(payload, Urls.adminVerifyTeacher).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          const actionText = status === '1' ? 'APPROVED' : 'REJECTED';
          this.helper.presentToast(`Teacher & Bank details ${actionText}!`);
          this.closeTeacherModal();
          this.loadTeachers();
          this.loadDashboardStats();
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Action failed.');
        }
      }
    });
  }

  // 3. Students List & Subscriptions
  loadStudents(): void {
    this.auth.postService<any>({}, Urls.adminStudentsList).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.studentList = res.ResponseObject;
        }
      }
    });
  }

  toggleStudentSubscription(student: any, newStatus: string): void {
    const payload = {
      student_id: student.student_id || student.id,
      status: newStatus
    };
    this.auth.postService<any>(payload, Urls.adminVerifySubscription).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Subscription status updated.');
          this.loadStudents();
        }
      }
    });
  }

  // 4. Country & State Setup
  loadCountries(): void {
    this.auth.postService<any>({}, Urls.adminCountries).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.countryList = res.ResponseObject;
        }
      }
    });
  }

  toggleCountryStatus(country: any): void {
    const newStatus = country.status == 1 ? 0 : 1;
    this.auth.postService<any>({ country_id: country.id, status: newStatus }, Urls.adminUpdateCountryStatus).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Country status updated.');
          this.loadCountries();
        }
      }
    });
  }

  loadStates(): void {
    this.auth.postService<any>({ country_id: this.selectedCountryId }, Urls.adminStates).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.stateList = res.ResponseObject;
        }
      }
    });
  }

  toggleStateStatus(state: any): void {
    const newStatus = state.status == 1 ? 0 : 1;
    this.auth.postService<any>({ state_id: state.id, status: newStatus }, Urls.adminUpdateStateStatus).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('State status updated.');
          this.loadStates();
        }
      }
    });
  }

  // 5. Curriculum & Fees Config
  loadFeeConfigs(): void {
    this.auth.postService<any>({}, Urls.adminFeeConfigs).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.feeConfigList = res.ResponseObject;
        }
      }
    });
  }

  saveFeeConfig(): void {
    this.auth.postService<any>(this.newFeeConfig, Urls.adminSaveFeeConfig).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Fee configuration saved!');
          this.showFeeModal = false;
          this.loadFeeConfigs();
        }
      }
    });
  }

  // 6. Student & Teacher Transactions
  loadStudentTransactions(): void {
    this.auth.postService<any>({}, Urls.adminStudentTransactions).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.studentTxns = res.ResponseObject;
        }
      }
    });
  }

  loadTeacherTransactions(): void {
    this.auth.postService<any>(this.payoutFilter, Urls.adminTeacherTransactions).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.teacherPayouts = res.ResponseObject;
        }
      }
    });
  }

  applyPayoutFilters(): void {
    this.loadTeacherTransactions();
  }

  // 7. Payment Settings & Gateways
  loadPaymentSettings(): void {
    this.auth.postService<any>({}, Urls.adminPaymentSettings).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && Array.isArray(res.ResponseObject)) {
          this.paymentGateways = res.ResponseObject;
        }
      }
    });
  }

  togglePaymentGateway(gw: any): void {
    const newStatus = gw.is_enabled == 1 ? 0 : 1;
    this.auth.postService<any>({ id: gw.id, is_enabled: newStatus }, Urls.adminUpdatePaymentSettings).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast('Payment setting updated.');
          this.loadPaymentSettings();
        }
      }
    });
  }

  // Logout
  logoutAdmin(): void {
    localStorage.clear();
    this.helper.presentToast('SuperAdmin logged out securely.');
    this.router.navigate(['/superadmin/login']);
  }
}
