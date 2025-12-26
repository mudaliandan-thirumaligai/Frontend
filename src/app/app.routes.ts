import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
// import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';


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


// TODO ISOLATE ROUTES FOR ADMIN/ USERS TO RESOLVE ANY CSS CONFLICT
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
      { path: 'documents', component: DocumentsComponent },
      { path: 'past-events', component: PastEventsComponent },
      { path: 'about-swamy', component: AboutSwamyComponent },
      { path: 'bank-info', component: BankDetailsComponent },
      { path: 'registration', component: ContactUsComponent },
      { path : 'thirumaligais', component: ThirumalagaiComponent }
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
      { path: 'videos', component: VideosAdminComponent }
    ]
  },

  // ================= AUTH (NO LAYOUT) =================
  { path: 'signin', component: UserSignInComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ================= ERROR =================
  { path: '**', component: NotFoundComponent }
];

// export const routes: Routes = [
//   {
//     path:'',
//     component:AppLayoutComponent,
//     children:[
//       {
//         path: 'ecommerce',
//         component: EcommerceComponent,
//         pathMatch: 'full',
//         title:
//           'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
//       },
//       // Landing page for users
//       {
//         path:'',
//         component:LandingComponent,
//         title:'Sri Dasarathy Trust | Landing Page'
//       },
//       // Will Link this to user calender
//       {
//         path:'calendar',
//         component:UserCalenderComponent,
//         title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
//       },
//       //Admin Calender
//       {
//         path:'admin/calendar',
//         component:AdminCalenderComponent,
//         title:'Calendar | Sri Dasarathy Trust',
//         canActivate: [adminGuard]
//       },

//       // User Feature Pages
//       {
//         path:'thirumaligais',
//       component:ThirumalagaiComponent,
//         title:'Thirumaaligais | Sri Dasarathy Trust'
//       },
//       // Contact us page for users
//       {
//         path:'registration',
//         component:ContactUsComponent,
//         title:'Contact Us |Sri Dasarathy Trust'
//       },
//       {
//         path:'gallery',
//         component:GalleryComponent,
//         title:'Gallery | Sri Dasarathy Trust'
//       },
//       {
//         path:'history',
//         component:HistoryComponent,
//         title:'History | Sri Dasarathy Trust'
//       },
//       {
//         path:'videos',
//         component:VideosComponent,
//         title:'Videos | Sri Dasarathy Trust'
//       },
//       {
//         path:'documents',
//         component:DocumentsComponent,
//         title:'Documents | Sri Dasarathy Trust'
//       },
//       {
//         path:'past-events',
//         component:PastEventsComponent,
//         title:'Past Events | Sri Dasarathy Trust'
//       },
//       {
//         path:'about-swamy',
//         component:AboutSwamyComponent,
//         title:'About Swamy | Sri Dasarathy Trust'
//       },
//       {
//         path:'bank-info',
//         component:BankDetailsComponent,
//         title:'Bank Details | Sri Dasarathy Trust'
//       },
//       {
//         path:'form-elements',
//         component:FormElementsComponent,
//         title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'basic-tables',
//         component:BasicTablesComponent,
//         title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'blank',
//         component:BlankComponent,
//         title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'blank',
//         component:BlankComponent,
//         title:'Sri Dasarathy Trust | Blank Page'
//       },
//       // support tickets
//       {
//         path:'invoice',
//         component:InvoicesComponent,
//         title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'line-chart',
//         component:LineChartComponent,
//         title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'bar-chart',
//         component:BarChartComponent,
//         title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'alerts',
//         component:AlertsComponent,
//         title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'avatars',
//         component:AvatarElementComponent,
//         title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'badge',
//         component:BadgesComponent,
//         title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'buttons',
//         component:ButtonsComponent,
//         title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       {
//         path:'images',
//         component:ImagesComponent,
//         title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       },
//       // {
//       //   path:'videos',
//       //   component:VideosComponent,
//       //   title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
//       // },
//     ]
//   },
//   // auth pages
//   {
//     path:'signin123',
//     component:SignInComponent,
//     title:'Sign In | Sri Dasarathy Trust'
//   },
//   {
//     path:'signin',
//     component:UserSignInComponent,
//     title:'Sign In | Sri Dasarathy Trust'
//   },
//   {
//     path:'signup',
//     component:SignUpComponent,
//     title:'Sign Up | Sri Dasarathy Trust',
//     canActivate: [adminGuard]
//   },

//   // Admin Auth Pages
//   {
//     path:'change-pwd',
//     component:ChangePasswordComponent,
//     title:'Sign In | Sri Dasarathy Trust',
//     canActivate: [adminGuard]
//   },
//   {
//     path:'admin/addUser',
//     component:AddNewAdmin,
//     title:'Sign Up | Sri Dasarathy Trust',
//     canActivate: [adminGuard]
//   },
//   {
//     path:'forgot-password',
//     component:ForgotPasswordComponent,
//     title:'Forgot Password | Sri Dasarathy Trust',
//   },
//   {
//     path:'reset-password',
//     component:ResetPasswordComponent,
//     title:'Reset Password | Sri Dasarathy Trust',
//   },
//   // error pages
//   {
//     path:'**',
//     component:NotFoundComponent,
//     title:'Page Not Found | Sri Dasarathy Trust'
//   },
// ];
