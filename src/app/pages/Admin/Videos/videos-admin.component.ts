import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MediaService, Video } from '../../../service/media.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-videos-admin',
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './videos-admin.component.html',
  styles: [``],
})
export class VideosAdminComponent implements OnInit {

  videos: Video[] = [];
  editingVideoId: string | null = null;  // currently edited video ID
  editedData: Partial<Video> = {};       // temporary form data
  searchTerm: string = '';                // search filter

  constructor(private mediaService: MediaService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  // Load all videos from backend
  loadVideos(): void {
    this.mediaService.getVideos().subscribe({
      next: (data) => this.videos = data,
      error: () => {
        this.toast.showError('Failed to load videos. Please try again.');
      }
    });
  }

  // Start editing a video
  startEdit(video: Video): void {
    this.editingVideoId = video._id || null;
    this.editedData = { ...video }; // copy current values
  }

  // Cancel editing
  cancelEdit(): void {
    this.editingVideoId = null;
    this.editedData = {};
  }

  // Save edited video
  saveEdit(): void {
    if (!this.editingVideoId) return;

    this.toast.showInfo('Updating video...');

    this.mediaService.updateVideo(this.editingVideoId, this.editedData).subscribe({
      next: (updated) => {
        const index = this.videos.findIndex(v => v._id === updated._id);
        if (index !== -1) this.videos[index] = updated;

        this.toast.showSuccess('Video updated successfully');
        this.cancelEdit();
      },
      error: () => {
        this.toast.showError('Failed to update video');
      }
    });
  }
  
  get filteredVideos(): Video[] {
    if (!this.searchTerm) return this.videos;

    return this.videos.filter(video =>
      (video.eventName ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (video.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }



  // Delete video
  deleteVideo(video: Video): void {
    if (!video._id) return;

    if (!confirm(`Delete "${video.eventName ?? 'this video'}"?`)) return;

    this.toast.showInfo('Deleting video...');

    this.mediaService.deleteVideo(video._id).subscribe({
      next: () => {
        this.videos = this.videos.filter(v => v._id !== video._id);
        this.toast.showSuccess('Video deleted successfully');
      },
      error: () => {
        this.toast.showError('Failed to delete video');
      }
    });
  }


  // Add at the top of VideosAdminComponent
  addingNewVideo: boolean = false;       // toggle form visibility
  newVideoData: Partial<Video> = {};     // temporary form data for new video

  // Show the add video form
  startAddNewVideo(): void {
    this.addingNewVideo = true;
    this.newVideoData = {}; // reset form
  }

  // Cancel adding
  cancelAddNewVideo(): void {
    this.addingNewVideo = false;
    this.newVideoData = {};
  }

  // Submit new video
  saveNewVideo(): void {
    if (!this.newVideoData.eventName || !this.newVideoData.youtubeLink) {
      this.toast.showError('Event Name and Video Link are required');
      return;
    }

    // Regex to allow major video providers
    const videoRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|dailymotion\.com\/video\/|drive\.google\.com\/file\/d\/|onedrive\.live\.com\/).*$/i;

    if (!videoRegex.test(this.newVideoData.youtubeLink)) {
      this.toast.showError(
        'Only video links are allowed (YouTube, Vimeo, Dailymotion, Google Drive, OneDrive)'
      );
      return;
    }

    this.toast.showInfo('Adding new video...');

    this.mediaService.createVideo(this.newVideoData).subscribe({
      next: (video) => {
        this.videos.push(video);
        this.toast.showSuccess('Video added successfully');
        this.cancelAddNewVideo();
      },
      error: () => {
        this.toast.showError('Failed to add video');
      }
    });
  }


}
