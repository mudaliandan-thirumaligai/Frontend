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

interface DetailRow {
  key: string;
  label: string;
  value: string;
  copyable: boolean;
}

@Component({
  selector: 'app-bank-details',
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './bank-details.component.html',
  styles: ``,
})
export class BankDetailsComponent {
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
        "The money received in this Account will be used only for our Varthamana Acharyan. If any Sishya or Abhimani didn't get an opportunity to get blessings from Acharyan but would like to offer Acharya Sambavanai, contributions can be made directly to our Varthamana Acharyan.",
      image: '/images/mudaliandan/bank3.png',
      bankDetails: {
        bank: 'City Union Bank',
        name: 'Bhakthiipraven',
        account: '500101010444648',
        ifsc: 'CIUB0000271',
        type: 'Savings Account',
        branch: 'Singaperumal Koil',
        address: 'Singaperumal Koil, Tamil Nadu 603204',
      },
      notes: '💡 This account can be used for RTGS & NEFT transactions',
    },
  ];

  selectedTab: BankSection = this.tabs[0];
  rows: DetailRow[] = this.buildRows(this.selectedTab);
  copiedKey: string | null = null;

  selectTab(tab: BankSection) {
    this.selectedTab = tab;
    this.rows = this.buildRows(tab);
    this.copiedKey = null;
  }

  async copy(row: DetailRow) {
    try {
      await navigator.clipboard.writeText(row.value);
      this.copiedKey = row.key;
      setTimeout(() => {
        if (this.copiedKey === row.key) this.copiedKey = null;
      }, 1800);
    } catch {
      // Clipboard API blocked (e.g. non-HTTPS); fail silently
    }
  }

  telHref(phone: string) {
    return 'tel:' + phone.replace(/\s+/g, '');
  }

  trackByKey = (_: number, row: DetailRow) => row.key;

  private buildRows(tab: BankSection): DetailRow[] {
    const d = tab.bankDetails;
    if (!d) return [];

    const all: { key: string; label: string; value?: string; copyable: boolean }[] = [
      { key: 'bank', label: 'Bank', value: d.bank, copyable: false },
      { key: 'name', label: 'Account name', value: d.name, copyable: true },
      { key: 'account', label: 'Account number', value: d.account, copyable: true },
      { key: 'ifsc', label: 'IFSC', value: d.ifsc, copyable: true },
      { key: 'type', label: 'Account type', value: d.type, copyable: false },
      { key: 'micr', label: 'MICR', value: d.micr, copyable: false },
      { key: 'branch', label: 'Branch', value: d.branch, copyable: false },
      { key: 'address', label: 'Address', value: d.address, copyable: false },
    ];

    return all
      .filter((r) => !!r.value?.trim())
      .map((r) => ({ ...r, value: r.value!.trim() }));
  }
}