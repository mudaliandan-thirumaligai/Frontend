import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environment/environment';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
  year: number | null;   // year of this event (an event is now one name + one year)
}

// Events grouped under a year heading
interface YearGroup {
  year: number | null;
  label: string;          // "2026" or "Other"
  folders: Folder[];
  photoCount: number;
}

interface YearOption {
  year: number;
  count: number;          // number of events in that year
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  allFolders: Folder[] = [];        // every event, newest year first
  folders: Folder[] = [];           // events currently visible (after year filter)
  yearGroups: YearGroup[] = [];     // visible events grouped by year
  yearOptions: YearOption[] = [];   // chips for the year filter

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
        this.allFolders = this.groupByUtsavam(images);
        this.yearOptions = this.buildYearOptions(this.allFolders);
        this.applyFilter();
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

  private buildYearOptions(folders: Folder[]): YearOption[] {
    const counts = new Map<number, number>();
    folders.forEach(f => {
      if (f.year !== null) {
        counts.set(f.year, (counts.get(f.year) ?? 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);
  }

  // ─── Year filter ──────────────────────────────────────────────

  /** Pick a year chip (null = all years). Filtering happens in the browser. */
  selectYear(year: number | null) {
    this.selectedYear = year;
    this.applyFilter();
  }

  private applyFilter() {
    this.folders = this.selectedYear === null
      ? this.allFolders
      : this.allFolders.filter(f => f.year === this.selectedYear);

    this.yearGroups = this.buildYearGroups(this.folders);
  }

  private buildYearGroups(folders: Folder[]): YearGroup[] {
    const map = new Map<number | null, Folder[]>();

    folders.forEach(f => {
      if (!map.has(f.year)) map.set(f.year, []);
      map.get(f.year)!.push(f);
    });

    return Array.from(map.entries()).map(([year, list]) => ({
      year,
      label: year !== null ? String(year) : 'Other',
      folders: list,
      photoCount: list.reduce((sum, f) => sum + f.images.length, 0)
    }));
  }

  trackByYear(_: number, group: YearGroup): number | string {
    return group.year ?? 'other';
  }

  // ─── Grouping ─────────────────────────────────────────────────

  /**
   * One folder per event AND year, so the same utsavam held in
   * different years shows up under each year instead of being merged.
   */
  private groupByUtsavam(images: any[]): Folder[] {
    const map = new Map<string, { name: string; urls: string[]; year: number | null }>();

    images.forEach((img) => {
      const y = Number(img.year) || null;
      const key = `${img.utsavamName}|${y ?? ''}`;

      if (!map.has(key)) {
        map.set(key, { name: img.utsavamName, urls: [], year: y });
      }
      map.get(key)!.urls.push(img.url);
    });

    const folders: Folder[] = Array.from(map.values()).map(g => ({
      name: g.name,
      images: g.urls,
      year: g.year,
      expanded: false,
    }));

    // newest year first; undated events last (sort is stable, API order kept inside a year)
    folders.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

    if (folders.length) {
      folders[0].expanded = true; // newest event open
    }

    return folders;
  }

  trackByImg(_: number, img: string): string {
    return img;
  }

  // ─── Latest event ─────────────────────────────────────────────

  /**
   * Newest utsavam = the folder with the highest year.
   * If two share a year, the one that comes first from the API wins.
   * Hidden while a year filter is active (so a filtered list never
   * shows a misleading "latest" banner).
   */
  get latestFolder(): Folder | null {
    if (!this.allFolders.length || this.selectedYear !== null) return null;
    return this.allFolders.reduce(
      (best, f) => ((f.year ?? 0) > (best.year ?? 0) ? f : best),
      this.allFolders[0]
    );
  }

  isLatest(folder: Folder): boolean {
    return !!this.latestFolder && folder === this.latestFolder;
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

  /** DOM id used for scrolling (index in the visible list). */
  folderId(folder: Folder): string {
    return `folder-${this.folders.indexOf(folder)}`;
  }

  toggleFolder(folder: Folder) {
    folder.expanded = !folder.expanded;
    // Scroll by index id (names with spaces/special characters break querySelector),
    // and only when opening.
    if (folder.expanded) {
      this.scrollToFolder(folder);
    }
  }

  scrollToFolder(folder: Folder) {
    if (!folder.expanded) folder.expanded = true;

    setTimeout(() => {
      const element = document.getElementById(this.folderId(folder));
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