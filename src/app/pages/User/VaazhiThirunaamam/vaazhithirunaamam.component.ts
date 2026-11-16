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
import { VaazhiThirunaamam } from './vaazhi-thirunaamam.model';
import { VAAZHI_THIRUNAAMAMS } from './vaazhi-thirunaamam.data';

interface ListRow {
  t: VaazhiThirunaamam;
  i: number; // index in the full list
}

@Component({
  selector: 'app-vaazhithirunaamam',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './vaazhithirunaamam.component.html',
  styleUrls: ['./vaazhithirunaamam.component.css'],
})
export class VaazhithirunaamamComponent implements OnInit, OnDestroy {
  @ViewChild('chipStrip') chipStrip?: ElementRef<HTMLElement>;
  @ViewChild('card') card?: ElementRef<HTMLElement>;

  vaazhiThirunaamams: VaazhiThirunaamam[] = VAAZHI_THIRUNAAMAMS;

  // current selection
  selectedIndex = 0;
  visible: VaazhiThirunaamam[] = []; // always 1 item; ngFor re-creates the node so the slide animation replays
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
    this.filtered = this.vaazhiThirunaamams.map((t, i) => ({ t, i }));

    // restore last viewed item + font size
    const savedIdx = Number(this.read('vaazhi-last'));
    if (Number.isInteger(savedIdx) && savedIdx >= 0 && savedIdx < this.vaazhiThirunaamams.length) {
      this.selectedIndex = savedIdx;
    }
    const savedFont = Number(this.read('vaazhi-font'));
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
    if (index < 0 || index >= this.vaazhiThirunaamams.length) return;

    this.direction = index >= this.selectedIndex ? 'next' : 'prev';
    this.selectedIndex = index;
    this.refresh();
    this.write('vaazhi-last', String(index));

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

  // Key changes with the selection, so ngFor re-creates the node and the animation replays
  trackByCurrent = (): number => this.selectedIndex;

  /**
   * `verses` is an array of lines. Blank / whitespace-only entries are treated
   * as verse breaks; with no blank entries the whole thing is a single verse.
   */
  private refresh(): void {
    const current = this.vaazhiThirunaamams[this.selectedIndex];
    this.visible = [current];

    const groups: string[][] = [[]];
    for (const raw of current.verses ?? []) {
      const line = (raw ?? '').trim();
      if (!line) {
        if (groups[groups.length - 1].length) groups.push([]);
      } else {
        groups[groups.length - 1].push(line);
      }
    }
    this.stanzas = groups.filter((g) => g.length).map((g) => g.join('\n'));
  }

  // ---------- search ----------
  onSearch(value: string): void {
    this.query = value;
    const q = value.trim().toLowerCase();
    this.filtered = this.vaazhiThirunaamams
      .map((t, i) => ({ t, i }))
      .filter(
        ({ t, i }) =>
          !q ||
          (t.name ?? '').toLowerCase().includes(q) ||
          (t.subtitle ?? '').toLowerCase().includes(q) ||
          (t.nakshatram ?? '').toLowerCase().includes(q) ||
          String(i + 1) === q
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
      this.write('vaazhi-font', String(this.fontIdx));
    }
  }

  decreaseFont(): void {
    if (this.fontIdx > 0) {
      this.fontIdx--;
      this.write('vaazhi-font', String(this.fontIdx));
    }
  }

  async copy(): Promise<void> {
    const t = this.vaazhiThirunaamams[this.selectedIndex];
    const heading = [t.name, t.subtitle].filter(Boolean).join(' - ');
    try {
      await navigator.clipboard.writeText(`${heading}\n\n${this.stanzas.join('\n\n')}`);
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