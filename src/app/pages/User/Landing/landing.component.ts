import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { EventService } from '../../../service/event.service';
import { CalendarEvent } from '../../../shared/interfaces/calender-event.interface';
import { VisitorService } from '../../../service/visitors.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  visitorCount = 0;

  // 🔹 Upcoming Event
  nextEvent: CalendarEvent | null = null;
  loadingEvent = true;
  noUpcomingEvent = false;

  // 🔹 Scroll observer reference (kept for cleanup)
  private scrollObserver: IntersectionObserver | null = null;

  constructor(private eventService: EventService, private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.fetchNextUpcomingEvent();
    this.trackVisitor();
  }

  ngAfterViewInit(): void {
    this.startTypingEffect();
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    // Disconnect observer to prevent memory leaks when navigating away
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
  }

  // ─── Event fetching ────────────────────────────────────────────

  fetchNextUpcomingEvent(): void {
    this.eventService.getNextUpcomingEvent().subscribe({
      next: (events: CalendarEvent[]) => {
        this.nextEvent = events.length ? events[0] : null;
        this.noUpcomingEvent = !this.nextEvent;
        this.loadingEvent = false;
        // Re-run after event data renders into the DOM
        setTimeout(() => this.initScrollAnimations());
      },
      error: (err: HttpErrorResponse) => {
        console.warn('No upcoming events:', err.error?.message);
        this.noUpcomingEvent = true;
        this.loadingEvent = false;
      }
    });
  }

  // ─── Visitor tracking ──────────────────────────────────────────

  private trackVisitor(): void {
    const visitorId = this.getVisitorId();

    this.visitorService.registerVisit(visitorId).subscribe({
      next: res => {
        this.visitorCount = res.count;
      },
      error: () => {
        this.visitorService.getCount().subscribe(res => {
          this.visitorCount = res.count;
        });
      }
    });
  }

  private getVisitorId(): string {
    const key = 'tm_visitor_id';
    let id = localStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }

    return id;
  }

  // ─── Typewriter effect ─────────────────────────────────────────

  words: string[] = [
    'ஆசார்ய பக்தி',
    'கைங்கர்யம்',
    'ஸ்ரீ வைஷ்ணவ சம்பிரதாயம்',
    'ராமானுஜ சம்பந்தம்'
  ];

  typedText = '';
  wordIndex = 0;
  charIndex = 0;
  isDeleting = false;

  startTypingEffect(): void {
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

  // ─── Scroll-triggered animations ──────────────────────────────
  //
  // Looks for every element with class .animate-on-scroll.
  // When the element scrolls into view, adds .visible,
  // which triggers the matching CSS animation.
  // Stops observing each element after it has animated once.

  initScrollAnimations(): void {
    // Disconnect any previous observer before creating a new one
    // (called twice: once in ngAfterViewInit, once after event data loads)
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    const elements = document.querySelectorAll('.animate-on-scroll');

    if (!elements.length) return;

    this.scrollObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.scrollObserver?.unobserve(entry.target); // fire once only
          }
        });
      },
      {
        threshold: 0.12,                  // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px'  // start slightly before fully in view
      }
    );

    elements.forEach(el => this.scrollObserver!.observe(el));
  }
}