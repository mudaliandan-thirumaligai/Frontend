import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  _id?: string;
  eventName?: string;
  location?: string;
  description?: string;
  youtubeLink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private readonly baseUrl = 'http://localhost:8080/media/videos';

  constructor(private http: HttpClient) {}

  // 🔹 GET ALL VIDEOS
  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.baseUrl);
  }

  // 🔹 GET SINGLE VIDEO
  getVideoById(id: string): Observable<Video> {
    return this.http.get<Video>(`${this.baseUrl}/${id}`);
  }

  // 🔹 CREATE VIDEO
  createVideo(payload: Video): Observable<Video> {
    return this.http.post<Video>(this.baseUrl, payload);
  }

  // 🔹 UPDATE VIDEO
  updateVideo(id: string, payload: Video): Observable<Video> {
    return this.http.put<Video>(`${this.baseUrl}/${id}`, payload);
  }

  // 🔹 DELETE VIDEO
  deleteVideo(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
