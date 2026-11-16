import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-banner.component.html',
  styleUrl: './offline-banner.component.css'
})
export class OfflineBannerComponent {

  currentYear = new Date().getFullYear();

  retryMessage = '';
  isChecking = false;

  constructor(
    private connectivityService: ConnectivityService
  ) {}

  async retry() {
    this.isChecking = true;
    this.retryMessage = '';

    try {
      await this.connectivityService.refreshStatus();

      if (!this.connectivityService.isConnected) {
        this.retryMessage =
          'Still no internet connection. Please check your Wi-Fi or mobile data and try again.';
      }
    } catch (error) {
      this.retryMessage =
        'Unable to check your connection. Please try again.';
    } finally {
      this.isChecking = false;
    }
  }
}