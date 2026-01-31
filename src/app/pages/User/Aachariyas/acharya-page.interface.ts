export interface AcharyaPage {
  id: string;
  name: string;
  tamilName?: string;
  image?: string;

  details?: {
    year?: string;
    birthPlace?: string;
    month?: string;
    thiruNatchathiram?: string;
    amsam?: string;
    otherNames?: string[];
  };

  blocks: {
    type: 'paragraph' | 'image' | 'list' | 'subheading' | 'thanian';
    text?: string;
    src?: string;
    items?: string[];
  }[];
}
