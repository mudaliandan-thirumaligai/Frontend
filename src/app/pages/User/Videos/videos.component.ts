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
    const regex =
      /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
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
