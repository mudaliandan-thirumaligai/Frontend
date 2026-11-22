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
          const embedUrl = video.youtubeLink
            ? this.getEmbedUrl(video.youtubeLink)
            : '';

          return {
            title: video.eventName,
            description: video.description,
            url: embedUrl ? this.safe(embedUrl) : null
          };
        });
      },
      error: (err) => {
        console.error('Error loading videos', err);
      }
    });
  }

  private safe(embedUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  /**
   * Converts any supported video link into an embeddable URL.
   * Supports: YouTube (watch, live, shorts, embed, youtu.be, with any extra
   * query params), Instagram (post / reel / tv), Facebook (videos, reels,
   * fb.watch), Vimeo and Google Drive.
   * Returns '' when the link is not recognised.
   */
  private getEmbedUrl(rawUrl: string): string {
    try {
      let link = (rawUrl || '').trim();
      if (!link) return '';

      // tolerate links pasted without https://
      if (!/^https?:\/\//i.test(link)) {
        link = 'https://' + link;
      }

      const url = new URL(link);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const path = url.pathname;

      // ---------- YouTube ----------
      if (host === 'youtu.be') {
        const id = path.split('/').filter(Boolean)[0] || '';
        return this.youtubeEmbed(id);
      }

      if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com') {
        // youtube.com/watch?v=ID
        if (path === '/watch' || path === '/watch/') {
          return this.youtubeEmbed(url.searchParams.get('v') || '');
        }

        // youtube.com/live/ID, /shorts/ID, /embed/ID, /v/ID
        const match = path.match(/^\/(?:live|shorts|embed|v)\/([a-zA-Z0-9_-]{11})/);
        if (match) {
          return this.youtubeEmbed(match[1]);
        }

        // fallback: ?v=ID on any other youtube path
        return this.youtubeEmbed(url.searchParams.get('v') || '');
      }

      // ---------- Instagram ----------
      if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
        // instagram.com/reel/CODE, /p/CODE, /tv/CODE, /reels/CODE, /username/reel/CODE
        const match = path.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
        if (match) {
          const type = match[1] === 'reels' ? 'reel' : match[1];
          return `https://www.instagram.com/${type}/${match[2]}/embed`;
        }
        return '';
      }

      // ---------- Facebook ----------
      if (host === 'fb.watch' || host === 'facebook.com' || host.endsWith('.facebook.com')) {
        const clean = `${url.origin}${path}${url.search}`;
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false`;
      }

      // ---------- Vimeo ----------
      if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const match = path.match(/(\d{6,})/);
        if (match) {
          const hash = url.searchParams.get('h');
          return `https://player.vimeo.com/video/${match[1]}${hash ? '?h=' + hash : ''}`;
        }
        return '';
      }

      // ---------- Google Drive ----------
      if (host === 'drive.google.com') {
        const match = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const id = match ? match[1] : url.searchParams.get('id') || '';
        return id ? `https://drive.google.com/file/d/${id}/preview` : '';
      }

      return '';
    } catch {
      return '';
    }
  }

  private youtubeEmbed(id: string): string {
    return /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? `https://www.youtube.com/embed/${id}`
      : '';
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