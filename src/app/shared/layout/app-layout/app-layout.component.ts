import { Component, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { AuthService } from '../../services/Auth/auth.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { ConnectivityService } from '\../../services/connectivity.service';
// import { OfflineBannerComponent } from '../../../shared/components/offline-banner/offline-banner';

interface MenuItem {
  label: string;
  route: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppFooterComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {

  isAdmin$!: Observable<boolean>;

  scrollPercent = 0;

  // Mobile state
  moreOpen = false;
  hideMobileBar = false;
  private lastScrollTop = 0;

  // Mobile back-navigation state
  currentUrl = '';
  showBack = false;       // true on inner pages -> top bar shows Back + title
  pageTitle = '';
  isMoreRoute = false;    // true when current page was opened from the "More" sheet

  // Only Home hides the Back button; every other page shows it
  private readonly rootRoutes = [
    '/'
  ];

  // Page titles shown next to the Back button on mobile
  private readonly pageTitles: Record<string, string> = {
    '/about-thirumaaligai': 'About Thirumaligai',
    '/calendar': 'Calendar',
    '/bank-info': 'Sambhavanai',
    '/about-swamy': 'Aachariyan Perumai',
    '/swamy-schedule': 'Swamy Schedule',
    '/alwargal': 'Azhwargal',
    '/aachariyargal': 'Aacharyas',
    '/pothu-thaniyans': 'Pothu Thaniyans',
    '/thaniyans': 'Thaniyans',
    '/samashrayanam': 'Samashrayanam',
    '/vaazhi-thirunaamam': 'Vaazhi Thirunaamam',
    '/thirumaligais': 'Our Thirumaligais',
    '/past-events': 'Past Events',
    '/gallery': 'Photo Gallery',
    '/videos': 'Videos',
    '/documents': 'Documents',
    '/registration': 'Queries'
  };

  // First navigation row
  mainMenu: MenuItem[] = [
    {
      label: 'About Thirumaligai',
      route: '/about-thirumaaligai'
    },
    {
      label: 'Calendar',
      route: '/calendar'
    },
    // {
    //   label: 'Archive',
    //   route: '/gallery'
    // },
    {
      label: 'Sambhavanai',
      route: '/bank-info'
    }
  ];

  // Second navigation row
  secondaryMenu: MenuItem[] = [

    // About
    { label: 'Aachariyan Perumai', route: '/about-swamy' },
    { label: 'Swamy Schedule', route: '/swamy-schedule' },
    { label: 'Azhwargal', route: '/alwargal' },
    { label: 'Aacharyas', route: '/aachariyargal' },
    { label: 'Pothu Thaniyans', route: '/pothu-thaniyans' },
    { label: 'Thaniyans', route: '/thaniyans' },
    { label: 'Samashrayanam', route: '/samashrayanam' },
    { label: 'Vaazhi Thirunaamam', route: '/vaazhi-thirunaamam' },
    { label: 'Our Thirumaligais', route: '/thirumaligais' },

    // Events
    // { label: 'Event Calendar', route: '/calendar' },
    { label: 'Past Events', route: '/past-events' },

    // Archive
    { label: 'Photo Gallery', route: '/gallery' },
    { label: 'Videos', route: '/videos' },
    { label: 'Documents', route: '/documents' },


    // Additional links
    { label: 'Queries', route: '/registration' },
  ];

  // Grouped version of secondaryMenu, used only by the mobile bottom sheet
  mobileGroups: MenuGroup[] = [
    {
      title: 'About',
      items: [
        { label: 'Aachariyan Perumai', route: '/about-swamy' },
        { label: 'Swamy Schedule', route: '/swamy-schedule' },
        { label: 'Azhwargal', route: '/alwargal' },
        { label: 'Aacharyas', route: '/aachariyargal' },
        { label: 'Our Thirumaligais', route: '/thirumaligais' },
      ]
    },
    {
      title: 'Prayers',
      items: [
        { label: 'Pothu Thaniyans', route: '/pothu-thaniyans' },
        { label: 'Thaniyans', route: '/thaniyans' },
        { label: 'Samashrayanam', route: '/samashrayanam' },
        { label: 'Vaazhi Thirunaamam', route: '/vaazhi-thirunaamam' },
      ]
    },
    {
      title: 'Events & Archive',
      items: [
        { label: 'Past Events', route: '/past-events' },
        { label: 'Photo Gallery', route: '/gallery' },
        { label: 'Videos', route: '/videos' },
        { label: 'Documents', route: '/documents' },
      ]
    },
    {
      title: 'Help',
      items: [
        { label: 'Queries', route: '/registration' },
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.isAdmin$ = this.authService.role$.pipe(
      map((role: string | null) => role === 'admin')
    );

    this.updateRouteState(this.router.url);

    // After any navigation: close the sheet, reset the bar, refresh Back/title state
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.closeMore();
        this.hideMobileBar = false;
        this.updateRouteState((e as NavigationEnd).urlAfterRedirects);
      });
  }

  // ---------- Back navigation ----------

  private cleanPath(url: string): string {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
    return path === '' ? '/' : path;
  }

  private updateRouteState(url: string) {
    this.currentUrl = url;
    const path = this.cleanPath(url);

    this.showBack = !this.rootRoutes.includes(path);

    this.pageTitle = path.startsWith('/thirumaligais/')
      ? 'Thirumaligai'
      : (this.pageTitles[path] ?? '');

    this.isMoreRoute = this.secondaryMenu.some(
      m => path === m.route || path.startsWith(m.route + '/')
    );
  }

  /** Where Back should go when there is no in-app history (e.g. opened from a shared link). */
  private fallbackRoute(): string {
    const path = this.cleanPath(this.currentUrl);
    if (path.startsWith('/thirumaligais/')) return '/thirumaligais';
    return '/';
  }

  goBack() {
    // Angular stores navigationId in each history entry; the first page of the
    // session has navigationId 1, so anything > 1 means there is a page behind us.
    const hasHistory = (window.history.state?.navigationId ?? 0) > 1;

    if (hasHistory) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.fallbackRoute());
    }
  }

  // ---------- "More" sheet ----------

  toggleMore() {
    this.moreOpen ? this.closeMore() : this.openMore();
  }

  openMore() {
    this.moreOpen = true;
    document.body.style.overflow = 'hidden'; // lock background scroll
  }

  closeMore() {
    this.moreOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.moreOpen) this.closeMore();
  }

  // ---------- Scroll ----------

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    this.scrollPercent = docHeight > 0
      ? (scrollTop / docHeight) * 100
      : 0;

    // Mobile: hide top bar on scroll down, show on scroll up.
    // On inner pages the bar stays put so the Back button is always reachable.
    const delta = scrollTop - this.lastScrollTop;
    if (Math.abs(delta) > 6) {
      this.hideMobileBar = !this.showBack && delta > 0 && scrollTop > 56;
      this.lastScrollTop = scrollTop;
    }
  }
}