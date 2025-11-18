import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ NgClass],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  message: ToastMessage | null = null;
  visible = false;   
  showing = false;  
  hiding = false;   

  // durations (ms)
  private readonly displayMs = 3000; 
  private readonly enterDelay = 20;  
  private readonly leaveMs = 400; 

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState.subscribe(msg => {
      // reset any existing toast cycle
      this.clearTimers();

      // set message and show container
      this.message = msg;
      this.visible = true;
      this.hiding = false;
      this.showing = false;

      // next tick: trigger enter animation
      setTimeout(() => {
        this.showing = true;
      }, this.enterDelay);

      // schedule hide after displayMs
      const hideTimer = setTimeout(() => {
        this.startHide();
      }, this.displayMs + this.enterDelay);

      // keep reference to cancel if new toast arrives quickly
      this._timers.push(hideTimer);
    });
  }

  private startHide() {
    this.showing = false;
    this.hiding = true;

    // after leave transition remove from DOM
    const removeTimer = setTimeout(() => {
      this.visible = false;
      this.hiding = false;
      this.message = null;
    }, this.leaveMs);

    this._timers.push(removeTimer);
  }

  // internal timers so a new toast cancels old ones cleanly
  private _timers: ReturnType<typeof setTimeout>[] = [];
  private clearTimers() {
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
  }
}
