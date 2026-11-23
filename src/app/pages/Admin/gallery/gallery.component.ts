import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import {
  BulkCreateGalleryDto,
  CloudinaryResult,
  GalleryAdminService,
  GalleryPhoto,
  HttpError,
  SignatureResponse,
} from '../../../service/gallery-admin.service';

const CONCURRENCY = 3;
const MAX_RETRIES = 2; // 2 retries = up to 3 attempts per photo

type Stage = 'waiting' | 'compressing' | 'uploading' | 'ready' | 'saving' | 'done' | 'failed';

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
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class AdminGallery {
  private readonly api = inject(GalleryAdminService);

  // form state
  readonly utsavamName = signal('');
  readonly location = signal('');
  readonly year = signal(String(new Date().getFullYear()));
  readonly files = signal<File[]>([]);

  // upload state
  readonly jobs = signal<UploadJob[]>([]);
  readonly busy = signal(false);
  readonly formError = signal('');
  readonly serverMessage = signal('');
  readonly serverMessageIsError = signal(false);
  readonly finished = signal(false);

  // manage (list + delete) state
  readonly photos = signal<GalleryPhoto[]>([]);
  readonly photosLoading = signal(false);
  readonly photosError = signal('');
  readonly deleteMessage = signal('');
  readonly deletingId = signal<string | null>(null);
  readonly search = signal('');

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
    return `${this.doneCount()} of ${total} photos added. ${failed.length} did NOT save. Press "Try the failed photos again".`;
  });
  readonly visiblePhotos = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.photos();
    return this.photos().filter((p) =>
      `${p.name} ${p.utsavamName} ${p.location} ${p.year}`.toLowerCase().includes(q)
    );
  });

  private caches = new Map<number, JobCache>();
  private currentMeta: EventMeta | null = null;
  private sigPromise: Promise<SignatureResponse> | null = null;

  constructor() {
    this.loadPhotos();
  }

  /* ---------------------------- input handlers ---------------------------- */
  onUtsavam(e: Event) { this.utsavamName.set((e.target as HTMLInputElement).value); }
  onLocation(e: Event) { this.location.set((e.target as HTMLInputElement).value); }
  onYear(e: Event) { this.year.set((e.target as HTMLInputElement).value); }
  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
  onFiles(e: Event) {
    const list = Array.from((e.target as HTMLInputElement).files ?? []).filter((f) =>
      f.type.startsWith('image/')
    );
    this.files.set(list);
  }

  /* ------------------------------ upload actions ------------------------------ */
  async upload() {
    if (this.busy()) return;
    this.formError.set('');
    this.serverMessage.set('');

    const utsavamName = this.utsavamName().trim();
    const location = this.location().trim();
    const year = Number(this.year());

    if (!utsavamName) return this.formError.set('Please type the utsavam name.');
    if (!location) return this.formError.set('Please type the location.');
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      return this.formError.set('Please type a valid year, for example 2026.');
    }
    if (this.files().length === 0) return this.formError.set('Please choose at least one photo.');

    this.currentMeta = { utsavamName, location, year };

    this.caches.clear();
    this.finished.set(false);
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
    this.serverMessage.set('');
    this.finished.set(false);
    await this.run(ids);
  }

  /* ------------------------------ manage actions ------------------------------ */
  async loadPhotos() {
    this.photosLoading.set(true);
    this.photosError.set('');
    try {
      this.photos.set(await this.api.getPhotos());
    } catch (err) {
      this.photosError.set((err as Error).message);
    } finally {
      this.photosLoading.set(false);
    }
  }

  async deletePhoto(p: GalleryPhoto) {
    if (this.deletingId()) return;
    if (!confirm(`Delete "${p.name}" from ${p.utsavamName} (${p.year})? This cannot be undone.`)) return;

    this.deletingId.set(p._id);
    this.photosError.set('');
    this.deleteMessage.set('');
    try {
      const res = await this.api.deletePhoto(p._id);
      this.photos.update((list) => list.filter((x) => x._id !== p._id));
      this.deleteMessage.set(res?.message || 'Photo deleted.');
    } catch (err) {
      this.photosError.set((err as Error).message);
    } finally {
      this.deletingId.set(null);
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
        this.files.set([]);
        const el = this.picker()?.nativeElement;
        if (el) el.value = '';
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
      if (typeof res?.message === 'string') {
        this.serverMessage.set(res.message);
        this.serverMessageIsError.set(false);
      }
    } catch (err) {
      const message = (err as Error)?.message || 'Unknown error';
      // The server deletes these images from Cloudinary when a save fails,
      // so forget them: a retry must upload them again.
      ids.forEach((id) => {
        this.caches.get(id)!.uploaded = undefined;
        this.patch(id, { stage: 'failed', statusText: 'Not saved. Press "Try again".', progress: 0 });
      });
      this.serverMessage.set(message);
      this.serverMessageIsError.set(true);
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