export interface Azhwar {
  id: string;
  name: string;
  tamilName: string;
  photo: string;
  image?: string;

  thanian: {
    author?: string;
    text: string;
  };

  year: string;
  birthPlace: string;
  month: string;
  thiruNatchathiram: string;
  amsam: string;

  otherNames?: string[];
  biography?: string[];        // ONLY 1–2 paragraphs
  additionalInfo: string;     // single paragraph at bottom
}
