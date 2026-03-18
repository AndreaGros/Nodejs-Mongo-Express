import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header-component/header-component";
import { LoginComponent } from "./login-component/login-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('es09_ClientAngular');
}
