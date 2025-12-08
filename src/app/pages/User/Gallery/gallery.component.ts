import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  folders: Folder[] = [];

  selectedImage: string | null = null;
  currentFolder: any = null;
  currentIndex: number = 0;
  isClosing = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load JSON
    this.http.get<any>('gallery.json').subscribe((data) => {
      Object.keys(data).forEach((folderName, index) => {
        this.folders.push({
          name: folderName,
          images: data[folderName],
          expanded: index === 0 // first folder open
        });
      });
    });
  }

  toggleFolder(folder: Folder) {
    folder.expanded = !folder.expanded;
    setTimeout(() => {
      document.querySelector(`#${folder.name}`)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 50);
  }

  openImage(img: string, folder: any) {
    this.selectedImage = img;
    this.currentFolder = folder;
    this.currentIndex = folder.images.indexOf(img);
  }

  prevImage() {
    if (!this.currentFolder) return;
    this.currentIndex = (this.currentIndex - 1 + this.currentFolder.images.length) 
                        % this.currentFolder.images.length;
    this.selectedImage = this.currentFolder.images[this.currentIndex];
  }

  nextImage() {
    if (!this.currentFolder) return;
    this.currentIndex = (this.currentIndex + 1) % this.currentFolder.images.length;
    this.selectedImage = this.currentFolder.images[this.currentIndex];
  }

  closeImage() {
    this.selectedImage = null;
    this.currentFolder = null;
  }
  scrollToFolder(folder: Folder) {
    // Ensure the folder is expanded before scrolling
    if (!folder.expanded) folder.expanded = true;

    // Scroll to the folder section smoothly
    setTimeout(() => {
      const element = document.getElementById(folder.name);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50); // small delay to ensure the folder section is rendered
  }


  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedImage) return; // only active when modal is open
    if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'Escape') {
      this.closeImage();
    }
  }
}

