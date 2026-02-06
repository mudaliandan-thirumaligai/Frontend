import { Aacharya } from '../aacharya.interface';

export const MUDALIANDAN: Aacharya = {
  id: 'mudaliandan',
  name: 'Sri Mudaliandan',
  tamilName: 'முதலியாண்டான்',
  period: '1027 – 1132',

  birthDetails: {
    year: '1027 – 1132',
    place: 'Pachai Varana Puram',
    month: 'Chithirai',
    star: 'Punarpoosam',
    amsam: 'Lord Rama'
  },

  otherNames: [
    'Daasarathi',
    'Yathiraja paduka',
    'Nam Vadhoola Desikan',
    'Aandan'
  ],

  thanian: `
padhuke yathi rajasya kathayanthi yadhakh yaya |
thasya daasarathe: paadav Sirasa dhaarayaam yaham ||
  `,

  content: [
    {
      type: 'paragraph',
      text: 'Daasarathi (Mudaliandan) is considered an Avathara of the Lord Himself.'
    },
    {
      type: 'paragraph',
      text: 'Lord Rama later took the avatar of Mudaliandan to uplift Jeevathmas.'
    },
    // {
    //   type: 'image',
    //   src: 'images/swamy/pooramchennai13/img_7.JPG'
    // },
    {
      type: 'paragraph',
      text: 'Mudaliandan Vaibhavam is available in both English and Tamil.'
    },
    {
      type: 'paragraph',
      text: 'Swami Manavala Mamunigal composed slokas on Sri Mudaliandan.'
    }
  ],

  writings: [{ title: 'Vaibhavam' }]
};
