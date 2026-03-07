import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { AuthService } from '../../services/Auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface MenuItem {
  label: string;
  route?: string;
  open?: boolean;
  isOpen?: boolean;
  closeTimeout?: any;
  children?: { label: string; route: string }[];
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
  isMenuOpen = false;

  menu: MenuItem[] = [
    {
      label: 'About',
      children: [
        { label: 'About Mudaliandan Thirumaaligai', route: '/about-thirumaaligai' },
        // { label: 'Aachariyan Perumai', route: '/about-swamy' },
        { label: 'Swamy Schedule', route: '/swamy-schedule' },
        { label: 'Azhwargal', route: '/alwargal' },
        { label: 'Aacharyas', route: '/aachariyargal' },
        { label: 'Pothu Thaniyans', route: '/pothu-thaniyans' },
        { label: 'Thaniyans', route: '/thaniyans' },
        { label: 'Samashrayanam', route: '/samashrayanam' },
        { label: 'Vaazhi Thirunaamam', route: '/vaazhi-thirunaamam' },
        // { label: 'Puruvachaariyargal', route: '/puruvachariyargal' },
        { label: 'Our Thirumaligais', route: '/thirumaligais' },
        // { label: 'Sri Dasarathi Trust', route: '/sri-dasarathi-trust' }
      ]
    },
    {
      label: 'Events',
      children: [
        { label: 'Event Calendar', route: '/calendar' },
        { label: 'Past Events', route: '/past-events' }
      ]
    },
    {
      label: 'Archive',
      children: [
        { label: 'Photo Gallery', route: '/gallery' },
        { label: 'Videos', route: '/videos' },
        { label: 'Documents', route: '/documents' }
      ]
    },
    {
      label: 'Contact',
      children: [
        { label: 'Bank Details', route: '/bank-info' },
        { label: 'Registration', route: '/registration' }
      ]
    }
  ];

  constructor(
  private authService: AuthService,
  private router: Router
) {
  this.isAdmin$ = this.authService.role$.pipe(
    map((role: string | null) => role === 'admin')
  );

  // Auto-close menus on navigation
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.closeAllMenus();
    }
  });
}
closeAllMenus() {
  this.isMenuOpen = false;

  this.menu.forEach(item => {
    item.isOpen = false; // desktop
    item.open = false;   // mobile
  });
}
@HostListener('window:resize', [])
onResize() {
  if (window.innerWidth >= 768) {
    this.isMenuOpen = false;
    this.menu.forEach(item => (item.open = false));
  }
}

// Any outside clock should close the mobile menu
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // If click is NOT inside mobile menu or hamburger button
  if (!target.closest('.mobile-menu') && !target.closest('.hamburger-button')) {
    this.isMenuOpen = false;
  }
}




  openDropdown(item: MenuItem) {
    if (item.closeTimeout) clearTimeout(item.closeTimeout);
    item.isOpen = true;
  }

  closeDropdown(item: MenuItem) {
    item.closeTimeout = setTimeout(() => {
      item.isOpen = false;
    }, 150);
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    this.scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }
}
