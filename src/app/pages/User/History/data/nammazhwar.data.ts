import { Aacharya } from '../aacharya.interface';

export const NAMMAZHWAR: Aacharya = {
  id: 'nammazhwar',
  name: 'Swami Nammazhwar',
  tamilName: 'நம்மாழ்வார்',
  period: 'Beginning of Kaliyuga',

  birthDetails: {
    year: '3102 B.C.',
    place: 'Thirukurugoor (Thiruvenparisaaram)',
    month: 'Vaikasi',
    star: 'Visakam',
    amsam: 'Senai Mudhaliar (Viswaksenar)'
  },

  otherNames: [
    'mARan',
    'sataGopan',
    'parAngusan',
    'vakuLAbharaNan',
    'vakuLAbhirAman',
    'magizhmAran',
    'satajith',
    'kurugUr nambi'
  ],

  thanian: `
mAthA pithA yuvadhayas thanyA vibhoothi: |
sarvam yadhEva niyamEna madhanvayAnAm ||
Aatyasya na: kulapathEr vagulAbhirAmam |
Srimath thathangri yugalam pranamAmi moordhnA ||||
  `,

  content: [
    {
      type: 'paragraph',
      text: `Nammazhwar, one of the twelve Azhwars, is well known for his many hymns on devotion to Lord Vishnu. Legend places him at the beginning of the Kali Yuga. He was born in the asterism Visakham during the month of Vaikasi in Thiruvenparisaaram, Tamil Nadu.`
    },

    {
      type: 'image',
      src: 'images/Aachariyas/Nammazhwar-1.png',
      caption: 'Swami Nammazhwar'
    },
    {
      type: 'paragraph',
      text: `He was born fully enlightened and as a child showed no response to external stimuli. His parents left him at the feet of Lord Sri Adhinathar at Azhwarthirunagari. He later entered deep meditation inside a tamarind tree for sixteen years.`
    },

    {
      type: 'paragraph',
      text: `Madhurakavi Azhwar followed a divine light and discovered Nammazhwar. Through a profound riddle and answer, Madhurakavi realized the divinity of the child and became his disciple.`
    },
    {
      type: 'image',
      src: 'images/Aachariyas/Nammazhwar-2.png'
    },

    {
      type: 'heading',
      text: 'Philosophical Significance'
    },

    {
      type: 'paragraph',
      text: `Nammazhwar’s teachings explain the nature of Paramatma, Jeevatma, the means to attain Moksha, and the obstacles along the spiritual path.`
    },
    {
      type: 'image',
      src: 'images/Aachariyas/Nammazhwar-3.png'
    },
  ],
  

  writings: [
    { title: 'Thiruviruththam', description: '100 verses – Rig Veda Saaram' },
    { title: 'ThiruvAsiriam', description: '7 verses – Yajur Veda Saaram' },
    { title: 'Thiruvaimozhi', description: '1102 verses – Sama Veda Saaram' },
    { title: 'Periya Thiruvandhadhi', description: '87 verses – Atharvana Veda Saaram' }
  ]
};
