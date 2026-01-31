import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-thirumalagai',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,       
    PageBreadcrumbComponent
  ],
  templateUrl: './thirumaligai.component.html',
  styleUrls: ['./thirumaligai.component.css']
})
export class ThirumalagaiComponent {
  thirumaligais = [
    {
      name: 'Kancheepuram',
      slug: 'kancheepuram',
      shortDescription: 'An ancient and sacred town renowned for its temples.',
      description: 'Kancheepuram is one of the seven Moksha-puris and a major center of Vaishnavism...',
      image: 'public/images/mudaliandan/hero-1.png',
      mapLink: 'https://www.google.com/maps?q=Kanchipuram,Tamil+Nadu'
    },
    {
      name: 'Srirangam',
      slug: 'srirangam',
      shortDescription: 'Home to the grand Sri Ranganathaswamy Temple.',
      description: 'Srirangam is the foremost Divya Desam, housing the largest functioning Hindu temple complex...',
      image: 'public/images/mudaliandan/bank-1.png',
      mapLink: 'https://www.google.com/maps?q=Srirangam,Tamil+Nadu'
    }
  ];
}
