import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface BankSection {
  title: string;
  description: string;
  image?: string;
  bankDetails?: {
    bank: string;
    name: string;
    account: string;
    ifsc: string;
    type?: string;
    micr?: string;
    branch?: string;
    address?: string;
  };
  notes?: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
}
@Component({
  selector: 'app-bank-details',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './bank-details.component.html',
  styles: ``
})

export class BankDetailsComponent {
   selectedTab: BankSection;
  mobileSidebarOpen = false;

  tabs: BankSection[] = [
    {
      title: 'Sri Dasarathy Trust - CUB',
      description:
        'All funds in this account will be used by Sri Dasarathy Trust.',
      image: '/images/mudaliandan/bank-2.png',
      bankDetails: {
        bank: 'City Union Bank',
        name: 'SRI DASARATHY TRUST',
        account: '510909010019290',
        ifsc: 'CIUB0000271',
        type: 'Current',
        branch: 'Singaperumal Koil, Kanchipuram District',
        address: 'Singaperumal Koil, Kanchipuram District',
      },
      notes: '💡 Money orders, Cheque, or Cash accepted. International transfers not accepted.',
      contact: {
        name: 'Sri Lakshmi Narasimhan Swami',
        phone: '89252 56626',
        email: 'acharya@mudaliandan.com',
        message: 'Please contact for receipt and further details.',
      },
    },
    {
      title: 'Acharya Sambhavanai - CUB',
      description:
        'The money received in this Account will be used only for our Varthamana Acharyan.If any Sishya or Abhimani didn\'t get an opportunity to get blessings from Acharyan but would like to offer Acharya Sambavanai, contributions can be made directly to our Varthamana Acharyan.',
        image: '/images/mudaliandan/bank3.png',
      bankDetails: {
        bank: 'City Union Bank',
        name: 'Bhakthiipraven',
        account: '500101010444648',
        ifsc: 'CIUB0000271 ',
        type: 'Savings Account',
        branch: 'Singaperumal Koil',
        address: 'Singaperumal Koil, Tamil Nadu 603204',
      },
      notes: '💡 This account can be used for RTGS & NEFT transactions',
    }
  ];

  constructor() {
    this.selectedTab = this.tabs[0];
  }

  selectTab(tab: BankSection) {
    this.selectedTab = tab;
  }

}
