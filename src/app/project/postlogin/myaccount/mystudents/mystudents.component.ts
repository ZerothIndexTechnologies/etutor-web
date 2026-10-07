import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { HelperService } from '../../../../shared/services/helper.service';
import { Urls } from '../../../../shared/services/urls';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-mystudents',
  standalone: true,
  imports: [CommonModule, FormsModule, CapitalizePipe],
  templateUrl: './mystudents.component.html',
  styleUrl: './mystudents.component.scss'
})
export class MyStudentsComponent implements OnInit {
  public rawStudentList: any[] = [];
  public filteredStudentList: any[] = [];
  public studentList: any[] = [];
  public classOptions: any[] = [];
  public subjectOptions: any[] = [];
  public selectedStudent: any = null;
  public showDetailModal: boolean = false;
  public loading: boolean = false;

  public selectedClassFilter: string = 'all';
  public selectedSubjectFilter: string = 'all';
  public searchTerm: string = '';
  public totalStudentsCount: number = 0;
  public activeClassesCount: number = 0;

  // Pagination Properties
  public currentPage: number = 1;
  public pageSize: number = 10;
  public totalPages: number = 1;

  private auth = inject(AuthService);
  private helper = inject(HelperService);

  ngOnInit(): void {
    this.loadMyStudents();
  }

  loadMyStudents(): void {
    this.loading = true;
    const userId = this.auth.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    // Only send teacher_id — do NOT send user_id because classList/studentList
    // would misinterpret it as a student_id and return wrong data.
    const teacherPayload = {
      teacher_id: userId,
      filter_by: 'teacher',
      filter_value: String(userId)
    };

    const classPayload = {
      teacher_id: userId
    };

    forkJoin({
      teacherStudentsRes: this.auth.postService<any>(teacherPayload, Urls.getTeacherStudents).pipe(catchError(() => of(null))),
      classListRes: this.auth.postService<any>(classPayload, Urls.classList).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ teacherStudentsRes, classListRes }) => {
        this.loading = false;
        let combinedList: any[] = [];
        let classes: any[] = [];

        if (classListRes && classListRes.IsSuccess && Array.isArray(classListRes.ResponseObject)) {
          classes = classListRes.ResponseObject;
        }

        if (teacherStudentsRes && teacherStudentsRes.IsSuccess) {
          const students = this.extractStudentArray(teacherStudentsRes.ResponseObject);
          combinedList.push(...students);
        }

        // Extract any students directly embedded inside class list objects
        if (classes.length > 0) {
          classes.forEach((c: any) => {
            const embedded = c.students || c.enrolled_students || c.student_list || c.subscriptions || c.users;
            if (Array.isArray(embedded)) {
              const enriched = embedded.map((st: any) => ({
                ...st,
                class_id: st.class_id || c.id,
                class_name: c.title || c.class_name || c.subject,
                enrolled_subject: st.enrolled_subject || c.subject || c.title
              }));
              combinedList.push(...enriched);
            }
          });
        }

        this.rawStudentList = this.normalizeStudentList(combinedList, classes);
        this.buildClassOptions(classes);
        this.updateSubjectOptionsForSelectedClass();
        this.applyFilters();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error loading student API:', err);
      }
    });
  }

  private extractStudentArray(resObj: any): any[] {
    if (!resObj) return [];
    if (Array.isArray(resObj)) return resObj;
    if (typeof resObj === 'object') {
      const possibleKeys = [
        'students', 'enrolled_students', 'student_list', 'studentList',
        'subscriptions', 'userSubscription', 'data', 'list', 'response', 'records', 'items'
      ];
      for (const key of possibleKeys) {
        if (Array.isArray(resObj[key])) return resObj[key];
      }
      // Only treat it as a student record if it has recognizable student fields
      if (resObj.student_id || resObj.id || resObj.email || resObj.first_name || resObj.user_id) {
        return [resObj];
      }
      return [];
    }
    return [];
  }

  private normalizeStudentList(list: any[], classes: any[]): any[] {
    const studentMap = new Map<string, any>();

    list.forEach((st: any, index: number) => {
      if (!st) return;

      const sId = String(st.student_id || st.id || st.user_id || st.user_student_id || (index + 1));
      const email = (st.email || st.email_id || st.mail || '').trim().toLowerCase();

      // Find matching created class by ID or Subject/Title
      let matchedClass = classes.find(
        (c: any) => String(c.id || c.class_id) === String(st.class_id || st.course_id)
      );

      if (!matchedClass && st.class_name) {
        const cNameTerm = String(st.class_name).trim().toLowerCase();
        matchedClass = classes.find(
          (c: any) =>
            String(c.title || '').trim().toLowerCase() === cNameTerm ||
            String(c.class_name || '').trim().toLowerCase() === cNameTerm
        );
      }

      const subject = (st.enrolled_subject || st.subject || (matchedClass ? matchedClass.subject : null) || '').trim();
      const classId = String(st.class_id || (matchedClass ? matchedClass.id : ''));
      const className = matchedClass
        ? (matchedClass.title || matchedClass.class_name || 'Class')
        : (st.class_name || st.title || 'Class');
      const grade = st.grade_name || st.grade || (matchedClass ? matchedClass.grade_name : null) || '';

      const fn = (st.first_name || st.name || st.student_name || st.full_name || '').trim();
      const ln = (st.last_name || '').trim();
      const name = (fn + ' ' + ln).trim() || 'Unknown Student';

      const attendance = st.attendance_status || st.attendance || st.status || 'N/A';

      const uniqueKey = `${sId}_${classId}_${subject.toLowerCase()}_${email || index}`;

      const normalized = {
        ...st,
        student_id: sId,
        name: name,
        email: st.email || st.email_id || st.mail || '',
        mobile_number: st.mobile_number || st.mobile || st.phone || st.phone_number || 'N/A',
        grade_name: grade,
        enrolled_subject: subject,
        class_name: className,
        class_id: classId,
        attendance_status: attendance
      };

      if (!studentMap.has(uniqueKey)) {
        studentMap.set(uniqueKey, normalized);
      }
    });

    return Array.from(studentMap.values());
  }

  private buildClassOptions(classes: any[]): void {
    const opts: any[] = [{ value: 'all', label: 'All Enrolled Classes' }];
    const seenValues = new Set<string>();

    classes.forEach((c: any) => {
      const cId = String(c.id || c.class_id);
      const title = (c.title || c.class_name || '').trim();
      const label = title ? title : (c.grade_name || c.grade ? `Grade ${c.grade_name || c.grade}` : 'Class');

      if (cId && !seenValues.has(cId)) {
        seenValues.add(cId);
        opts.push({
          value: cId,
          label: label,
          id: cId
        });
      }
    });

    this.rawStudentList.forEach((st: any) => {
      const cId = String(st.class_id);
      const cName = st.class_name || st.title || 'Class';
      if (cId && cId !== 'undefined' && !seenValues.has(cId)) {
        seenValues.add(cId);
        opts.push({
          value: cId,
          label: cName,
          id: cId
        });
      }
    });

    this.classOptions = opts;
    this.activeClassesCount = opts.length - 1;
  }

  public onClassChange(): void {
    this.updateSubjectOptionsForSelectedClass();
    this.applyFilters();
  }

  public onSubjectChange(): void {
    this.applyFilters();
  }

  private updateSubjectOptionsForSelectedClass(): void {
    const opts: any[] = [{ value: 'all', label: 'All Enrolled Subjects' }];
    const seenSubjects = new Set<string>();

    let relevantList = this.rawStudentList;
    if (this.selectedClassFilter && this.selectedClassFilter !== 'all') {
      const targetClassId = String(this.selectedClassFilter).toLowerCase();
      relevantList = this.rawStudentList.filter((st: any) => {
        const cId = String(st.class_id || '').toLowerCase();
        const cName = String(st.class_name || '').toLowerCase();
        return cId === targetClassId || cName.includes(targetClassId);
      });
    }

    relevantList.forEach((st: any) => {
      const sub = (st.enrolled_subject || st.subject || '').trim();
      if (sub && !seenSubjects.has(sub.toLowerCase())) {
        seenSubjects.add(sub.toLowerCase());
        opts.push({
          value: sub.toLowerCase(),
          label: sub
        });
      }
    });

    this.subjectOptions = opts;

    if (this.selectedSubjectFilter !== 'all' && !seenSubjects.has(this.selectedSubjectFilter.toLowerCase())) {
      this.selectedSubjectFilter = 'all';
    }
  }

  applyFilters(): void {
    let filtered = [...this.rawStudentList];

    // 1. Filter strictly by Class Dropdown
    if (this.selectedClassFilter && this.selectedClassFilter !== 'all') {
      const targetClassId = String(this.selectedClassFilter).toLowerCase();
      filtered = filtered.filter((st: any) => {
        const cId = String(st.class_id || '').toLowerCase();
        const cName = String(st.class_name || '').toLowerCase();
        return cId === targetClassId || cName === targetClassId || cName.includes(targetClassId);
      });
    }

    // 2. Filter strictly by Enrolled Subject Dropdown
    if (this.selectedSubjectFilter && this.selectedSubjectFilter !== 'all') {
      const targetSub = this.selectedSubjectFilter.toLowerCase();
      filtered = filtered.filter((st: any) => {
        const stSub = String(st.enrolled_subject || st.subject || '').toLowerCase();
        return stSub === targetSub || stSub.includes(targetSub);
      });
    }

    // 3. Search Term
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter((st: any) => {
        const name = String(st.name || '').toLowerCase();
        const email = String(st.email || '').toLowerCase();
        const grade = String(st.grade_name || st.grade || '').toLowerCase();
        const className = String(st.class_name || '').toLowerCase();
        const subject = String(st.enrolled_subject || st.subject || '').toLowerCase();
        return (
          name.includes(term) ||
          email.includes(term) ||
          grade.includes(term) ||
          className.includes(term) ||
          subject.includes(term)
        );
      });
    }

    this.filteredStudentList = filtered;
    this.totalStudentsCount = this.rawStudentList.length;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStudentList.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.studentList = this.filteredStudentList.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    return this.filteredStudentList.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredStudentList.length);
  }

  getSelectedClassLabel(): string {
    const opt = this.classOptions.find(o => String(o.value) === String(this.selectedClassFilter));
    return opt ? opt.label : this.selectedClassFilter;
  }

  resetAllFilters(): void {
    this.selectedClassFilter = 'all';
    this.selectedSubjectFilter = 'all';
    this.searchTerm = '';
    this.updateSubjectOptionsForSelectedClass();
    this.applyFilters();
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
      class_id: student.class_id || 1
    };
    this.auth.postService<any>(payload, Urls.sendClassReminderEmail).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess) {
          this.helper.presentToast(`Class Reminder Email sent to ${student.name} for ${student.class_name || 'Class'}!`);
        } else {
          this.helper.presentErrorToast(res?.ErrorObject || 'Failed to send reminder.');
        }
      },
      error: () => {
        this.helper.presentErrorToast('Failed to send reminder alert.');
      }
    });
  }
}
