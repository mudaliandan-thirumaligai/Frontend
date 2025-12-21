import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Aacharya } from './aacharya.interface';
import { AACHARYAS_DATA } from './aacharya.data';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  aacharyas: Aacharya[] = [];
  selected!: Aacharya;

  ngOnInit(): void {
    this.aacharyas = AACHARYAS_DATA;
    this.selected = this.aacharyas[0]; // default
  }

  selectAacharya(a: Aacharya): void {
    this.selected = a;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
}

