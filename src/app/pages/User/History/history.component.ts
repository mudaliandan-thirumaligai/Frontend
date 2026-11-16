import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Aacharya } from './aacharya.interface';
import { AACHARYAS_DATA } from './data';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  aacharyas: Aacharya[] = [];
  selected!: Aacharya;

  sheetOpen = false;
  popupImage: string | null = null;

  private touchStartX = 0;
  private touchStartY = 0;

  ngOnInit(): void {
    this.aacharyas = AACHARYAS_DATA;
    if (this.aacharyas.length) {
      this.selected = this.aacharyas[0];
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  get currentIndex(): number {
    return this.aacharyas.findIndex((a) => a.id === this.selected?.id);
  }

  // ---- selection ----
  selectAacharya(a: Aacharya): void {
    this.selected = a;
    this.closeSheet();
    setTimeout(() =>
      document
        .getElementById('aacharya-top')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  }

  prev(): void {
    const i = this.currentIndex;
    if (i > 0) this.selectAacharya(this.aacharyas[i - 1]);
  }

  next(): void {
    const i = this.currentIndex;
    if (i < this.aacharyas.length - 1) this.selectAacharya(this.aacharyas[i + 1]);
  }

  // ---- bottom sheet (mobile) ----
  openSheet(): void {
    this.sheetOpen = true;
    document.body.style.overflow = 'hidden';
    // bring the current Aacharya into view inside the list
    setTimeout(() =>
      document
        .getElementById('sheet-row-' + this.selected.id)
        ?.scrollIntoView({ block: 'center' })
    );
  }

  closeSheet(): void {
    this.sheetOpen = false;
    if (!this.popupImage) document.body.style.overflow = '';
  }

  // ---- swipe (mobile) ----
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    // only clear horizontal swipes count, so normal scrolling is unaffected
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? this.next() : this.prev();
    }
  }

  // ---- keyboard (desktop) ----
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.popupImage) this.closeImage();
      else if (this.sheetOpen) this.closeSheet();
      return;
    }
    if (this.popupImage || this.sheetOpen) return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  // ---- image popup ----
  openImage(img: string): void {
    this.popupImage = img;
    document.body.style.overflow = 'hidden';
  }

  closeImage(): void {
    this.popupImage = null;
    document.body.style.overflow = '';
  }
}