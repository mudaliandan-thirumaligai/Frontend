
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { AuthService } from '../../services/Auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface MenuItem {
  label: string;
  route: string;
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

  constructor(
    private authService: AuthService
  ) {
    this.isAdmin$ = this.authService.role$.pipe(
      map((role: string | null) => role === 'admin')
    );
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    this.scrollPercent = docHeight > 0
      ? (scrollTop / docHeight) * 100
      : 0;
  }
}
