import { AcharyaPage } from './acharya-page.interface';

export const ACHARYANS: AcharyaPage[] = [
  {
    id: 'kandadai-aandan',
    name: 'Sri Kandadai Aandan',
    tamilName: 'கண்டடை ஆனந்தன்',
    image: 'images/kandadai-aandan/hero.jpg',
    details: {
      year: '1104 - 1209',
      birthPlace: 'Srirangam',
      month: 'Maasi',
      thiruNatchathiram: 'Punarpoosam',
      amsam: 'Sathrugna',
      otherNames: ['Ramanuja Dasar', 'Ilayazhwan Ramanujan']
    },
    blocks: [
      { type: 'paragraph', text: `Kandadai Aandan an amsam of Sathrugna was born...` },
      { type: 'thanian', text: `vaadhoolaanvaya vaartheendhum shreemad dhaasharathe sutham |` },
      { type: 'paragraph', text: `Sri Mudaliandan didn't have male child for long time...` },
      { type: 'list', items: [
        'Those who desire material benefits come to Bhagavan and move away.',
        'Those seeking moksha, karma, gnana, and bhakti, Emperuman tells them to come.'
      ]},
      { type: 'image', src: 'images/kandadai-aandan/temple.jpg' },
      { type: 'paragraph', text: `Kandadai Andan pleased Ramanuja and installed his idol at Sriperumbudur...` }
    ]
  },
  {
    id: 'mudaliandan',
    name: 'Sri Mudaliandan',
    tamilName: 'முதலாண்டன்',
    image: 'images/mudaliandan/hero-1.jpg',
    details: {
      year: '1000 - 1080',
      birthPlace: 'Srirangam',
      month: 'Vaikasi',
      thiruNatchathiram: 'Visakham',
      amsam: 'Garuda',
      otherNames: ['Acharya Mudaliandan']
    },
    blocks: [
      { type: 'paragraph', text: 'Mudaliandan was the preceptor of Ramanuja...' },
      { type: 'thanian', text: `mudaliandan thanian example...` },
      { type: 'image', src: 'images/mudaliandan/temple.jpg' }
    ]
  }
  // Add more Acharyans here...
];
