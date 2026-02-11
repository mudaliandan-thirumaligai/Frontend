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
      name: 'Srirangam',
      slug: 'srirangam',
      description: 'Srirangam Thirumaligai is the foremost center of the Mudaliandan parampara. As the "Priya Bhagineya" of Swami Ramanuja, Mudaliandan was entrusted with the administration of the Srirangam temple. This Thirumaligai continues to be a vibrant center for daily services, administrative duties, and spiritual guidance for thousands of devotees.',
      image: 'images/Thirumaaligais/srirangam.jpg',
      mapLink: 'https://www.google.com/maps?q=Srirangam+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Kancheepuram',
      slug: 'kancheepuram',
      description: 'Kanchipuram holds a special place in history as the city where Swami Mudaliandan served Swami Ramanuja with absolute devotion. The Thirumaligai here is a historic landmark and a center for learning the Vaisisthadvaita philosophy, maintaining the traditions established during the early years of the lineage.',
      image: 'images/Thirumaaligais/kanchipuram.jpg',
      mapLink: 'https://www.google.com/maps?q=Kanchipuram+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Singaperumal Koil',
      slug: 'singaperumal-koil',
      description: 'The Singaperumal Koil Thirumaligai is a key spiritual hub, deeply connected to Swami Annavilappan, a prominent descendant of the Mudaliandan lineage. Located near the ancient hill temple of Lord Narasimha, it serves as a center for kainkaryam and the distribution of Sripadha Theertham.',
      image: 'images/Thirumaaligais/spkovil.jpg',
      mapLink: 'https://www.google.com/maps?q=Singaperumal+Koil+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Melkote',
      slug: 'melkote',
      description: 'Melkote, also known as Tirunarayanapuram, became a major Vaisishnavite center when Swami Ramanuja stayed here for 12 years. Mudaliandan played a pivotal role in establishing the panchacharyas and the local administration. The Melkote Thirumaligai preserves the miraculous legacy of the Sripada Theertham.',
      image: 'images/Thirumaaligais/melkote.jpg',
      mapLink: 'https://www.google.com/maps?q=Melkote+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Kooram',
      slug: 'kooram',
      description: 'Kooram is immortalized as the birthplace of Koorathazhwan. The Mudaliandan Thirumaligai here highlights the deep spiritual unity between the two primary disciples of Ramanuja. It remains a tranquil site for contemplation and receiving the blessings of the Acharyas.',
      image: 'images/Thirumaaligais/kooram.jpg',
      mapLink: 'https://www.google.com/maps?q=Kooram+Adikesava+Perumal+Temple'
    },
    // {
    //   name: 'Nazarethpettai',
    //   slug: 'nazarethpettai',
    //   description: 'Nazarethpettai, historically known as Pachhai Vaarana Perumal Sannidhi, is the holy avatara stalam of Swami Mudaliandan. It is here that the "Yathiraja Paduka" was born in 1027 CE. The site remains a pilgrimage destination for those seeking to connect with the origins of this glorious lineage.',
    //   image: 'images/mudaliandan/wide-angle.png',
    //   mapLink: 'https://www.google.com/maps?q=Nazarethpettai+Mudaliandan+Birthplace'
    // }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      this.place = this.thirumaligais.find(
        item => item.slug === slug
      );
    });
  }
}
