import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductDashboardComponent } from '@features/product-dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'E-Commerce Product Management';
}
