import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, AfterViewInit, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
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

  constructor(
    private eventService: EventService, 
    private visitorService: VisitorService,
    private router: Router
  ) {}

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
    // NEW: make sure page scrolling is restored if the viewer was open
    document.body.style.overflow = '';
    clearTimeout(this.tapTimer);
    clearTimeout(this.toastTimer);
  }

  // ─── Event fetching ────────────────────────────────────────────

  fetchNextUpcomingEvent(): void {
    this.eventService.getNextUpcomingEvent().subscribe({
      next: (events: CalendarEvent[]) => {
        if (events && events.length > 0) {
          this.nextEvent = events[0];
          this.noUpcomingEvent = false;
          console.log('📅 Next event loaded:', this.nextEvent.name);
        } else {
          this.nextEvent = null;
          this.noUpcomingEvent = true;
          console.log('ℹ️ No upcoming events found');
        }
        this.loadingEvent = false;
        // Re-run after event data renders into the DOM
        setTimeout(() => this.initScrollAnimations(), 100);
      },
      error: (err: HttpErrorResponse) => {
        console.warn('⚠️ Error fetching upcoming events:', err.error?.message || err.message);
        this.nextEvent = null;
        this.noUpcomingEvent = true;
        this.loadingEvent = false;
      }
    });
  }

  // ─── Navigate to event in calendar ─────────────────────────────

  navigateToEventInCalendar(): void {
    if (!this.nextEvent) return;
    
    // Navigate to calendar with event date as query parameter
    // This tells the calendar component to navigate to that date and show a prompt
    this.router.navigate(['/calendar'], {
      queryParams: {
        date: this.nextEvent.startDate,
        highlightEvent: this.nextEvent.id,
        showPrompt: true
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

  // =====================================================================
  // NEW — MOBILE LANDING: data + photo viewer
  // =====================================================================

  // Accordion sections for "Explore Our Heritage" (mobile)
  openSection: string | null = 'about';

  learnSections = [
    { key: 'about', title: 'About Us', links: [
      { label: 'About Thirumaligai',  link: '/about-thirumaaligai' },
      { label: 'Varthamaana Swami',   link: '/about-swamy' },
      { label: 'Our History',         link: '/aachariyargal' },
      { label: 'Our Thirumaligais',   link: '/thirumaligais' },
    ]},
    { key: 'knowledge', title: 'Spiritual Knowledge', links: [
      { label: 'Pothu Thaniyans',     link: '/pothu-thaniyans' },
      { label: 'Thaniyans',           link: '/thaniyans' },
      { label: 'Samashrayanam',       link: '/samashrayanam' },
      { label: 'Vaazhi Thirunaamam',  link: '/vaazhi-thirunaamam' },
      { label: 'Documents',           link: '/documents' },
    ]},
    { key: 'azhwargal', title: 'Azhwargal & Aachariyargal', links: [
      { label: '12 Azhwargal',        link: '/alwargal' },
      { label: 'Aachariyargal',       link: '/history' },
    ]},
    { key: 'media', title: 'Media Archive', links: [
      { label: 'Photos',              link: '/gallery' },
      { label: 'Videos',              link: '/videos' },
    ]},
  ];

  toggleSection(key: string): void {
    this.openSection = this.openSection === key ? null : key;
  }

  tabs = [
    { icon: '🏠', label: 'Home',     link: '/' },
    { icon: '📅', label: 'Events',   link: '/calendar' },
    { icon: '🖼️', label: 'Photos',   link: '/gallery' },
    { icon: '🗓️', label: 'Schedule', link: '/swamy-schedule' },
    { icon: '🤲', label: 'Donate',   link: '/bank-info' },
  ];

  photos = [
    { src: 'images/Permual_Photos/perumal_08.jpeg', caption: 'Sacred Essence' },
    { src: 'images/Permual_Photos/perumal_09.jpeg', caption: 'Divine Blessings' },
    { src: 'images/Permual_Photos/perumal_10.jpeg', caption: 'Spiritual Grace' },
    { src: 'images/Permual_Photos/perumal_11.jpeg', caption: 'Holy Presence' },
    { src: 'images/Permual_Photos/perumal_12.jpeg', caption: 'Eternal Light' },
    { src: 'images/Permual_Photos/perumal_13.jpeg', caption: 'Divine Presence' },
    { src: 'images/Permual_Photos/perumal_14.jpeg', caption: 'Blessed Moments' },
    { src: 'images/Permual_Photos/perumal_15.jpeg', caption: 'Sacred Journey' },
    { src: 'images/Permual_Photos/perumal_16.jpeg', caption: 'Spiritual Wisdom' },
    { src: 'images/Permual_Photos/perumal_17.jpeg', caption: 'Divine Blessings' },
    { src: 'images/Permual_Photos/perumal_18.jpeg', caption: 'Holy Moments' },
    { src: 'images/Permual_Photos/perumal_19.jpeg', caption: 'Sacred Path' },
  ];

  // ---------- viewer state ----------
  viewerIndex: number | null = null;
  chromeVisible = true;
  toast = '';

  private lastTap = 0;
  private tapTimer: any;
  private toastTimer: any;
  private touchStartX = 0;
  private touchStartY = 0;
  private swiped = false;

  // ---------- viewer actions ----------
  openViewer(i: number): void {
    this.viewerIndex = i;
    this.chromeVisible = true;
    document.body.style.overflow = 'hidden';
    history.pushState({ viewer: true }, ''); // Android back button closes the viewer
    this.preloadNeighbours();
  }

  closeViewer(fromPopState = false): void {
    if (this.viewerIndex === null) return;
    this.viewerIndex = null;
    document.body.style.overflow = '';
    if (!fromPopState && history.state?.viewer) history.back();
  }

  @HostListener('window:popstate')
  onPopState(): void { this.closeViewer(true); }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.closeViewer(); }

  step(dir: 1 | -1): void {
    if (this.viewerIndex === null) return;
    this.viewerIndex = (this.viewerIndex + dir + this.photos.length) % this.photos.length;
    this.preloadNeighbours();
  }

  private preloadNeighbours(): void {
    if (this.viewerIndex === null) return;
    const n = this.photos.length;
    [1, -1].forEach(d => { new Image().src = this.photos[(this.viewerIndex! + d + n) % n].src; });
  }

  // ---------- gestures ----------
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.swiped = false;
  }

  onTouchEnd(e: TouchEvent): void {
    const zoomed = (window.visualViewport?.scale ?? 1) > 1.05;
    if (zoomed || e.changedTouches.length !== 1) return; // let pinch/pan breathe
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      this.swiped = true;
      this.step(dx < 0 ? 1 : -1);
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { // swipe down to close
      this.swiped = true;
      this.closeViewer();
    }
  }

  onImageTap(): void {
    if (this.swiped) { this.swiped = false; return; }
    const now = Date.now();
    if (now - this.lastTap < 300) {            // double tap → download
      clearTimeout(this.tapTimer);
      this.lastTap = 0;
      this.downloadCurrent();
    } else {                                   // single tap → toggle bars (after double-tap window)
      this.lastTap = now;
      this.tapTimer = setTimeout(() => (this.chromeVisible = !this.chromeVisible), 300);
    }
  }

  // ---------- download ----------
  async downloadCurrent(): Promise<void> {
    if (this.viewerIndex === null) return;
    const p = this.photos[this.viewerIndex];
    try {
      const blob = await (await fetch(p.src)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = p.src.split('/').pop() || 'photo.jpeg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.showToast('Saved ✓');
    } catch {
      window.open(p.src, '_blank'); // fallback: long-press to save
      this.showToast('Long-press the image to save');
    }
  }

  private showToast(msg: string): void {
    this.toast = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 1800);
  }
}