import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-videos',
  imports: [PageBreadcrumbComponent, CommonModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent {

  videos: any[] = [];
  selectedVideo: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {
    this.videos = [
      {
        title: 'Sree Padha Theertham Mahimai',
        description: 'By KKVA Kumara Ramanujachariya Swamy',
        url: this.safe('vHb1_GE2D4A')
      },
      {
        title: 'Thirumaligai Perumals - 1',
        description: 'By KKVA Kumara Ramanujachariya Swamy',
        url: this.safe('Ch_8_kATyik')
      },
      {
        title: 'Thirmalagai Perumals - 2',
        description: 'By KKVA Kumara Ramanujachariya Swamy',
        url: this.safe('Ch_8_kATyik')
      }
    ];
  }

  private safe(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  }

  openVideo(video: any) {
    this.selectedVideo = video.url;
  }

  closeVideo() {
    this.selectedVideo = null;
  }
   // 🔑 ESC KEY BINDING
  @HostListener('document:keydown.escape', ['$event'])
  onEscPressed(event: KeyboardEvent) {
    if (this.selectedVideo) {
      this.closeVideo();
    }
  }
}
