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
