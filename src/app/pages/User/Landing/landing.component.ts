import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, AfterViewInit, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { EventService } from '../../../service/event.service';
import { CalendarEvent } from '../../../shared/interfaces/calender-event.interface';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent implements OnInit, AfterViewInit {

  // 🔹 Gallery Preview Images
  galleryImages: string[] = [
    'images/swamy/pooramchennai13/img_1.JPG',
    'images/swamy/pooramchennai13/img_2.JPG',
    'images/swamy/pooramchennai13/img_3.JPG',
    'images/swamy/pooramchennai13/img_4.JPG',
    'images/swamy/pooramchennai13/img_5.JPG'
  ];

  // 🔹 Upcoming Event
  nextEvent: CalendarEvent | null = null;
  loadingEvent = true;
  noUpcomingEvent = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.fetchNextUpcomingEvent();
  }

  fetchNextUpcomingEvent(): void {
    this.eventService.getNextUpcomingEvent().subscribe({
      next: (events: CalendarEvent[]) => {
        this.nextEvent = events.length ? events[0] : null;
        this.noUpcomingEvent = !this.nextEvent;
        this.loadingEvent = false;
      },
      error: (err: HttpErrorResponse) => {
        console.warn('No upcoming events:', err.error?.message);
        this.noUpcomingEvent = true;
        this.loadingEvent = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.startTypingEffect();
    this.initScrollAnimations();
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

  // Type writer effect
  // 🔹 Typewriter Effect
words: string[] = [
  'Dharma',
  'Tradition',
  'Spiritual Wisdom',
  'Sacred Lineage'
];

typedText = '';
wordIndex = 0;
charIndex = 0;
isDeleting = false;



  startTypingEffect() {
    const currentWord = this.words[this.wordIndex];

    if (this.isDeleting) {
      this.typedText = currentWord.substring(0, this.charIndex--);
    } else {
      this.typedText = currentWord.substring(0, this.charIndex++);
    }

    if (!this.isDeleting && this.charIndex === currentWord.length + 1) {
      setTimeout(() => (this.isDeleting = true), 1200);
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
    }

    setTimeout(() => this.startTypingEffect(), this.isDeleting ? 60 : 120);
  }

  initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(el => observer.observe(el));
  }

}
