import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

export interface Thirumaligai {
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  image: string;
  mapLink: string;
}

@Component({
  selector: 'app-thirumaligai-detail',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './thirumaaligai-detail.component.html'
})
export class ThirumaligaiDetailComponent implements OnInit {

  place?: Thirumaligai;   // 👈 make it optional

  thirumaligais: Thirumaligai[] = [
    {
      name: 'Kancheepuram',
      slug: 'kancheepuram',
      description: 'Kancheepuram is one of the seven Moksha-puris and a major center of Vaishnavism.',
      image: 'images/mudaliandan/hero-1.jpg',
      mapLink: 'https://www.google.com/maps?q=Kanchipuram,Tamil+Nadu'
    },
    {
      name: 'Srirangam',
      slug: 'srirangam',
      description: 'Srirangam is the foremost Divya Desam and houses the Sri Ranganathaswamy Temple.',
      image: 'images/mudaliandan/bank3.png',
      mapLink: 'https://www.google.com/maps?q=Srirangam,Tamil+Nadu'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      this.place = this.thirumaligais.find(
        item => item.slug === slug
      );
    });
  }
}
