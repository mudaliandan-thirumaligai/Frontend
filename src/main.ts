import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { RequestLogger } from './app/interceptor/network.interceptor';
import { AuthInterceptor } from './app/interceptor/auth.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),

    // 🔥 IMPORTANT
    provideHttpClient(withInterceptorsFromDi()),

    // 🔐 Auth first
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // 📡 Logger next
    { provide: HTTP_INTERCEPTORS, useClass: RequestLogger, multi: true }
  ]
}).catch(err => console.error(err));
