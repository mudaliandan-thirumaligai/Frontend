import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ScheduleService, ScheduleModel } from '../../../service/swamy-schedule.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-swamy-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent
  ],
  templateUrl: './swamy-schedule.component.html',
  styleUrls: ['./swamy-schedule.component.scss'],
})
export class SwamyScheduleComponent implements OnInit {

  allSchedules: ScheduleModel[] = [];
  availableYears: number[] = [];
  availableMonths: { name: string; value: number }[] = [];
  nextSchedule: ScheduleModel | null = null;

  filterYear = '';
  filterMonth = '';
  searchTerm = '';

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }
  generateAvailableMonths(): void {
  let filtered = this.allSchedules;

  // If year selected → filter schedules for that year
  if (this.filterYear) {
    filtered = filtered.filter(s =>
      new Date(s.startDate).getFullYear() === Number(this.filterYear)
    );
  }

  const monthNumbers = filtered.map(s =>
    new Date(s.startDate).getMonth() + 1
  );

  const uniqueMonths = [...new Set(monthNumbers)].sort((a, b) => a - b);

  this.availableMonths = this.months.filter(m =>
    uniqueMonths.includes(m.value)
  );
}


  loadSchedules(): void {
    this.scheduleService.getAll().subscribe({
      next: data => {
        const now = new Date();

        const upcoming = data
          .filter(s => new Date(s.startDate) >= now)
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() -
              new Date(b.startDate).getTime()
          );

        this.nextSchedule = upcoming.length ? upcoming[0] : null;
        this.allSchedules = upcoming.slice(1);
        this.generateAvailableMonths();

        const years = upcoming.map(s =>
          new Date(s.startDate).getFullYear()
        );

        this.availableYears = [...new Set(years)].sort((a, b) => a - b);
      },
      error: () => this.toast.showError('Failed to load schedules')
    });
  }
  onYearChange(): void {
    this.filterMonth = ''; // reset month when year changes
    this.generateAvailableMonths();
  }



  get filteredSchedules(): ScheduleModel[] {
    return this.allSchedules.filter(s => {
      const start = new Date(s.startDate);

      const matchesYear =
        !this.filterYear || start.getFullYear() === Number(this.filterYear);

      const matchesMonth =
        !this.filterMonth || start.getMonth() + 1 === Number(this.filterMonth);

      const search = this.searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        s.place.toLowerCase().includes(search) ||
        (s.additionalInfo &&
          s.additionalInfo.toLowerCase().includes(search));

      return matchesYear && matchesMonth && matchesSearch;
    });
  }
}
