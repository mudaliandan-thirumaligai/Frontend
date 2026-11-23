import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import {
  BulkCreateGalleryDto,
  CloudinaryResult,
  EventOption,
  GalleryAdminService,
  GalleryPhoto,
  HttpError,
  NewEventPayload,
  SignatureResponse,
} from '../../../service/gallery-admin.service';
// Adjust this path if your folder depth differs
import { ToastService } from '../../../shared/services/toast.service';

const CONCURRENCY = 3;
const MAX_RETRIES = 2; // 2 retries = up to 3 attempts per photo
const PAGE_SIZE = 20;

type Stage = 'waiting' | 'compressing' | 'uploading' | 'ready' | 'saving' | 'done' | 'failed';
type LinkFilter = 'all' | 'linked' | 'unlinked';
type LinkMode = 'existing' | 'new';

interface EventMeta {
  utsavamName: string;
  location: string;
  year: number;
}

export interface UploadJob {
  id: number;
  name: string;
  stage: Stage;
  statusText: string;
  progress: number; // 0-100
  sizeText: string;
}

interface JobCache {
  file: File;
  compressed?: File;
  uploaded?: CloudinaryResult;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "IMG_1234.jpeg" -> "IMG_1234" */
function baseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

@Component({
  selector: 'app-admin-gallery',
  imports: [], // add PageBreadcrumbComponent here when you enable the breadcrumb
  templateUrl: './gallery.component.html',
})
export class AdminGallery {
  private readonly api = inject(GalleryAdminService);
  private readonly toast = inject(ToastService);

  // form state
  readonly showAddForm = signal(false);
  readonly utsavamName = signal('');
  readonly location = signal('');
  readonly year = signal(String(new Date().getFullYear()));
  readonly files = signal<File[]>([]);

  // upload state
  readonly jobs = signal<UploadJob[]>([]);
  readonly busy = signal(false);
  readonly finished = signal(false);
  /** ids of photos saved by the current upload session (used for "Link these to an event") */
  readonly justUploadedIds = signal<string[]>([]);

  // manage (list + delete) state
  readonly photos = signal<GalleryPhoto[]>([]);
  readonly photosLoading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly bulkDeleting = signal(false);
  readonly search = signal('');
  readonly filterYear = signal('all');
  readonly filterEvent = signal('all');
  readonly filterLink = signal<LinkFilter>('all');
  readonly page = signal(0);
  readonly selected = signal<Set<string>>(new Set());
  readonly previewUrl = signal<string | null>(null);

  // event linking state
  readonly eventList = signal<EventOption[]>([]);
  readonly eventById = computed(() => new Map(this.eventList().map((e) => [e._id, e])));
  readonly linkOpen = signal(false);
  readonly linkMode = signal<LinkMode>('existing');
  readonly linkEventId = signal('');
  readonly linkSuggestedIds = signal<string[]>([]);
  readonly linkBusy = signal(false);
  readonly newName = signal('');
  readonly newLocation = signal('');
  readonly newStart = signal('');
  readonly newEnd = signal('');
  readonly newLevel = signal('utsavam');

  // year / month filters inside the "Existing event" dropdown
  readonly linkYear = signal('all');
  readonly linkMonth = signal('all'); // 'all' or '0'..'11'
  readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  readonly linkYears = computed(() =>
    [...new Set(this.eventList().map((e) => new Date(e.startDate).getFullYear()))]
      .filter((y) => !isNaN(y))
      .sort((a, b) => b - a)
  );

  private matchesLinkFilter(e: EventOption): boolean {
    const d = new Date(e.startDate);
    if (isNaN(d.getTime())) return this.linkYear() === 'all' && this.linkMonth() === 'all';
    const y = this.linkYear();
    const m = this.linkMonth();
    return (y === 'all' || String(d.getFullYear()) === y) && (m === 'all' || String(d.getMonth()) === m);
  }

  readonly suggestedEvents = computed(() => {
    const ids = new Set(this.linkSuggestedIds());
    return this.eventList().filter((e) => ids.has(e._id) && this.matchesLinkFilter(e));
  });
  readonly otherEvents = computed(() => {
    const ids = new Set(this.linkSuggestedIds());
    return [...this.eventList()]
      .filter((e) => !ids.has(e._id) && this.matchesLinkFilter(e))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  });
  readonly visibleEventCount = computed(() => this.suggestedEvents().length + this.otherEvents().length);

  readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');

  readonly doneCount = computed(() => this.jobs().filter((j) => j.stage === 'done').length);
  readonly failedJobs = computed(() => this.jobs().filter((j) => j.stage === 'failed'));
  readonly selectedText = computed(() => {
    const n = this.files().length;
    return n === 0 ? 'No photos chosen yet.' : `${n} photo${n === 1 ? '' : 's'} chosen.`;
  });
  readonly summaryText = computed(() => {
    const total = this.jobs().length;
    const failed = this.failedJobs();
    if (!this.finished()) return `Saved ${this.doneCount()} of ${total}…`;
    if (failed.length === 0) return `All ${total} photos were added successfully.`;
    return `${this.doneCount()} of ${total} photos added. ${failed.length} did NOT save. Press "Retry Failed".`;
  });

  // filters
  readonly years = computed(() =>
    [...new Set(this.photos().map((p) => String(p.year)))].sort((a, b) => Number(b) - Number(a))
  );
  readonly events = computed(() => {
    const y = this.filterYear();
    const src = y === 'all' ? this.photos() : this.photos().filter((p) => String(p.year) === y);
    return [...new Set(src.map((p) => p.utsavamName))].sort((a, b) => a.localeCompare(b));
  });
  readonly filteredPhotos = computed(() => {
    const q = this.search().trim().toLowerCase();
    const y = this.filterYear();
    const e = this.filterEvent();
    const l = this.filterLink();
    return this.photos().filter(
      (p) =>
        (y === 'all' || String(p.year) === y) &&
        (e === 'all' || p.utsavamName === e) &&
        (l === 'all' || (l === 'linked') === !!p.eventId) &&
        (!q || `${p.name} ${p.utsavamName} ${p.location} ${p.year}`.toLowerCase().includes(q))
    );
  });

  // pagination + selection
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPhotos().length / PAGE_SIZE)));
  readonly currentPage = computed(() => Math.min(this.page(), this.totalPages() - 1));
  readonly pagedPhotos = computed(() => {
    const start = this.currentPage() * PAGE_SIZE;
    return this.filteredPhotos().slice(start, start + PAGE_SIZE);
  });
  readonly selectedCount = computed(() => this.selected().size);
  readonly allOnPageSelected = computed(() => {
    const list = this.pagedPhotos();
    const sel = this.selected();
    return list.length > 0 && list.every((p) => sel.has(p._id));
  });

  private caches = new Map<number, JobCache>();
  private currentMeta: EventMeta | null = null;
  private sigPromise: Promise<SignatureResponse> | null = null;

  constructor() {
    this.loadPhotos();
    this.loadEvents(true);
  }

  /* ---------------------------- input handlers ---------------------------- */
  val(e: Event): string { return (e.target as HTMLInputElement | HTMLSelectElement).value; }

  onUtsavam(e: Event) { this.utsavamName.set(this.val(e)); }
  onLocation(e: Event) { this.location.set(this.val(e)); }
  onYear(e: Event) { this.year.set(this.val(e)); }
  onFiles(e: Event) {
    const list = Array.from((e.target as HTMLInputElement).files ?? []).filter((f) =>
      f.type.startsWith('image/')
    );
    this.files.set(list);
  }

  onSearch(e: Event) {
    this.search.set(this.val(e));
    this.page.set(0);
  }
  onFilterYear(e: Event) {
    this.filterYear.set(this.val(e));
    this.filterEvent.set('all'); // the event list depends on the year
    this.page.set(0);
  }
  onFilterEvent(e: Event) {
    this.filterEvent.set(this.val(e));
    this.page.set(0);
  }
  onFilterLink(e: Event) {
    this.filterLink.set(this.val(e) as LinkFilter);
    this.page.set(0);
  }

  /* ---------------------------- list helpers ---------------------------- */
  goTo(p: number) {
    this.page.set(Math.max(0, Math.min(p, this.totalPages() - 1)));
  }

  /** Small Cloudinary thumbnail so a page of 20 loads fast. Falls back to the original URL. */
  thumb(url: string): string {
    return url.includes('/upload/') ? url.replace('/upload/', '/upload/w_96,h_96,c_fill,q_auto,f_auto/') : url;
  }

  isSelected(id: string) { return this.selected().has(id); }
  toggleOne(id: string) {
    this.selected.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  togglePage() {
    const all = this.allOnPageSelected();
    this.selected.update((s) => {
      const n = new Set(s);
      this.pagedPhotos().forEach((p) => (all ? n.delete(p._id) : n.add(p._id)));
      return n;
    });
  }
  selectAllFiltered() { this.selected.set(new Set(this.filteredPhotos().map((p) => p._id))); }
  clearSelection() { this.selected.set(new Set()); }

  eventName(p: GalleryPhoto): string {
    return p.eventId ? this.eventById().get(p.eventId)?.name ?? 'Linked event' : '';
  }

  eventLabel(e: EventOption): string {
    const s = new Date(e.startDate);
    const when = isNaN(s.getTime())
      ? ''
      : ` · ${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    return `${e.name}${when}`;
  }

  /* ------------------------------ upload actions ------------------------------ */
  closeForm() {
    if (this.busy()) return;
    this.showAddForm.set(false);
    this.jobs.set([]);
    this.finished.set(false);
    this.justUploadedIds.set([]);
  }

  async upload() {
    if (this.busy()) return;

    const utsavamName = this.utsavamName().trim();
    const location = this.location().trim();
    const year = Number(this.year());

    if (!utsavamName) return this.toast.showError('Please type the utsavam name.');
    if (!location) return this.toast.showError('Please type the location.');
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      return this.toast.showError('Please type a valid year, for example 2026.');
    }
    if (this.files().length === 0) return this.toast.showError('Please choose at least one photo.');

    this.currentMeta = { utsavamName, location, year };

    this.caches.clear();
    this.finished.set(false);
    this.justUploadedIds.set([]);
    const jobs: UploadJob[] = this.files().map((file, i) => {
      this.caches.set(i, { file });
      return {
        id: i,
        name: file.name,
        stage: 'waiting',
        statusText: 'Waiting…',
        progress: 0,
        sizeText: `Size: ${formatSize(file.size)}`,
      };
    });
    this.jobs.set(jobs);

    await this.run(jobs.map((j) => j.id));
  }

  async retryFailed() {
    if (this.busy() || !this.currentMeta) return;
    const ids = this.failedJobs().map((j) => j.id);
    if (ids.length === 0) return;
    this.finished.set(false);
    await this.run(ids);
  }

  /* ------------------------------ manage actions ------------------------------ */
  async loadPhotos() {
    this.photosLoading.set(true);
    try {
      this.photos.set(await this.api.getPhotos());
      // drop selections that no longer exist
      const ids = new Set(this.photos().map((p) => p._id));
      this.selected.update((s) => new Set([...s].filter((id) => ids.has(id))));
    } catch (err) {
      this.toast.showError((err as Error).message || 'Failed to load photos');
    } finally {
      this.photosLoading.set(false);
    }
  }

  async loadEvents(silent = false) {
    try {
      this.eventList.set(await this.api.getEvents());
    } catch (err) {
      if (!silent) this.toast.showError((err as Error).message || 'Failed to load events');
    }
  }

  async deletePhoto(p: GalleryPhoto) {
    if (this.deletingId() || this.bulkDeleting()) return;
    if (!confirm(`Delete "${p.name}" from ${p.utsavamName} (${p.year})? This cannot be undone.`)) return;

    this.deletingId.set(p._id);
    try {
      const res = await this.api.deletePhoto(p._id);
      this.removeLocally(p._id);
      this.toast.showSuccess(res?.message || 'Photo deleted.');
    } catch (err) {
      this.toast.showError((err as Error).message || 'Failed to delete photo');
    } finally {
      this.deletingId.set(null);
    }
  }

  async deleteSelected() {
    const ids = [...this.selected()];
    if (ids.length === 0 || this.deletingId() || this.bulkDeleting()) return;
    if (!confirm(`Delete ${ids.length} selected photo(s)? This cannot be undone.`)) return;

    this.bulkDeleting.set(true);
    let ok = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        await this.api.deletePhoto(id);
        this.removeLocally(id);
        ok++;
      } catch {
        failed++;
      }
    }
    this.bulkDeleting.set(false);

    if (failed === 0) this.toast.showSuccess(`${ok} photo(s) deleted.`);
    else this.toast.showError(`${ok} deleted, ${failed} failed. The failed ones are still selected, try again.`);
  }

  private removeLocally(id: string) {
    this.photos.update((list) => list.filter((x) => x._id !== id));
    this.selected.update((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    this.justUploadedIds.update((l) => l.filter((x) => x !== id));
  }

  /* ------------------------------ event linking ------------------------------ */

  /** Opens the dialog for the selected photos (or for the given ids, e.g. the photos just uploaded). */
  async openLink(ids?: string[]) {
    if (ids?.length) this.selected.set(new Set(ids));
    const chosen = this.photos().filter((p) => this.selected().has(p._id));
    if (chosen.length === 0) return;

    const first = chosen[0];
    this.linkMode.set('existing');
    this.linkEventId.set('');
    this.linkSuggestedIds.set([]);
    this.newName.set(first.utsavamName);
    this.newLocation.set(first.location);
    this.newStart.set('');
    this.newEnd.set('');
    this.newLevel.set('utsavam');
    this.clearLinkFilters();
    this.linkOpen.set(true);

    await this.loadEvents(true); // always show the latest events
    try {
      const suggestions = await this.api.suggestEvents(first.utsavamName, first.year);
      this.linkSuggestedIds.set(suggestions.map((e) => e._id));
      if (suggestions.length > 0) this.linkEventId.set(suggestions[0]._id);
    } catch {
      /* suggestions are optional; the full list is still available */
    }
  }

  closeLink() {
    if (this.linkBusy()) return;
    this.linkOpen.set(false);
  }

  onLinkYear(e: Event) {
    this.linkYear.set(this.val(e));
    this.dropHiddenChoice();
  }
  onLinkMonth(e: Event) {
    this.linkMonth.set(this.val(e));
    this.dropHiddenChoice();
  }
  clearLinkFilters() {
    this.linkYear.set('all');
    this.linkMonth.set('all');
  }

  /** If the chosen event is hidden by the year/month filter, clear the choice so it can't be linked by mistake. */
  private dropHiddenChoice() {
    const id = this.linkEventId();
    if (id && !this.suggestedEvents().some((e) => e._id === id) && !this.otherEvents().some((e) => e._id === id)) {
      this.linkEventId.set('');
    }
  }

  async submitLink() {
    const ids = [...this.selected()];
    if (ids.length === 0 || this.linkBusy()) return;

    let payload: NewEventPayload | null = null;
    if (this.linkMode() === 'existing') {
      if (!this.linkEventId()) return this.toast.showError('Please choose an event.');
    } else {
      const name = this.newName().trim();
      const start = this.newStart();
      const end = this.newEnd();
      if (!name) return this.toast.showError('Please type the event name.');
      if (!start || !end) return this.toast.showError('Please choose the start and end dates.');
      if (end < start) return this.toast.showError('The end date cannot be before the start date.');
      payload = {
        name,
        startDate: start,
        endDate: end,
        location: this.newLocation().trim() || undefined,
        eventLevel: this.newLevel(),
      };
    }

    this.linkBusy.set(true);
    try {
      let eventId: string;
      if (payload) {
        const res = await this.api.linkNewEvent(ids, payload);
        eventId = res.event._id;
        this.toast.showSuccess(res.message || 'Event created and photos linked.');
      } else {
        eventId = this.linkEventId();
        const res = await this.api.linkPhotos(ids, eventId);
        this.toast.showSuccess(res.message || 'Photos linked.');
      }

      const done = new Set(ids);
      this.photos.update((list) => list.map((p) => (done.has(p._id) ? { ...p, eventId } : p)));
      this.justUploadedIds.update((l) => l.filter((x) => !done.has(x)));
      this.clearSelection();
      this.linkOpen.set(false);
      this.loadEvents(true); // pick up a newly created event
    } catch (err) {
      this.toast.showError((err as Error).message || 'Could not link the photos');
    } finally {
      this.linkBusy.set(false);
    }
  }

  async unlinkSelected() {
    const ids = [...this.selected()];
    if (ids.length === 0 || this.linkBusy()) return;
    if (!confirm(`Remove ${ids.length} selected photo(s) from their event? The photos stay in the gallery.`)) return;

    this.linkBusy.set(true);
    try {
      const res = await this.api.unlinkPhotos(ids);
      const done = new Set(ids);
      this.photos.update((list) => list.map((p) => (done.has(p._id) ? { ...p, eventId: null } : p)));
      this.toast.showSuccess(res.message || 'Photos unlinked.');
      this.clearSelection();
    } catch (err) {
      this.toast.showError((err as Error).message || 'Could not unlink the photos');
    } finally {
      this.linkBusy.set(false);
    }
  }

  /* ------------------------------ pipeline ------------------------------ */
  private async run(ids: number[]) {
    this.busy.set(true);
    this.sigPromise = null; // always fetch a fresh signature per run
    try {
      // Phase 1: compress + upload to Cloudinary, a few at a time
      const queue = [...ids];
      const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
          await this.uploadWithRetry(queue.shift()!);
        }
      });
      await Promise.all(workers);

      // Phase 2: one bulk save for everything that uploaded
      const ready = ids.filter((id) => this.jobs().find((j) => j.id === id)?.stage === 'ready');
      if (ready.length > 0) await this.saveBatch(ready);
    } finally {
      this.busy.set(false);
      this.finished.set(true);

      if (this.failedJobs().length === 0) {
        this.toast.showSuccess(`All ${this.jobs().length} photos were added successfully.`);
        this.files.set([]);
        const el = this.picker()?.nativeElement;
        if (el) el.value = '';
      } else {
        this.toast.showError(`${this.failedJobs().length} photo(s) did not save. Use "Retry Failed".`);
      }
      this.loadPhotos(); // refresh the Manage list
    }
  }

  private patch(id: number, changes: Partial<UploadJob>) {
    this.jobs.update((list) => list.map((j) => (j.id === id ? { ...j, ...changes } : j)));
  }

  private async uploadWithRetry(id: number) {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.uploadOnce(id);
        return;
      } catch (err) {
        lastErr = err;
        this.sigPromise = null; // maybe the signature went stale, get a new one
        if (err instanceof HttpError && (err.status === 401 || err.status === 403)) break; // retrying won't help
        if (attempt < MAX_RETRIES) {
          this.patch(id, { statusText: `Problem, trying again (${attempt + 1} of ${MAX_RETRIES})…` });
          await sleep(1000 * (attempt + 1));
        }
      }
    }
    const message = (lastErr as Error)?.message || 'Unknown error';
    this.patch(id, { stage: 'failed', statusText: `Failed: ${message}` });
  }

  private async uploadOnce(id: number) {
    const cache = this.caches.get(id)!;
    const file = await this.compress(id, cache);

    if (!cache.uploaded) {
      this.patch(id, { stage: 'uploading', statusText: 'Uploading… 0%', progress: 30 });
      const sig = await this.getSignature();
      cache.uploaded = await this.api.uploadToCloudinary(file, sig, (pct) =>
        this.patch(id, { statusText: `Uploading… ${pct}%`, progress: 30 + Math.round(pct * 0.6) })
      );
    }
    this.patch(id, { stage: 'ready', statusText: 'Uploaded, waiting to save…', progress: 90 });
  }

  private async saveBatch(ids: number[]) {
    const meta = this.currentMeta!;
    ids.forEach((id) => this.patch(id, { stage: 'saving', statusText: 'Saving details…', progress: 95 }));

    const body: BulkCreateGalleryDto = {
      utsavamName: meta.utsavamName,
      year: meta.year,
      location: meta.location,
      photos: ids.map((id) => {
        const c = this.caches.get(id)!;
        return { name: baseName(c.file.name), url: c.uploaded!.secure_url, publicId: c.uploaded!.public_id };
      }),
    };

    try {
      const res = await this.api.saveBulk(body);
      ids.forEach((id) => this.patch(id, { stage: 'done', statusText: 'Done ✔', progress: 100 }));
      // remember the saved photos so the admin can link them to an event straight away
      const newIds = (res.photos ?? []).map((p) => p._id);
      if (newIds.length) this.justUploadedIds.update((l) => [...new Set([...l, ...newIds])]);
    } catch (err) {
      const message = (err as Error)?.message || 'Unknown error';
      // The server deletes these images from Cloudinary when a save fails,
      // so forget them: a retry must upload them again.
      ids.forEach((id) => {
        this.caches.get(id)!.uploaded = undefined;
        this.patch(id, { stage: 'failed', statusText: 'Not saved. Press "Retry Failed".', progress: 0 });
      });
      this.toast.showError(message);
    }
  }

  private async compress(id: number, cache: JobCache): Promise<File> {
    if (cache.compressed) return cache.compressed;
    const original = cache.file;

    if (!this.api.shouldCompress(original)) {
      cache.compressed = original;
      this.patch(id, { sizeText: `Size: ${formatSize(original.size)} (already small, not shrunk)` });
      return original;
    }

    this.patch(id, { stage: 'compressing', statusText: 'Making the photo smaller…', progress: 0 });
    const compressed = await this.api.compress(original, (p) =>
      this.patch(id, { progress: Math.round(p * 0.3) }) // 0-30%
    );
    cache.compressed = compressed;
    this.patch(id, { sizeText: `Size: ${formatSize(original.size)} → ${formatSize(compressed.size)}` });
    return compressed;
  }

  /** One signature is shared by all photos in a run. */
  private getSignature(): Promise<SignatureResponse> {
    this.sigPromise ??= this.api.getSignature(this.currentMeta!);
    return this.sigPromise;
  }
}