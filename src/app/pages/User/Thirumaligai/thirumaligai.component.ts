import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-thirumalagai',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './thirumaligai.component.html',
  styleUrls: ['./thirumaligai.component.css']
})
export class ThirumalagaiComponent {
  thirumaligais = [
    {
      name: 'Kancheepuram',
      description: 'An ancient and sacred town renowned for its temples and deep spiritual heritage.',
      mapLink: 'https://www.google.com/maps?q=Kanchipuram,Tamil+Nadu'
    },
    {
      name: 'Kooram',
      description: 'A peaceful village closely associated with Sri Ramanujacharya and Vaishnavite tradition.',
      mapLink: 'https://www.google.com/maps?q=Kooram,Tamil+Nadu'
    },
    {
      name: 'Melkote',
      description: 'A historic pilgrimage site in Karnataka, revered for its rich Vaishnavite legacy.',
      mapLink: 'https://www.google.com/maps?q=Melkote,Karnataka'
    },
    {
      name: 'SP Koil',
      description: 'A spiritually significant location known for its ancient temple and devotional practices.',
      mapLink: 'https://www.google.com/maps?q=SingaPerumal Kovil,Tamil+Nadu'
    },
    {
      name: 'Srirangam',
      description: 'Home to the grand Sri Ranganathaswamy Temple, one of the most important Vaishnavite shrines.',
      mapLink: 'https://www.google.com/maps?q=Srirangam,Tamil+Nadu'
    },
    {
      name: 'Srivilliputhur',
      description: 'A divine town famous for Andal Temple and its deep roots in Tamil Vaishnavism.',
      mapLink: 'https://www.google.com/maps?q=Srivilliputhur,Tamil+Nadu'
    },
    {
      name: 'Velachery',
      description: 'A divine town famous for Andal Temple and its deep roots in Tamil Vaishnavism.',
      mapLink: 'https://www.google.com/maps?q=Velachery,Tamil+Nadu'
    }
  ];
  
}

