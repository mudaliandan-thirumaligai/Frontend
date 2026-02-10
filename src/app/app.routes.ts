import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';


//Admin Pages
import { AdminCalenderComponent } from './pages/Admin/calender/admin-calender.component';

//Admin Auth Pages
import { AddNewAdmin } from './pages/Admin/Auth/Add-New-Admin/new-admin.component';
import { ChangePasswordComponent } from './pages/Admin/Auth/Change-Password/change-pwd.component';
import { adminGuard } from './guards/admin.guard';

//User pages
import { UserCalenderComponent } from './pages/User/calender/user-calender.component';
import { LandingComponent } from './pages/User/Landing/landing.component';
import { ThirumalagaiComponent } from './pages/User/Thirumaligai/thirumaligai.component';
import { UserSignInComponent } from './pages/User/Auth/Sign-In/sign-in.component';
import { ResetPasswordComponent } from './pages/User/Auth/Reset-Password/reset-pwd.component';
import { ForgotPasswordComponent } from './pages/User/Auth/Forgot-Password/forgot-pwd.component';
import { ContactUsComponent } from './pages/User/Contact-Us/contact-us.component';
import { BankDetailsComponent } from './pages/User/Bank-Details/bank-details.component';
import { GalleryComponent } from './pages/User/Gallery/gallery.component';
import { HistoryComponent } from './pages/User/History/history.component';
import { VideosComponent } from './pages/User/Videos/videos.component';
import { DocumentsComponent } from './pages/User/Documents/documents.component';
import { PastEventsComponent } from './pages/User/Past-Events/past-events.component';
import { AboutSwamyComponent } from './pages/User/About-Swamy/about-swamy.component';
import { AdminLayoutComponent } from './pages/Admin/Layout/admin-layout.component';
import { VideosAdminComponent } from './pages/Admin/Videos/videos-admin.component';
import { ShishyaListComponent } from './pages/Admin/Shishya-List/shishya-list.component';
import { DocumentsComponentAdmin } from './pages/Admin/Documents/documents-admin.component';
import { SwamyScheduleAdminComponent } from './pages/Admin/Swamy-Schedule/swamy-schedule.component';
import { SwamyScheduleComponent } from './pages/User/Swamy-schedule/swamy-schedule.component';
import { ThirumaligaiDetailComponent } from './pages/User/Thirumaligai/Thirumaligai-Details/thirumaaligai-detail.component';
import { AzhwargalComponent } from './pages/User/Azhwargal/azhwargal.component';
// import { AcharyanPageComponent } from './pages/User/Aachariyas/aachariyas.component';



export const routes: Routes = [

  // ================= PUBLIC LAYOUT =================
  {
    path: '',
    component: AppLayoutComponent, // PublicLayout
    children: [
      { path: '', component: LandingComponent },
      { path: 'calendar', component: UserCalenderComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'videos', component: VideosComponent },
      { path: 'alwargal', component: AzhwargalComponent },
      // { path: 'aachariyas', component: AcharyanPageComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'past-events', component: PastEventsComponent },
      { path: 'about-swamy', component: AboutSwamyComponent },
      { path: 'swamy-schedule', component: SwamyScheduleComponent },
      { path: 'bank-info', component: BankDetailsComponent },
      { path: 'registration', component: ContactUsComponent },
      { path : 'thirumaligais', component: ThirumalagaiComponent },
      { path : 'thirumaligais/:slug', component: ThirumaligaiDetailComponent }
    ]
  },

  // ================= ADMIN LAYOUT =================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'calendar', component: AdminCalenderComponent },
      { path: 'addUser', component: AddNewAdmin },
      { path: 'change-pwd', component: ChangePasswordComponent },
      { path: 'documents', component: DocumentsComponentAdmin },
      { path: 'swamy-schedule', component: SwamyScheduleAdminComponent },
      { path: 'videos', component: VideosAdminComponent },
      { path: 'shishya-info', component: ShishyaListComponent }
    ]
  },

  // ================= AUTH (NO LAYOUT) =================
  { path: 'signin', component: UserSignInComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ================= ERROR =================
  { path: '**', component: NotFoundComponent }
];
