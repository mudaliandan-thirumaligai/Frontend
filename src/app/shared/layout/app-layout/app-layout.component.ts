import { Component, HostListener } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { AppSidebarComponentNew } from '../app-sidebar/app-sidebar-new';
import { AuthService } from '../../services/Auth/auth.service';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
interface MenuItem {
  label: string;
  route?: string; // optional
  open?: boolean; // for mobile dropdown
  isOpen?: boolean;
  closeTimeout?: any; // store timeout
  children?: { label: string; route: string }[];
}

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    BackdropComponent,
    AppFooterComponent,
    AppSidebarComponentNew
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  // Sidebar observables (from service)
  readonly isExpanded$: Observable<boolean>;
  readonly isHovered$: Observable<boolean>;
  readonly isMobileOpen$: Observable<boolean>;

  // Admin observable
  isAdmin$: Observable<boolean>;

  // Expose a role string observable if you still need textual role in template
  role$: Observable<string | null>;

  // scroll percent
  scrollPercent = 0;
  //  Header state variables for submenu toggles
  isMenuOpen = false;
  openAbout = false;
  openEvents = false;
  openContact = false;
  openDropdown(item: MenuItem) {
  // cancel any previous close timeout
  if (item.closeTimeout) clearTimeout(item.closeTimeout);
  item.isOpen = true;
}

closeDropdown(item: MenuItem) {
  // wait 300ms before closing
  item.closeTimeout = setTimeout(() => {
    item.isOpen = false;
  }, 150);
}

  menu: MenuItem[] = [
  {
    label: 'About',
    open: false,
    children: [
      { label: 'About Swami', route: '/about-swami' },
      { label: 'Mission', route: '/mission' },
      { label: 'History', route: '/history' },
      { label: 'Our Thirumaligais', route: '/thirumaligais' }
    ]
  },
  {
    label: 'Events',
    open: false,
    children: [
      { label: 'Event Calendar', route: '/calendar' },
      { label: 'Past Events', route: '/past-events' }
    ]
  },
  {
    label: 'Media',
    open: false,
    children: [
      { label: 'Photo Gallery', route: '/gallery' },
      { label: 'Videos', route: '/videos' },
      { label: 'Documents', route: '/documents' }
    ]
  },
  {
    label: 'Leadership',
    open: false,
    children: [
      { label: 'Swami & Team', route: '/leadership/team' },
      { label: 'Organization Structure', route: '/leadership/structure' }
    ]
  },
  {
    label: 'Contact',
    open: false,
    children: [
      { label: 'Bank Details', route: '/bank-info' },
      { label: 'Receive Communication', route: '/registration' }
    ]
  }
];



  // A reactive computed observable that yields the container classes (string[] or string)
  containerClasses$: Observable<string[]>;

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    this.scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }

  constructor(public sidebarService: SidebarService, private authService: AuthService) {
    // assign Observables from service
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;

    // role observable as raw string (may be null)
    this.role$ = this.authService.role$;

    // admin flag as boolean Observable (match backend exactly)
    this.isAdmin$ = this.authService.role$.pipe(
      map(role => role === 'admin')
    );

    // compute container classes reactively from the needed observables
    // combineAdmin ensures when admin=false there is no xl margin applied
    this.containerClasses$ = combineLatest([
      this.isAdmin$,
      this.isExpanded$,
      this.isHovered$,
      this.isMobileOpen$
    ]).pipe(
      map(([isAdmin, isExpanded, isHovered, isMobileOpen]) => {
        const classes = [
          'flex-1',
          'transition-all',
          'duration-300',
          'ease-in-out'
        ];

        // if mobile open -> always ml-0 (override)
        if (isMobileOpen) {
          classes.push('ml-0');
          return classes;
        }

        // only add xl margins when sidebar is present (admin)
        if (!isAdmin) {
          // non-admin -> no left margin
          classes.push('ml-0');
          return classes;
        }

        // admin -> decide between expanded/hovered or collapsed
        if (isExpanded || isHovered) {
          classes.push('xl:ml-[290px]');
        } else {
          classes.push('xl:ml-[90px]');
        }

        return classes;
      })
    );
  }
}
