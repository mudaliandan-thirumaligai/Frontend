import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaService } from '../../../service/media.service';

@Component({
  selector: 'app-videos',
  imports: [PageBreadcrumbComponent, CommonModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
})
export class VideosComponent implements OnInit {

  videos: any[] = [];
  selectedVideo: SafeResourceUrl | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  private loadVideos() {
    this.mediaService.getVideos().subscribe({
      next: (data) => {
        this.videos = data.map(video => {
          const youtubeId = video.youtubeLink
            ? this.extractYoutubeId(video.youtubeLink)
            : '';

          return {
            title: video.eventName,
            description: video.description,
            url: youtubeId ? this.safe(youtubeId) : null
          };
        });
      },
      error: (err) => {
        console.error('Error loading videos', err);
      }
    });
  }


  private safe(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  }

  private extractYoutubeId(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');

      // Short URL: youtu.be/VIDEO_ID
      if (hostname === 'youtu.be') {
        return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
      }

      // Standard YouTube URLs
      if (
        hostname === 'youtube.com' ||
        hostname === 'm.youtube.com' ||
        hostname === 'music.youtube.com'
      ) {
        // youtube.com/watch?v=VIDEO_ID
        if (parsedUrl.pathname === '/watch') {
          return parsedUrl.searchParams.get('v') || '';
        }

        // youtube.com/live/VIDEO_ID
        // youtube.com/shorts/VIDEO_ID
        // youtube.com/embed/VIDEO_ID
        // youtube.com/v/VIDEO_ID
        const match = parsedUrl.pathname.match(
          /^\/(?:live|shorts|embed|v)\/([a-zA-Z0-9_-]{11})(?:\/|$)/
        );

        return match ? match[1] : '';
      }

      return '';
    } catch {
      return '';
    }
  }

  openVideo(video: any) {
    this.selectedVideo = video.url;
  }

  closeVideo() {
    this.selectedVideo = null;
  }

  // 🔑 ESC KEY BINDING
  @HostListener('document:keydown.escape')
  onEscPressed() {
    if (this.selectedVideo) {
      this.closeVideo();
    }
  }
}
