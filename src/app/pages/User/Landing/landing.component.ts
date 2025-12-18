import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';  // for ngModel
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,FormsModule,RouterModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent {
    // 🔹 Gallery Preview Images
  galleryImages: string[] = [
    'images/swamy/pooramchennai13/img_1.JPG',
    'images/swamy/pooramchennai13/img_2.JPG',
    'images/swamy/pooramchennai13/img_3.JPG',
    'images/swamy/pooramchennai13/img_4.JPG',
    'images/swamy/pooramchennai13/img_5.JPG'
  ];

  ngAfterViewInit(): void {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach(el => observer.observe(el));
  }


}
