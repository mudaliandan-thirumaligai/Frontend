import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { environment } from '../environment/environment'; // adjust the path to match your project

const SKIP_COMPRESSION_UNDER_BYTES = 500 * 1024;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface SignatureResponse {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  tags: string;
  upload_preset?: string;
}

export interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

/** Mirrors BulkPhotoDto. */
export interface BulkPhoto {
  name: string;
  url: string;
  publicId: string;
}

/** Mirrors BulkCreateGalleryDto. */
export interface BulkCreateGalleryDto {
  utsavamName: string;
  year: number;
  location: string;
  photos: BulkPhoto[];
}

/** A photo already saved in the gallery (what GET /gallery returns). */
export interface GalleryPhoto {
  _id: string;
  name: string;
  url: string;
  utsavamName: string;
  year: number;
  location: string;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: 'root' })
export class GalleryAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + '/gallery';

  /* ---------------------------- gallery API ---------------------------- */
  getPhotos(): Promise<GalleryPhoto[]> {
    return this.call(this.http.get<GalleryPhoto[]>(this.baseUrl));
  }

  deletePhoto(id: string): Promise<{ message?: string }> {
    return this.call(this.http.delete<{ message?: string }>(`${this.baseUrl}/${id}`));
  }

  getSignature(meta: { utsavamName: string; year: number }): Promise<SignatureResponse> {
    return this.call(
      this.http.post<SignatureResponse>(`${this.baseUrl}/admin/upload-signature`, {
        utsavamName: meta.utsavamName,
        year: meta.year,
      })
    );
  }

  saveBulk(body: BulkCreateGalleryDto): Promise<{ message?: string }> {
    return this.call(this.http.post<{ message?: string }>(`${this.baseUrl}/admin/bulk`, body));
  }

  /* ---------------------------- images ---------------------------- */
  shouldCompress(file: File): boolean {
    return file.size >= SKIP_COMPRESSION_UNDER_BYTES;
  }

  /** Shrinks a photo to at most 1600px / ~0.5 MB. onProgress receives 0-100. */
  async compress(original: File, onProgress: (pct: number) => void): Promise<File> {
    const out = await imageCompression(original, {
      maxWidthOrHeight: 1600,
      initialQuality: 0.8,
      maxSizeMB: 0.5,
      useWebWorker: true,
      preserveExif: false, // orientation is baked into the pixels
      onProgress,
    });
    return new File([out], original.name.replace(/\.(heic|heif|png|webp)$/i, '.jpg'), {
      type: out.type || 'image/jpeg',
    });
  }

  /**
   * Uploads straight from the browser to Cloudinary using the server-made signature.
   * Deliberately NOT HttpClient: your auth interceptor must not add the JWT to a third-party request.
   */
  uploadToCloudinary(
    file: File,
    sig: SignatureResponse,
    onProgress: (pct: number) => void
  ): Promise<CloudinaryResult> {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.api_key);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      fd.append('tags', sig.tags);
      if (sig.upload_preset) fd.append('upload_preset', sig.upload_preset);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
      xhr.timeout = 120_000;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let data: any = null;
        try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
        if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url && data?.public_id) {
          resolve(data as CloudinaryResult);
        } else {
          reject(new HttpError(xhr.status, data?.error?.message || `Upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new HttpError(0, 'Network problem while uploading.'));
      xhr.ontimeout = () => reject(new HttpError(0, 'Upload took too long.'));
      xhr.send(fd);
    });
  }

  /* ---------------------------- helpers ---------------------------- */
  private async call<T>(request: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  /** Turns Angular's HttpErrorResponse into a plain-language HttpError. */
  private toHttpError(err: unknown): HttpError {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return new HttpError(0, 'Cannot reach the server. Please check your internet connection.');
      }
      if (err.status === 401) {
        return new HttpError(401, 'You are not logged in, or your session expired. Please log in again.');
      }
      if (err.status === 403) {
        return new HttpError(403, 'This account is not an admin.');
      }
      const m = err.error?.message;
      const msg = Array.isArray(m) ? m.join('\n') : m;
      return new HttpError(err.status, msg || `Server error (${err.status})`);
    }
    return new HttpError(0, (err as Error)?.message || 'Unknown error');
  }
}