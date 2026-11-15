import { Component} from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [RouterModule
  ],
  templateUrl: './app-footer.component.html',
})
export class AppFooterComponent {
   currentYear = new Date().getFullYear();
}
