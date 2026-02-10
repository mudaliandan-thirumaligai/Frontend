import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { POTHU_THANIYANS, PothuThanian } from './pothu-thaniyans.data';

@Component({
  selector: 'app-pothu-thaniyans',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './pothu-thaniyans.component.html',
  styleUrls: ['./pothu-thaniyans.component.css']
})
export class PothuThaniyansComponent implements AfterViewInit {

  thaniyans: PothuThanian[] = POTHU_THANIYANS;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  private initScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const cards = this.el.nativeElement.querySelectorAll('.animate-card');
    cards.forEach((card: HTMLElement) => observer.observe(card));
  }

}