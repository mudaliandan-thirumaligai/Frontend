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
      name: 'Srirangam',
      slug: 'srirangam',
      shortDescription: 'The primary seat of the Mudaliandan lineage near Sri Ranganathaswamy Temple.',
      description: 'Srirangam Thirumaligai is the foremost center of the Mudaliandan parampara. As the "Priya Bhagineya" of Swami Ramanuja, Mudaliandan was entrusted with the administration of the Srirangam temple. This Thirumaligai continues to be a vibrant center for daily services, administrative duties, and spiritual guidance for thousands of devotees.',
      image: 'images/Thirumaaligais/srirangam.jpg',
      mapLink: 'https://www.google.com/maps?q=Srirangam+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Kancheepuram',
      slug: 'kancheepuram',
      shortDescription: 'A historic branch in the sacred city where Mudaliandan served Ramanuja.',
      description: 'Kanchipuram holds a special place in history as the city where Swami Mudaliandan served Swami Ramanuja with absolute devotion. The Thirumaligai here is a sanctuary of peace and a beacon of the Vishishtadvaita philosophy, maintaining the traditions established during the early years of the lineage.',
      image: 'images/Thirumaaligais/kanchipuram.jpg',
      mapLink: 'https://www.google.com/maps?q=Kanchipuram+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Singaperumal Koil',
      slug: 'singaperumal-koil',
      shortDescription: 'Associated with Swami Annavilappan and the Pataladhri Narasimhaswamy Temple.',
      description: 'The Singaperumal Koil Thirumaligai is a key spiritual hub, deeply connected to Swami Annavilappan, a prominent descendant of the Mudaliandan lineage. Located near the ancient hill temple of Lord Narasimha, it serves as a center for kainkaryam and the distribution of Sripadha Theertham.',
      image: 'images/Thirumaaligais/spkovil.jpg',
      mapLink: 'https://www.google.com/maps?q=Singaperumal+Koil+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Melkote',
      slug: 'melkote',
      shortDescription: 'The spiritual center in Karnataka established during Ramanuja\'s exile.',
      description: 'Melkote, also known as Tirunarayanapuram, became a major Vaisishnavite center when Swami Ramanuja stayed here for 12 years. Mudaliandan played a pivotal role in establishing the panchacharyas and the local administration. The Melkote Thirumaligai preserves the miraculous legacy of the Sripada Theertham.',
      image: 'images/Thirumaaligais/melkote.jpg',
      mapLink: 'https://www.google.com/maps?q=Melkote+Mudaliandan+Thirumaligai'
    },
    {
      name: 'Kooram',
      slug: 'kooram',
      shortDescription: 'A sacred village connecting the lineages of Mudaliandan and Koorathazhwan.',
      description: 'Kooram is immortalized as the birthplace of Koorathazhwan. The Mudaliandan Thirumaligai here highlights the deep spiritual unity between the two primary disciples of Ramanuja. It remains a tranquil site for contemplation and receiving the blessings of the Acharyas.',
      image: 'images/Thirumaaligais/kooram.jpg',
      mapLink: 'https://www.google.com/maps?q=Kooram+Adikesava+Perumal+Temple'
    },
    {
      name: 'Nazarethpettai',
      slug: 'nazarethpettai',
      shortDescription: 'The sacred birthplace of Swami Mudaliandan, also known as Mudaliandan Thirunagaram.',
      description: 'Nazarethpettai, historically known as Pachhai Vaarana Perumal Sannidhi, is the holy avatara stalam of Swami Mudaliandan. It is here that the "Yathiraja Paduka" was born in 1027 CE. The site remains a pilgrimage destination for those seeking to connect with the origins of this glorious lineage.',
      image: 'images/mudaliandan/wide-angle.png',
      mapLink: 'https://www.google.com/maps?q=Nazarethpettai+Mudaliandan+Birthplace'
    }
  ];

}
