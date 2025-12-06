import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface BankSection {
  title: string;
  description: string;
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

  tabs: BankSection[] = [
    {
      title: 'Sri Dasarathy Trust - ICICI',
      description:
        'The money received in our Dasarathy Trust Account will be used only for Nithya Kainkaryams such as purchasing flowers, Prasadam for Perumal, Thadhi aaradhanai, maintenance, and paying salaries for Kainkaryaparas.',
      bankDetails: {
        bank: 'ICICI Bank',
        name: 'SRI DASARATHY TRUST',
        account: '000101212333',
        ifsc: 'ICIC0000001',
        type: 'Current',
        micr: '600229002',
        branch: 'Chennai',
        address: '#1, CENETOPH ROAD, CHENNAI - 600018',
      },
      notes: '💡 Cheques or Cash can be deposited at any ICICI Bank. International transfers not accepted.',
    },
    {
      title: 'Sri Dasarathy Trust - CUB',
      description:
        'On behalf of Sri Amirthavalli Thayar Sametha Sri Pachai Varana Perumal Koil Sri Mudaliandan Swami Aadheena Thiru Avathara Sthalam, Sri Mudaliandan Swami Thirumaligai and with the guidance of our beloved Sri Mudaliandan Swamigal (Kumara Ramanujachar), Sri Dasarathy Trust has considered giving a golden plate (Approx. 2 Kg) as a humble offering to Sri Adhikesava perumal Sri Bhashyakara swamy Devasthanam, Sriperumbudur.Therefore, we make a humble plea to all members and patrons of the Trust to offer their contributions in the form of gold or money to Sri Dasarathy Trust in order to facilitate our Trust\'scontribution to the millennial celebrations. The contributions can also be made to the Trust in the form of money.Contributors can obtain proper receipt for their offerings by notifying Sri Lakshmi Narasimhan Swami on 89252 56626 or sridasarathy@gmail.com, acharya@mudaliandan.com with your full name, address, E Mail ID, Mobile Number, Payment details.',
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
