import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Azhwar } from './azhwar.interface';
import { AZHWARS_DATA } from './azhwar.data';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
interface Fact {
  label: string;
  value: string;
  wide?: boolean;
}

@Component({
  selector: 'app-azhwar-history',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent,ButtonComponent],
  templateUrl: './azhwargal.component.html',
  styleUrls: ['./azhwargal.component.css'],
})
export class AzhwargalComponent implements OnInit {
  azhwars: Azhwar[] = [];
  selected!: Azhwar;
  facts: Fact[] = [];
  popupImage: string | null = null;

  private touchStartX = 0;
  private touchStartY = 0;

  ngOnInit(): void {
    this.azhwars = AZHWARS_DATA;
    if (this.azhwars.length) {
      this.selected = this.azhwars[0];
      this.facts = this.buildFacts(this.selected);
    }
  }

  get currentIndex(): number {
    return this.azhwars.findIndex((a) => a.id === this.selected?.id);
  }

  trackByLabel = (_: number, f: Fact) => f.label;

  // ---- selection ----
  selectAzhwar(a: Azhwar): void {
    this.selected = a;
    this.facts = this.buildFacts(a);

    // keep the chosen thumbnail centred in the mobile strip
    setTimeout(() =>
      document
        .getElementById('chip-' + a.id)
        ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    );
  }

  prev(): void {
    const i = this.currentIndex;
    if (i > 0) this.goTo(this.azhwars[i - 1]);
  }

  next(): void {
    const i = this.currentIndex;
    if (i < this.azhwars.length - 1) this.goTo(this.azhwars[i + 1]);
  }

  private goTo(a: Azhwar): void {
    this.selectAzhwar(a);
    setTimeout(() =>
      document
        .getElementById('azhwar-top')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
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
      this.closeImage();
      return;
    }
    if (this.popupImage) return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  // ---- image popup ----
  openImage(src: string): void {
    this.popupImage = src;
  }

  closeImage(): void {
    this.popupImage = null;
  }

  // ---- helpers ----
  private buildFacts(a: Azhwar): Fact[] {
    const all: Fact[] = [
      { label: 'Year', value: a.year },
      { label: 'Month', value: a.month },
      { label: 'Birth Place', value: a.birthPlace, wide: true },
      { label: 'Thiru Natchathiram', value: a.thiruNatchathiram },
      { label: 'Amsam', value: a.amsam },
    ];
    return all.filter((f) => !!f.value?.trim());
  }
}