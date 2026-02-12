import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { THIRUMALIGAIS, Thirumaligai } from '../thirumaligai.data';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-thirumaligai-detail',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent, RouterModule],
  templateUrl: './thirumaaligai-detail.component.html'
})
export class ThirumaligaiDetailComponent implements OnInit {

  place?: Thirumaligai;   

  thirumaligais: Thirumaligai[] = THIRUMALIGAIS;

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
