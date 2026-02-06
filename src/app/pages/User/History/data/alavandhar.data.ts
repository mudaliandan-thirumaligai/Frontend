import { Aacharya } from '../aacharya.interface';

export const ALAVANDHAR: Aacharya = {
  id: 'alavandhar',
  name: 'Swami Alavandhar',
  tamilName: 'ஆளவந்தார்',
  period: '916 AD to 1042 AD',

  birthDetails: {
    year: '916 AD',
    place: 'Kaattumannargudi',
    month: 'Aadi',
    star: 'Utthiradam'
  },

  otherNames: ['Yamunacharyar', 'Yamunamuni'],

  thanian: `
yathpaadhaamboruha Dhyaana vidhvasthaasheShkalmaShah |
vasthuthaamupayaatho aham yaamuneeyam namaami tham ||
  `,

  content: [
    {
      type: 'paragraph',
      text: 'Alavandhar was a key acharya of the Sri Vaishnava tradition, foreseeing Swami Ramanuja as the future leader of the sampradayam.'
    },
    // {
    //   type: 'image',
    //   src: 'images/swamy/pooramchennai13/img_7.JPG'
    // },
    {
      type: 'paragraph',
      text: 'He was a child prodigy, instructed in all Sastras, with the gift of eka-santha – graha.'
    },
    {
      type: 'paragraph',
      text: 'He taught Bhagavad Gita and guided disciples like Peria Nambi and indirectly Swami Ramanuja.'
    },
    // {
    //   type: 'image',
    //   src: 'images/swamy/pooramchennai13/img_8.JPG'
    // },
    {
      type: 'paragraph',
      text: 'He established his mutt to preach philosophy and ensured proper succession in the Sri Vaishnava sampradayam.'
    }
  ],

  writings: [
    { title: 'Chatusloki' },
    { title: 'Sthotra Ratnam' },
    { title: 'Sidhi trayam', description: '(Atma, Samvit, Eeswara)' },
    { title: 'Geethartha Sangraham' },
    { title: 'Agama Pramanam' },
    { title: 'Maha Purusha Nirnayam' }
  ]
};
