import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Azhwar } from './azhwar.interface';
import { AZHWARS_DATA } from './azhwar.data';

@Component({
  selector: 'app-azhwar-history',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './azhwargal.component.html',
  styleUrls: ['./azhwargal.component.css']
})
export class AzhwargalComponent implements OnInit {

  azhwars: Azhwar[] = [];
  selected!: Azhwar;

  ngOnInit(): void {
    this.azhwars = AZHWARS_DATA;
    this.selected = this.azhwars[0];
  }

  selectAzhwar(a: Azhwar): void {
    this.selected = a;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  mobileSidebarOpen = false;
  popupImage: string | null = null;

  openImage(img: string) {
    this.popupImage = img;
  }

  closeImage() {
    this.popupImage = null;
  }
}
