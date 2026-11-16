import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';


@Component({
  selector: 'app-about-swamy',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './about-swamy.component.html',
  styleUrls: ['./about-swamy.component.css']
})
export class AboutSwamyComponent {
  private readonly order = [1, 2, 7, 8, 3, 4, 5, 6, 9, 10, 11, 12, 13];

  images = this.order.map((n) => ({
    n,
    src: `images/Aachariyan_Perumai/Aachariyan_Perumai_${String(n).padStart(3, '0')}.jpeg`,
  }));
  
}

