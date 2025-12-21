import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface AdminNavItem {
  label: string;
  route?: string;
  action?: () => void;
}


@Component({
  selector: 'app-admin-sidebar',
  imports: [
    CommonModule,
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: `./admin-sidebar.component.css`
})
export class AdminSidebarComponent {

  navItems: AdminNavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Add User', route: '/admin/addUser' },
    { label: 'Calendar', route: '/admin/calendar' },
    { label: 'Change Password', route: '/admin/change-pwd' },
    { label: 'Logout', action: () => this.logout() }
  ];

  constructor(private router: Router) {}

  navigate(item: AdminNavItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      item.action();
    }
  }

  logout() {
    console.log('Logging out...');
    this.router.navigateByUrl('/', { replaceUrl: true });
    
  }
}