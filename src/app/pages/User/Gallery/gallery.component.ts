import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { environment } from '../../../environment/environment';

interface Folder {
  key: string;             // stable id: "event:<id>" or "name:<utsavam>|<year>"
  eventId: string | null;  // set when the photos are linked to an event
  name: string;
  images: string[];
  expanded: boolean;
  year: number | null;
  dateText: string;        // "12 Nov 2026" or "12 – 14 Nov 2026" (linked events only)
  location: string;
  sortTime: number;        // newest first inside a year
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

interface GalleryPhoto {
  url: string;
  utsavamName: string;
  year?: number;
  location?: string;
  // the API sends an id string; tolerate a populated object just in case
  eventId?: string | { _id: string } | null;
}

interface EventInfo {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  allFolders: Folder[] = [];        // every event, newest first
  folders: Folder[] = [];           // events currently visible (after year filter)
  yearGroups: YearGroup[] = [];     // visible events grouped by year
  yearOptions: YearOption[] = [];   // chips for the year filter

  selectedImage: string | null = null;
  currentFolder: any = null;
  currentIndex: number = 0;
  isClosing = false;
  touchStartX = 0;
  touchEndX = 0;
  selectedYear: number | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadAll();
  }

  /**
   * Photos and events are loaded together. If the events request fails the page
   * still works: linked photos are then grouped by their event id using the
   * name stored on the photo.
   */
  loadAll() {
    forkJoin({
      photos: this.http
        .get<GalleryPhoto[]>(`${environment.apiUrl}/gallery`)
        .pipe(catchError(() => of([] as GalleryPhoto[]))),
      events: this.http
        .get<any>(`${environment.apiUrl}/events`)
        .pipe(catchError(() => of(null))),
    }).subscribe(({ photos, events }) => {
      this.allFolders = this.buildFolders(photos ?? [], this.toEventList(events));
      this.yearOptions = this.buildYearOptions(this.allFolders);
      this.applyFilter();
      this.openFromLink();
    });
  }

  /** Accepts a plain array or a wrapped { events | data } response; null = request failed. */
  private toEventList(res: any): EventInfo[] | null {
    if (res === null || res === undefined) return null;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.events)) return res.events;
    if (Array.isArray(res.data)) return res.data;
    return null;
  }

  private idOf(eventId: GalleryPhoto['eventId']): string | null {
    if (!eventId) return null;
    return typeof eventId === 'string' ? eventId : eventId._id ?? null;
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

  trackByFolder(_: number, folder: Folder): string {
    return folder.key;
  }

  // ─── Grouping ─────────────────────────────────────────────────

  /**
   * - Photos linked to an event are grouped by that event (its name, dates and
   *   location come from the event itself).
   * - Photos not linked to anything (or whose event was deleted) are grouped
   *   by utsavam name + year, exactly as before.
   */
  private buildFolders(photos: GalleryPhoto[], events: EventInfo[] | null): Folder[] {
    const eventById = new Map<string, EventInfo>((events ?? []).map(e => [e._id, e]));
    const map = new Map<string, Folder>();

    photos.forEach(img => {
      const evId = this.idOf(img.eventId);
      const linkedEvent = evId ? eventById.get(evId) : undefined;
      // events === null means the events request failed: trust the link anyway
      const isLinked = !!evId && (linkedEvent !== undefined || events === null);

      const key = isLinked
        ? `event:${evId}`
        : `name:${img.utsavamName}|${Number(img.year) || ''}`;

      let folder = map.get(key);
      if (!folder) {
        folder = isLinked
          ? this.folderForEvent(img, evId!, linkedEvent)
          : {
              key,
              eventId: null,
              name: img.utsavamName,
              images: [],
              expanded: false,
              year: Number(img.year) || null,
              dateText: '',
              location: img.location ?? '',
              sortTime: 0,
            };
        map.set(key, folder);
      }
      folder.images.push(img.url);
    });

    const folders = Array.from(map.values());

    // newest year first, then newest event inside the year; undated events last
    folders.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.sortTime - a.sortTime);

    if (folders.length) {
      folders[0].expanded = true; // newest event open
    }

    return folders;
  }

  private folderForEvent(img: GalleryPhoto, eventId: string, ev: EventInfo | undefined): Folder {
    const start = ev ? new Date(ev.startDate) : null;
    const validStart = start && !isNaN(start.getTime()) ? start : null;
    return {
      key: `event:${eventId}`,
      eventId,
      name: ev?.name ?? img.utsavamName,
      images: [],
      expanded: false,
      // the event's own start year, falling back to the year stored on the photo
      year: validStart ? validStart.getFullYear() : Number(img.year) || null,
      dateText: ev ? this.formatDates(ev.startDate, ev.endDate) : '',
      location: ev?.location || img.location || '',
      sortTime: validStart ? validStart.getTime() : 0,
    };
  }

  /** "12 Nov 2026" for a one-day event, "12 – 14 Nov 2026" or "30 Nov – 2 Dec 2026" for longer ones. */
  private formatDates(startIso: string, endIso: string): string {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (isNaN(s.getTime())) return '';

    const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-IN', opts);
    const full = (d: Date) => fmt(d, { day: 'numeric', month: 'short', year: 'numeric' });

    if (isNaN(e.getTime()) || s.toDateString() === e.toDateString()) return full(s);

    if (s.getFullYear() === e.getFullYear()) {
      const sameMonth = s.getMonth() === e.getMonth();
      const left = sameMonth ? String(s.getDate()) : fmt(s, { day: 'numeric', month: 'short' });
      return `${left} – ${full(e)}`;
    }
    return `${full(s)} – ${full(e)}`;
  }

  trackByImg(_: number, img: string): string {
    return img;
  }

  // ─── Deep link from the events page: /gallery?event=<event _id> ───

  private openFromLink() {
    const id = this.route.snapshot.queryParamMap.get('event');
    if (!id) return;

    const target = this.allFolders.find(f => f.eventId === id);
    if (!target) return; // no photos for that event yet: just show the normal page

    this.selectedYear = null;          // make sure the event is not hidden by a year filter
    this.applyFilter();
    this.allFolders.forEach(f => (f.expanded = false));
    this.scrollToFolder(target);       // expands it and scrolls to it
  }

  // ─── Latest event ─────────────────────────────────────────────

  /**
   * Newest event = the first one after sorting (newest year, then newest start date).
   * Hidden while a year filter is active (so a filtered list never
   * shows a misleading "latest" banner).
   */
  get latestFolder(): Folder | null {
    if (!this.allFolders.length || this.selectedYear !== null) return null;
    return this.allFolders[0];
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
    }, 100);
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