import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Sidebar} from '../shared/sidebar/sidebar';
import {Navbar} from '../shared/navbar/navbar';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Navbar
  ],
  templateUrl: './business.html',
  styleUrl: './business.scss',
})
export class Business {

}
