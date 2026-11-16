
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  private isConnectedSubject = new BehaviorSubject<boolean>(true);

  isConnected$ = this.isConnectedSubject.asObservable();

  constructor() {
    this.initializeNetworkListener();
  }
  async refreshStatus() {
    const status = await Network.getStatus();

    this.isConnectedSubject.next(status.connected);
  }

  async initializeNetworkListener() {

    // Get initial network status
    const status = await Network.getStatus();

    this.isConnectedSubject.next(status.connected);

    // Listen for network changes
    await Network.addListener('networkStatusChange', status => {
      console.log('Network status changed:', status.connected);

      this.isConnectedSubject.next(status.connected);
    });
  }

  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}
