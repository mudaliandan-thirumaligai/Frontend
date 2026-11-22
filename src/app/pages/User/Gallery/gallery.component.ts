import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environment/environment';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
  year: number | null;   // NEW: newest year found in this utsavam (used to find the latest event)
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  folders: Folder[] = [];

  selectedImage: string | null = null;
  currentFolder: any = null;
  currentIndex: number = 0;
  isClosing = false;
  touchStartX = 0;
  touchEndX = 0;
  years: number[] = [];
  selectedYear: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http
      .get<any[]>(`${environment.apiUrl}/gallery`)
      .subscribe(images => {
        this.years = this.extractYears(images);
        this.folders = this.groupByUtsavam(images);
      });
  }

  private extractYears(images: any[]): number[] {
    const yearSet = new Set<number>();

    images.forEach(img => {
      if (img.year) {
        yearSet.add(Number(img.year));
      }
    });

    return Array.from(yearSet).sort((a, b) => b - a); // latest first
  }

  onYearChange(yearValue: string) {
    if (!yearValue) {
      this.selectedYear = null;
      this.loadAll();
      return;
    }

    const year = Number(yearValue);
    this.selectedYear = year;

    this.http
      .get<any[]>(`${environment.apiUrl}/gallery/search?year=${year}`)
      .subscribe(images => {
        this.folders = this.groupByUtsavam(images);
      });
  }

  private groupByUtsavam(images: any[]): Folder[] {
    const map = new Map<string, { urls: string[]; year: number | null }>();

    images.forEach((img) => {
      if (!map.has(img.utsavamName)) {
        map.set(img.utsavamName, { urls: [], year: null });
      }
      const group = map.get(img.utsavamName)!;
      group.urls.push(img.url);

      const y = Number(img.year);
      if (y && (group.year === null || y > group.year)) {
        group.year = y;
      }
    });

    return Array.from(map.entries()).map(([utsavamName, g], index) => ({
      name: utsavamName,
      images: g.urls,
      year: g.year,
      expanded: index === 0, // first group open
    }));
  }

  trackByImg(_: number, img: string): string {
    return img;
  }

  // ─── Latest event (NEW) ───────────────────────────────────────

  /**
   * Newest utsavam = the folder with the highest year.
   * If two share a year, the one that comes first from the API wins.
   * Hidden while a year filter is active (so a filtered list never
   * shows a misleading "latest" banner).
   */
  get latestFolder(): Folder | null {
    if (!this.folders.length || this.selectedYear !== null) return null;
    return this.folders.reduce(
      (best, f) => ((f.year ?? 0) > (best.year ?? 0) ? f : best),
      this.folders[0]
    );
  }

  isLatest(folder: Folder): boolean {
    return !!this.latestFolder && folder.name === this.latestFolder.name;
  }

  coverOf(folder: Folder | null): string | null {
    return folder?.images?.length ? folder.images[0] : null;
  }

  openLatest(): void {
    const f = this.latestFolder;
    if (!f) return;
    this.scrollToFolder(f);   // expands it and scrolls to it
  }

  // ─── Folders ──────────────────────────────────────────────────

  toggleFolder(folder: Folder) {
    folder.expanded = !folder.expanded;
    // FIX: the old code used querySelector(`#${folder.name}`), which throws for
    // names with spaces/special characters. Scroll by index id instead,
    // and only when opening.
    if (folder.expanded) {
      this.scrollToFolder(folder);
    }
  }

  scrollToFolder(folder: Folder) {
    if (!folder.expanded) folder.expanded = true;

    setTimeout(() => {
      const index = this.folders.indexOf(folder);
      const element = document.getElementById(`folder-${index}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ─── Image viewer ─────────────────────────────────────────────

  openImage(img: string, folder: any) {
    this.selectedImage = img;
    this.currentFolder = folder;
    this.currentIndex = folder.images.indexOf(img);
    this.preloadAdjacent();
  }

  preloadAdjacent() {
    if (!this.currentFolder) return;

    const next =
      this.currentFolder.images[
        (this.currentIndex + 1) % this.currentFolder.images.length
      ];

    const prev =
      this.currentFolder.images[
        (this.currentIndex - 1 + this.currentFolder.images.length) %
        this.currentFolder.images.length
      ];

    [next, prev].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  prevImage() {
    if (!this.currentFolder) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.currentFolder.images.length) %
      this.currentFolder.images.length;

    this.selectedImage = this.currentFolder.images[this.currentIndex];

    this.preloadAdjacent();
  }

  nextImage() {
    if (!this.currentFolder) return;

    this.currentIndex =
      (this.currentIndex + 1) % this.currentFolder.images.length;

    this.selectedImage = this.currentFolder.images[this.currentIndex];

    this.preloadAdjacent();
  }

  closeImage() {
    this.selectedImage = null;
    this.currentFolder = null;
  }

  // Keyboard navigation (this single handler covers arrows + Escape;
  // do NOT add a second set of keydown listeners or photos will skip)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedImage) return; // only active when modal is open
    if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'Escape') {
      this.closeImage();
    }
  }

  onTouchStart(event: TouchEvent) {
    // Ignore pinch gestures
    if (event.touches.length > 1) return;

    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length > 1) return;

    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;

    // Ignore tiny movement
    if (Math.abs(deltaX) < 60) return;

    if (deltaX < 0) {
      this.nextImage();
    } else {
      this.prevImage();
    }
  }
}