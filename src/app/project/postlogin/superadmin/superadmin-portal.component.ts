import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../shared/services/auth.service';
import { HelperService } from '../../../shared/services/helper.service';
import { Urls } from '../../../shared/services/urls';
import { SessionConstants } from '../../../shared/services/sessionConstants';
import { AppDatePipe } from '../../../shared/pipes/app-date.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-superadmin-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppDatePipe],
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

  // Document Viewer Modal State
  public showDocPreviewModal: boolean = false;
  public previewDocTitle: string = '';
  public previewDocUrl: string = '';
  public safePreviewUrl: SafeResourceUrl | null = null;

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
  private sanitizer = inject(DomSanitizer);

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

  private blobUrlCache: Map<string, string> = new Map();
  private safeUrlCache: Map<string, SafeResourceUrl> = new Map();

  // Document Inspection & Resolution Helpers
  getBaseUrl(): string {
    if (environment && environment.siteBaseUrl) {
      const base = environment.siteBaseUrl.replace(/\/+$/, '');
      if (environment.production) {
        return base + '/e-tution';
      }
      return base;
    }
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
      }
      return window.location.origin + '/e-tution';
    }
    return '';
  }

  convertBase64ToBlobUrl(dataUrl: string): string {
    if (!dataUrl || typeof dataUrl !== 'string') return '';
    if (!dataUrl.startsWith('data:')) return dataUrl;
    if (this.blobUrlCache.has(dataUrl)) {
      return this.blobUrlCache.get(dataUrl)!;
    }

    try {
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx === -1) return dataUrl;

      const header = dataUrl.substring(0, commaIdx);
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      
      let rawData = dataUrl.substring(commaIdx + 1);

      // 1. URL decode if it contains % (e.g. %2B, %2F)
      if (rawData.includes('%')) {
        try {
          rawData = decodeURIComponent(rawData);
        } catch (e) {}
      }

      // 2. Remove all whitespace, newlines, tabs
      rawData = rawData.replace(/[\r\n\s]/g, '');

      // 3. Convert URL-safe base64 characters (- and _) to standard (+ and /)
      rawData = rawData.replace(/-/g, '+').replace(/_/g, '/');

      // 4. Strip existing padding '=' to calculate true remainder
      let unpadded = rawData.replace(/=+$/, '');

      // 5. Filter to only valid base64 characters [A-Za-z0-9+/]
      unpadded = unpadded.replace(/[^A-Za-z0-9+/]/g, '');

      // 6. Handle remainder safely (remainder of 1 means truncated character, slice it off)
      const remainder = unpadded.length % 4;
      if (remainder === 1) {
        unpadded = unpadded.slice(0, -1);
      } else if (remainder === 2) {
        unpadded += '==';
      } else if (remainder === 3) {
        unpadded += '=';
      }

      if (unpadded.length === 0) return '';

      const binaryStr = atob(unpadded);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      this.blobUrlCache.set(dataUrl, blobUrl);
      return blobUrl;
    } catch (e) {
      return '';
    }
  }

  formatDocUrl(doc: any): string {
    if (!doc) return '';

    if (Array.isArray(doc)) {
      if (doc.length === 0) return '';
      return this.formatDocUrl(doc[0]);
    }

    if (typeof doc === 'object') {
      if (doc.image) return this.formatDocUrl(doc.image);
      if (doc.url) return this.formatDocUrl(doc.url);
      if (doc.path) return this.formatDocUrl(doc.path);
      return '';
    }

    if (typeof doc !== 'string') return '';
    const trimmed = doc.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[]' || trimmed === '{}') return '';

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.formatDocUrl(parsed[0]);
        }
        return '';
      } catch (e) {
        // Not valid JSON array
      }
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.image) return this.formatDocUrl(parsed.image);
        if (parsed.url) return this.formatDocUrl(parsed.url);
        if (parsed.path) return this.formatDocUrl(parsed.path);
      } catch (e) {
        // Not valid JSON object
      }
    }

    if (trimmed.startsWith('uploads/') || trimmed.startsWith('/uploads/') || trimmed.startsWith('assets/')) {
      const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
      return this.getBaseUrl() + cleanPath;
    }

    let resolved = trimmed;
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
      resolved = trimmed;
    } else if (trimmed.startsWith('/9j/')) {
      resolved = 'data:image/jpeg;base64,' + trimmed;
    } else if (trimmed.startsWith('iVBORw0KGgo')) {
      resolved = 'data:image/png;base64,' + trimmed;
    } else if (trimmed.startsWith('R0lGOD')) {
      resolved = 'data:image/gif;base64,' + trimmed;
    } else if (trimmed.startsWith('UklGR')) {
      resolved = 'data:image/webp;base64,' + trimmed;
    } else if (trimmed.startsWith('JVBERi0') || trimmed.startsWith('JVBERi')) {
      resolved = 'data:application/pdf;base64,' + trimmed;
    } else if (trimmed.length > 80 && !trimmed.includes(' ') && !trimmed.includes('/')) {
      resolved = 'data:image/jpeg;base64,' + trimmed;
    }

    if (resolved.startsWith('data:')) {
      return this.convertBase64ToBlobUrl(resolved);
    }
    return resolved;
  }

  getSafeDocUrl(doc: any): SafeResourceUrl | string {
    const url = this.formatDocUrl(doc);
    if (!url) return '';
    if (this.safeUrlCache.has(url)) {
      return this.safeUrlCache.get(url)!;
    }
    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.safeUrlCache.set(url, safe);
    return safe;
  }

  hasDocument(doc: any): boolean {
    return !!this.formatDocUrl(doc);
  }

  isPdf(doc: any): boolean {
    if (!doc) return false;
    const raw = typeof doc === 'string' ? doc.toLowerCase() : '';
    if (raw.includes('application/pdf') || raw.startsWith('jvberi') || raw.includes('.pdf')) return true;
    const url = this.formatDocUrl(doc);
    return url.startsWith('data:application/pdf') || url.toLowerCase().includes('.pdf');
  }

  isImage(doc: any): boolean {
    if (!doc) return false;
    const raw = typeof doc === 'string' ? doc : '';
    if (raw.startsWith('data:image') || raw.startsWith('/9j/') || raw.startsWith('iVBORw0KGgo') || raw.startsWith('R0lGOD') || raw.startsWith('UklGR')) return true;
    if (raw.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/)) return true;
    const url = this.formatDocUrl(doc);
    if (!url) return false;
    if (url.startsWith('data:image') || url.startsWith('blob:')) return true;
    return url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/) !== null;
  }

  getTeacherIdProof(teacher: any): string {
    if (!teacher) return '';
    return this.formatDocUrl(teacher.identification_image || teacher.doc_identification_image || teacher.identification_proof_image || teacher.id_proof);
  }

  getTeacherUgCert(teacher: any): string {
    if (!teacher) return '';
    return this.formatDocUrl(teacher.certificate_UG || teacher.doc_certificate_UG || teacher.UG_certificate || teacher.ug_certificate);
  }

  getTeacherPgCert(teacher: any): string {
    if (!teacher) return '';
    return this.formatDocUrl(teacher.certificate_PG || teacher.doc_certificate_PG || teacher.PG_certificate || teacher.pg_certificate);
  }

  getTeacherOtherCert(teacher: any): string {
    if (!teacher) return '';
    return this.formatDocUrl(teacher.other_certification || teacher.doc_other_certification || teacher.other_certificates);
  }

  openDocumentPreview(title: string, rawDoc: string): void {
    const docUrl = this.formatDocUrl(rawDoc);
    if (!docUrl) {
      this.helper.presentErrorToast('No document file attached.');
      return;
    }
    this.previewDocTitle = title;
    this.previewDocUrl = docUrl;
    this.safePreviewUrl = this.getSafeDocUrl(rawDoc);
    this.showDocPreviewModal = true;
  }

  closeDocPreviewModal(): void {
    this.showDocPreviewModal = false;
    this.previewDocTitle = '';
    this.previewDocUrl = '';
    this.safePreviewUrl = null;
  }

  openDocumentWindow(rawDoc: string): void {
    const docUrl = this.formatDocUrl(rawDoc);
    if (!docUrl) {
      this.helper.presentErrorToast('No document file attached.');
      return;
    }
    const win = window.open();
    if (win) {
      if (this.isPdf(rawDoc)) {
        win.document.write(`<title>Document Preview</title><iframe src="${docUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100vh;" allowfullscreen></iframe>`);
      } else {
        win.document.write(`<title>Image Preview</title><body style="margin:0; background:#111; display:flex; justify-content:center; align-items:center; min-height:100vh;"><img src="${docUrl}" style="max-width:95%; max-height:95vh; object-fit:contain; border-radius:8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" /></body>`);
      }
    } else {
      this.helper.presentErrorToast('Pop-up blocked. Please allow pop-ups to view documents.');
    }
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
    this.auth.signOut();
  }
}
