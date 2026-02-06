
export interface Aacharya {
  id: string;
  name: string;
  tamilName: string;
  period: string;

  birthDetails?: {
    year: string;
    place: string;
    month: string;
    star: string;
    amsam?: string;
  };

  otherNames?: string[];

  thanian?: string;

  content: ContentBlock[];

  writings?: {
    title: string;
    description?: string;
  }[];
}

export type ContentBlock =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'image';
      src: string;
      caption?: string;
    }
  | {
      type: 'heading';
      text: string;
    };
