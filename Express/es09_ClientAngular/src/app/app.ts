import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header-component/header-component";
import { LoginComponent } from "./login-component/login-component";
import { MainComponent } from "./main-component/main-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public showLogout = false

  // tutte le volte che router-outlet cambia
  onActivate(component: any) {
    this.showLogout = component instanceof MainComponent
  }
}
