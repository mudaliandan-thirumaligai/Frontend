export interface Contact {
  _id: string;
  name: string;
  type: 'shishya' | 'abhimani';
  email?: string;
  mobile?: string;
  whatsappNumber?: string;
  postalAddress?: string;
  query?: string;
  createdAt: string;
}
