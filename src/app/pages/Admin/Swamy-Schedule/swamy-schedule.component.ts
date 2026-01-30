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

  filterYear: number | null = null;
  filterMonth: number | null = null;

  constructor(
    private service: ScheduleService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.service.getAll().subscribe({
      next: data => this.schedules = data,
      error: () => this.toast.showError('Failed to load schedules')
    });
  }

  startEdit(schedule: ScheduleModel) {
    this.editingId = schedule._id || null;
    this.editedData = { ...schedule };
  }

  cancelEdit() {
    this.editingId = null;
    this.editedData = {};
  }

  saveEdit() {
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

  deleteSchedule(schedule: ScheduleModel) {
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

  startAddNew() {
    this.addingNew = true;
    this.newData = {};
  }

  cancelAddNew() {
    this.addingNew = false;
    this.newData = {};
  }

  saveNew() {
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

  get filteredSchedules(): ScheduleModel[] {
    return this.schedules.filter(s => {
      const start = new Date(s.startDate);
      const matchYear = !this.filterYear || start.getFullYear() === this.filterYear;
      const matchMonth = !this.filterMonth || start.getMonth() + 1 === this.filterMonth;
      return matchYear && matchMonth;
    });
  }
}
