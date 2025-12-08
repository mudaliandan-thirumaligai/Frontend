import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  folders: Folder[] = [];

  selectedImage: string | null = null;
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

  openImage(img: string) {
    this.selectedImage = img;
    this.isClosing = false;
  }

  closeImage() {
    this.isClosing = true;
    setTimeout(() => {
      this.selectedImage = null;
    }, 250); // match animation duration
  }
}
