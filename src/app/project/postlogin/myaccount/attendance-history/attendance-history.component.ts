import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { Urls } from '../../../../shared/services/urls';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { AppDatePipe } from '../../../../shared/pipes/app-date.pipe';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule, FormsModule, CapitalizePipe, AppDatePipe],
  templateUrl: './attendance-history.component.html',
  styleUrl: './attendance-history.component.scss'
})
export class AttendanceHistoryComponent implements OnInit {
  public attendanceHistoryList: any[] = [];
  public filteredList: any[] = [];
  public paginatedList: any[] = [];
  public loading: boolean = false;

  // Filter properties
  public searchTerm: string = '';
  public selectedSubject: string = 'ALL';
  public selectedStatus: string = 'ALL';
  public selectedSort: string = 'NEWEST';
  public subjects: string[] = [];

  // Pagination properties
  public currentPage: number = 1;
  public pageSize: number = 5;
  public totalPages: number = 1;
  public pageSizeOptions: number[] = [5, 10, 20, 50];

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
        this.extractSubjects();
        this.applyFilters();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching attendance history:', err);
        this.attendanceHistoryList = [];
        this.extractSubjects();
        this.applyFilters();
      }
    });
  }

  extractSubjects(): void {
    const subjSet = new Set<string>();
    this.attendanceHistoryList.forEach(item => {
      const sub = item.subject || item.title;
      if (sub) {
        subjSet.add(sub.trim());
      }
    });
    this.subjects = Array.from(subjSet);
  }

  applyFilters(): void {
    let list = [...this.attendanceHistoryList];

    // Search filter (by subject, title, teacher)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(item => {
        const sub = (item.subject || item.title || '').toLowerCase();
        const teacher = (item.teacher_name || '').toLowerCase();
        return sub.includes(term) || teacher.includes(term);
      });
    }

    // Subject filter
    if (this.selectedSubject !== 'ALL') {
      list = list.filter(item => {
        const sub = (item.subject || item.title || '').trim().toLowerCase();
        return sub === this.selectedSubject.trim().toLowerCase();
      });
    }

    // Status filter
    if (this.selectedStatus !== 'ALL') {
      list = list.filter(item => item.status_label === this.selectedStatus);
    }

    // Sort filter
    list.sort((a: any, b: any) => {
      if (this.selectedSort === 'NEWEST') {
        const dateA = new Date(a.scheduled_date || a.joined_at || 0).getTime();
        const dateB = new Date(b.scheduled_date || b.joined_at || 0).getTime();
        return dateB - dateA;
      } else if (this.selectedSort === 'OLDEST') {
        const dateA = new Date(a.scheduled_date || a.joined_at || 0).getTime();
        const dateB = new Date(b.scheduled_date || b.joined_at || 0).getTime();
        return dateA - dateB;
      } else if (this.selectedSort === 'SUBJECT_ASC') {
        const subA = (a.subject || a.title || '').toLowerCase();
        const subB = (b.subject || b.title || '').toLowerCase();
        return subA.localeCompare(subB);
      } else if (this.selectedSort === 'SUBJECT_DESC') {
        const subA = (a.subject || a.title || '').toLowerCase();
        const subB = (b.subject || b.title || '').toLowerCase();
        return subB.localeCompare(subA);
      } else if (this.selectedSort === 'DURATION_DESC') {
        const durA = Number(a.duration_minutes || 0);
        const durB = Number(b.duration_minutes || 0);
        return durB - durA;
      }
      return 0;
    });

    this.filteredList = list;
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleDateSort(): void {
    this.selectedSort = this.selectedSort === 'NEWEST' ? 'OLDEST' : 'NEWEST';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredList.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedList = this.filteredList.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.onPageSizeChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getSubjectColor(subject: string | null): string {
    if (!subject) return '#2563eb';
    const s = subject.trim().toLowerCase();
    if (s.includes('science')) return '#2563eb'; // blue
    if (s.includes('english')) return '#7c3aed'; // purple
    if (s.includes('math')) return '#f59e0b'; // orange
    return '#4f46e5';
  }

  get startIndex(): number {
    return this.filteredList.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredList.length);
  }
}

