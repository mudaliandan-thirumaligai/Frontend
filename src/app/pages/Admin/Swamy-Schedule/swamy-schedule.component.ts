import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ScheduleService, ScheduleModel } from '../../../service/swamy-schedule.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-swamy-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './swamy-schedule.component.html',
  styles: []
})
export class SwamyScheduleAdminComponent implements OnInit {

  schedules: ScheduleModel[] = [];
  editingId: string | null = null;
  editedData: Partial<ScheduleModel> = {};

  addingNew = false;
  newData: Partial<ScheduleModel> = {};

  filterYear: string = '';
  filterMonth: string = '';
  searchTerm: string = '';

  availableYears: number[] = [];
  months: { name: string; value: number }[] = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 },
    { name: 'March', value: 3 }, { name: 'April', value: 4 },
    { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 },
    { name: 'September', value: 9 }, { name: 'October', value: 10 },
    { name: 'November', value: 11 }, { name: 'December', value: 12 }
  ];

  constructor(
    private service: ScheduleService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.toast.showInfo('Loading schedules...');

    this.service.getAll().subscribe({
      next: data => {
        this.schedules = data;

        // Populate unique years
        const yearsSet = new Set<number>();
        this.schedules.forEach(s =>
          yearsSet.add(new Date(s.startDate).getFullYear())
        );
        this.availableYears = Array.from(yearsSet).sort((a, b) => b - a);

        this.toast.showSuccess('Schedules loaded');
      },
      error: () => {
        this.toast.showError('Failed to load schedules');
      }
    });
  }

  /* ================= EDIT ================= */

  startEdit(schedule: ScheduleModel): void {
    this.editingId = schedule._id || null;
    this.editedData = { ...schedule };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editedData = {};
  }

  saveEdit(): void {
    if (!this.editingId) return;

    this.toast.showInfo('Updating schedule...');

    this.service.update(this.editingId, this.editedData).subscribe({
      next: updated => {
        const idx = this.schedules.findIndex(s => s._id === updated._id);
        if (idx !== -1) this.schedules[idx] = updated;

        this.toast.showSuccess('Schedule updated');
        this.cancelEdit();
      },
      error: () => this.toast.showError('Update failed')
    });
  }

  /* ================= DELETE ================= */

  deleteSchedule(schedule: ScheduleModel): void {
    if (!schedule._id || !confirm(`Delete "${schedule.place}"?`)) return;

    this.toast.showInfo('Deleting schedule...');

    this.service.delete(schedule._id).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s._id !== schedule._id);
        this.toast.showSuccess('Schedule deleted');
      },
      error: () => this.toast.showError('Delete failed')
    });
  }

  /* ================= ADD ================= */

  startAddNew(): void {
    this.addingNew = true;
    this.newData = {};
  }

  cancelAddNew(): void {
    this.addingNew = false;
    this.newData = {};
  }

  saveNew(): void {
    if (!this.newData.startDate || !this.newData.endDate || !this.newData.place) {
      this.toast.showError('Start Date, End Date, and Place are required');
      return;
    }

    this.toast.showInfo('Adding schedule...');

    this.service.create(this.newData).subscribe({
      next: schedule => {
        this.schedules.unshift(schedule);
        this.toast.showSuccess('Schedule added');
        this.cancelAddNew();
      },
      error: () => this.toast.showError('Add failed')
    });
  }

  /* ================= FILTERS ================= */

  resetFilters(): void {
    this.filterYear = '';
    this.filterMonth = '';
    this.searchTerm = '';
    this.toast.showInfo('Filters reset');
  }

  get filteredSchedules(): ScheduleModel[] {
    const filtered = this.schedules.filter(s => {
      const start = new Date(s.startDate);

      const year = this.filterYear ? Number(this.filterYear) : null;
      const month = this.filterMonth ? Number(this.filterMonth) : null;

      const matchesYear = !year || start.getFullYear() === year;
      const matchesMonth = !month || start.getMonth() + 1 === month;

      const search = this.searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        s.place.toLowerCase().includes(search) ||
        (s.additionalInfo && s.additionalInfo.toLowerCase().includes(search));

      return matchesYear && matchesMonth && matchesSearch;
    });

    // Show once when filters result in empty data
    if (
      filtered.length === 0 &&
      (this.filterYear || this.filterMonth || this.searchTerm)
    ) {
      this.toast.showInfo('No schedules match the selected filters');
    }

    return filtered;
  }
}
