import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MediaService, Video } from '../../../service/media.service';

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

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  // Load all videos from backend
  loadVideos(): void {
    this.mediaService.getVideos().subscribe({
      next: (data) => this.videos = data,
      error: (err) => console.error('Failed to load videos', err),
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

    this.mediaService.updateVideo(this.editingVideoId, this.editedData).subscribe({
      next: (updated) => {
        const index = this.videos.findIndex(v => v._id === updated._id);
        if (index !== -1) this.videos[index] = updated;
        this.cancelEdit();
      },
      error: (err) => console.error('Failed to update video', err),
    });
  }

  // Delete video
  deleteVideo(video: Video): void {
    if (!video._id || !confirm(`Delete "${video.eventName ?? ''}"?`)) return;

    this.mediaService.deleteVideo(video._id).subscribe({
      next: () => this.videos = this.videos.filter(v => v._id !== video._id),
      error: (err) => console.error('Failed to delete video', err),
    });
  }

  // Filtered videos based on search term
  get filteredVideos(): Video[] {
    if (!this.searchTerm) return this.videos;
    return this.videos.filter(v =>
      (v.eventName ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (v.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
      alert('Event Name and YouTube Link are required.');
      return;
    }

    this.mediaService.createVideo(this.newVideoData).subscribe({
      next: (video) => {
        this.videos.push(video);      // add to existing list
        this.cancelAddNewVideo();      // close form
      },
      error: (err) => console.error('Failed to create video', err),
    });
  }

}
