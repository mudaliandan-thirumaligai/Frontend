import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/Auth/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

interface AdminNavItem {
  label: string;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {

  // ✅ controls sidebar open/close
  @Input() isOpen: boolean = false;

  // ✅ notify parent to close sidebar
  @Output() closeSidebar = new EventEmitter<void>();

  navItems: AdminNavItem[] = [
    { label: 'Add User', route: '/admin/addUser' },
    { label: 'Calendar', route: '/admin/calendar' },
    { label: 'Change Password', route: '/admin/change-pwd' },
    { label: 'Documents', route: '/admin/documents' },
    { label: 'Shishya Info', route: '/admin/shishya-info' },
    { label: 'Swamy Schedule', route: '/admin/swamy-schedule' },
    { label: 'Videos', route: '/admin/videos' },
    { label: 'Logout', action: () => this.logout() }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  navigate(item: AdminNavItem) {
    if (item.route) {
      this.router.navigate([item.route]);
      this.closeSidebar.emit(); // ✅ auto close on mobile
    } else if (item.action) {
      item.action();
    }
  }

  logout() {
    this.toast.showInfo('Logging out...');
    this.authService.logout();
    this.toast.showSuccess('Logged out successfully');
  }
}