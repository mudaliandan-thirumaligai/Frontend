import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { VaazhiThirunaamam } from './vaazhi-thirunaamam.model';
import { VAAZHI_THIRUNAAMAMS } from './vaazhi-thirunaamam.data';

@Component({
  selector: 'app-vaazhithirunaamam',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './vaazhithirunaamam.component.html',
  styleUrls: ['./vaazhithirunaamam.component.css']
})
export class VaazhithirunaamamComponent implements AfterViewInit {

  vaazhiThirunaamams: VaazhiThirunaamam[] = VAAZHI_THIRUNAAMAMS;

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
            observer.unobserve(entry.target);
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