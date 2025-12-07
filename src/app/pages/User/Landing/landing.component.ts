import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  teamMembers = [
    { name: 'John Doe', role: 'CEO', initials: 'JD' },
    { name: 'Jane Smith', role: 'CTO', initials: 'JS' },
    { name: 'Mike Johnson', role: 'CFO', initials: 'MJ' },
    { name: 'Sarah Wilson', role: 'CMO', initials: 'SW' }
  ];

}
