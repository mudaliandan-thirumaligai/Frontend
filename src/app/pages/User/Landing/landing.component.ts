import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // for ngModel
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,FormsModule,RouterModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
   contact = {
    name: '',
    email: '',
    message: ''
  };
  events = [
    { date: new Date(2026, 0, 10), title: 'Annual Festival', location: 'Thirumadapalli' },
    { date: new Date(2026, 1, 5), title: 'Spiritual Discourse', location: 'Main Temple' },
    { date: new Date(2026, 2, 20), title: 'Annadhanam Event', location: 'Community Hall' }
  ];

  mediaItems = [
    { image: 'assets/images/photo1.jpg', title: 'Temple Ceremony' },
    { image: 'assets/images/video1.jpg', title: 'Discourse Video' },
    { image: 'assets/images/audio1.jpg', title: 'Audio Chant' }
  ];

  galleryImages = [
    'assets/images/gallery1.jpg',
    'assets/images/gallery2.jpg',
    'assets/images/gallery3.jpg',
    'assets/images/gallery4.jpg'
  ];


  constructor() { }

  ngOnInit(): void { }

  submitForm() {
    console.log('Contact Form Submitted', this.contact);
    alert('Thank you! We will get back to you soon.');
    this.contact = { name: '', email: '', message: '' };
  }

}
