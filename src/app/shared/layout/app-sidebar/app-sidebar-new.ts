import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { combineLatest, filter, Subscription } from 'rxjs';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { AuthService } from '../../services/Auth/auth.service';

export interface SubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

export interface NavItem {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: SubItem[];
  action?: () => void;

}

@Component({
  selector: 'app-sidebar-new',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent,
    ThemeToggleButtonComponent
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponentNew {
    role: 'admin' | 'user' = 'user';

  /* --------------------------- SIDEBAR MENU ITEMS --------------------------- */
  navItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em"...></svg>`,
      name: "Dashboard",
      subItems: [
        { name: "Home", path: "/" }
      ]
    }
  ];

  adminItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em"...></svg>`,
      name: "Admin",
      subItems: [
        { name: "Calendar", path: "/admin/calendar" },
        { name: "Vehicles", path: "/admin/vehicles" },
        { name: "Bookings", path: "/admin/bookings" },
        { name: "Reports", path: "/admin/reports" },
      ]
    },
    { icon: `<svg width="1em" height="1em"...></svg>`,name: "Logout", action: () => this.logout() }
  ];
  userItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em"...></svg>`,
      name: "User",
      subItems: [
        { name: "My Bookings", path: "/user/my-bookings" },
        { name: "Profile", path: "/user/profile" },
      ]
    },
    {
      icon: `<svg width="1em" height="1em"...></svg>`,
      name: "Authentication",
      path: "/signin",
    }
  ];

  othersItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em"...></svg>`,
      name: "Misc",
      subItems: [
        { name: "Help", path: "/help" }
      ]
    }
  ];

  /* --------------------------- LOGIC PROPERTIES --------------------------- */
  openSubmenu: string | null = null;
  subMenuHeights: Record<string, number> = {};

  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  /* --------------------------- LIFECYCLE --------------------------- */
  ngOnInit() {
    // Highlight active route
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );
     this.subscription.add(
    this.authService.role$.subscribe(role => {
      this.role = role === 'admin' ? 'admin' : 'user';
    })
  );
  console.log("Role in sidebar:", this.role);

    // Close sidebar on mobile when route changes
    this.subscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          if (this.sidebarService.mobileState) {
            this.sidebarService.setMobileOpen(false);
          }
        })
    );

    // Sidebar collapse animation handling
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$])
        .subscribe(([expanded, mobileOpen, hovered]) => {
          if (!expanded && !mobileOpen && !hovered) {
            this.cdr.detectChanges();
          }
        })
    );


    // Initial route highlight
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /* --------------------------- ROUTE HIGHLIGHT --------------------------- */
  isActive(path: string): boolean {
    return this.router.url === path;
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.adminItems, prefix: 'admin' },
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' }
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        nav.subItems?.forEach((subItem: SubItem) => {
          if (currentUrl === subItem.path) {
            const key = `${group.prefix}-${i}`;
            this.openSubmenu = key;

            setTimeout(() => {
              const el = document.getElementById(key);
              if (el) {
                this.subMenuHeights[key] = el.scrollHeight;
                this.cdr.detectChanges();
              }
            });
          }
        });
      });
    });
  }
  logout(): void {
    this.authService.logout();
}


  /* --------------------------- SUBMENU TOGGLE --------------------------- */
  toggleSubmenu(section: string | number, index: string | number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  /* --------------------------- MISC ACTION --------------------------- */
  onSubmenuClick() {
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
  onSidebarMouseEnter() {
  this.isExpanded$.subscribe(expanded => {
    if (!expanded) {
      this.sidebarService.setHovered(true);
    }
  }).unsubscribe();
}


  toggleSidebar() {
    if (window.innerWidth < 1280) {
      this.sidebarService.toggleMobileOpen();
    } else {
      this.sidebarService.toggleExpanded();
    }
  }
}
