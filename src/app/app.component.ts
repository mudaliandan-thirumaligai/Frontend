
import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Observable } from 'rxjs';

import { ToastComponent } from './shared/components/toast/toast.component';
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';
import { ConnectivityService } from './shared/services/connectivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastComponent,
    OfflineBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  title = 'Sri Mudaliandan Swamy Thirumaligai';

  isConnected$!: Observable<boolean>;

  constructor(
    private router: Router,
    private connectivityService: ConnectivityService
  ) {
    this.isConnected$ = this.connectivityService.isConnected$;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
