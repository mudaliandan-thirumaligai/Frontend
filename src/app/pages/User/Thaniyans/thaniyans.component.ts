import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MUDALIANDAN_THANIYANS, Thanian } from './thaniyan.data';

interface ListRow {
  t: Thanian;
  i: number; // index in the full list
}

@Component({
  selector: 'app-thaniyans',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './thaniyans.component.html',
  styleUrls: ['./thaniyans.component.css'],
})
export class ThaniyansComponent implements OnInit, OnDestroy {
  @ViewChild('chipStrip') chipStrip?: ElementRef<HTMLElement>;
  @ViewChild('card') card?: ElementRef<HTMLElement>;

  thaniyans: Thanian[] = MUDALIANDAN_THANIYANS;

  // current selection
  selectedIndex = 0;
  visible: Thanian[] = []; // always 1 item; lets ngFor re-create the node so the slide animation replays
  stanzas: string[] = [];
  direction: 'next' | 'prev' = 'next';

  // search + list
  query = '';
  filtered: ListRow[] = [];

  // mobile sheet
  sheetOpen = false;

  // reading comfort
  fontSizes = ['text-base', 'text-lg md:text-xl', 'text-xl md:text-2xl', 'text-2xl md:text-3xl'];
  fontIdx = 1;

  copied = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private copiedTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.filtered = this.thaniyans.map((t, i) => ({ t, i }));

    // restore last viewed thaniyan + font size
    const savedIdx = Number(this.read('thaniyan-last'));
    if (Number.isInteger(savedIdx) && savedIdx >= 0 && savedIdx < this.thaniyans.length) {
      this.selectedIndex = savedIdx;
    }
    const savedFont = Number(this.read('thaniyan-font'));
    if (Number.isInteger(savedFont) && savedFont >= 0 && savedFont < this.fontSizes.length) {
      this.fontIdx = savedFont;
    }

    this.refresh();
    setTimeout(() => this.centerChip());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
  }

  // ---------- navigation ----------
  select(index: number, closeSheet = true): void {
    if (index < 0 || index >= this.thaniyans.length) return;

    this.direction = index >= this.selectedIndex ? 'next' : 'prev';
    this.selectedIndex = index;
    this.refresh();
    this.write('thaniyan-last', String(index));

    if (closeSheet) this.closeSheet();

    setTimeout(() => {
      this.centerChip();
      this.keepCardInView();
    });
  }

  next(): void {
    this.select(this.selectedIndex + 1, false);
  }

  prev(): void {
    this.select(this.selectedIndex - 1, false);
  }

  trackById = (_: number, t: Thanian) => t.id;

  private refresh(): void {
    const current = this.thaniyans[this.selectedIndex];
    this.visible = [current];
    this.stanzas = (current.content ?? '')
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // ---------- search ----------
  onSearch(value: string): void {
    this.query = value;
    const q = value.trim().toLowerCase();
    this.filtered = this.thaniyans
      .map((t, i) => ({ t, i }))
      .filter(
        ({ t }) =>
          !q ||
          (t.title ?? '').toLowerCase().includes(q) ||
          (t.nakshatram ?? '').toLowerCase().includes(q) ||
          String(t.id).includes(q)
      );
  }

  // ---------- mobile sheet ----------
  openSheet(): void {
    this.sheetOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeSheet(): void {
    if (!this.sheetOpen) return;
    this.sheetOpen = false;
    document.body.style.overflow = '';
  }

  // ---------- gestures + keyboard ----------
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;

    // horizontal swipe only (ignore vertical scrolling)
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx < 0) this.next();
    else this.prev();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'Escape') this.closeSheet();
  }

  // ---------- reading comfort ----------
  increaseFont(): void {
    if (this.fontIdx < this.fontSizes.length - 1) {
      this.fontIdx++;
      this.write('thaniyan-font', String(this.fontIdx));
    }
  }

  decreaseFont(): void {
    if (this.fontIdx > 0) {
      this.fontIdx--;
      this.write('thaniyan-font', String(this.fontIdx));
    }
  }

  async copy(): Promise<void> {
    const t = this.thaniyans[this.selectedIndex];
    try {
      await navigator.clipboard.writeText(`${t.title}\n\n${t.content}`);
      this.copied = true;
      if (this.copiedTimer) clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => (this.copied = false), 1800);
    } catch {
      /* clipboard unavailable – ignore */
    }
  }

  // ---------- helpers ----------
  private centerChip(): void {
    const strip = this.chipStrip?.nativeElement;
    const chip = strip?.querySelector<HTMLElement>(`[data-idx="${this.selectedIndex}"]`);
    // block:'nearest' keeps the page itself from jumping vertically
    chip?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  private keepCardInView(): void {
    const el = this.card?.nativeElement;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage blocked – ignore */
    }
  }
}