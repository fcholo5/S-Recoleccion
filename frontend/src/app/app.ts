import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Sidebar } from "./shared/sidebar/sidebar";
import { Navbar } from "./shared/navbar/navbar";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [RouterOutlet]
})
export class AppComponent {
  isLoginPage = true; // valor inicial mientras carga

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url === '/login';
      });
  }
}
