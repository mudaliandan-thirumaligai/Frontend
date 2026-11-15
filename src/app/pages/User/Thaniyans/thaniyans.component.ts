import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MUDALIANDAN_THANIYANS, Thanian } from './thaniyan.data';

@Component({
  selector: 'app-thaniyans',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './thaniyans.component.html',
  styleUrls: ['./thaniyans.component.css']
})
export class ThaniyansComponent implements AfterViewInit {

  thaniyans: Thanian[] = MUDALIANDAN_THANIYANS;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  private initScrollAnimations(): void {
  const cards = this.el.nativeElement.querySelectorAll('.reveal-card');

  // set initial hidden state
  cards.forEach((card: HTMLElement) => {
    card.classList.add('pre-reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pre-reveal');
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  cards.forEach((card: HTMLElement) => observer.observe(card));
}

}