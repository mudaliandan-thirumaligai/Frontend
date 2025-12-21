export interface Aacharya {
  id: string;
  name: string;
  tamilName: string;
  period: string;
  birthDetails: {
    year: string;
    place: string;
    month: string;
    star: string;
    amsam: string;
  };
  otherNames: string[];
  thanian?: string;
  biography: string[];
  writings?: {
    title: string;
    description: string;
  }[];
  images?: string[];
}
