import { Component, inject, Input } from '@angular/core';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  commonService = inject(CommonService)
  router = inject(Router)
  @Input() showLogout: boolean = false
  doLogout() {
    this.commonService.doLogout()?.subscribe({
      next: () => {
        alert("Sessione chiusa correttamente")
        this.router.navigate(["login"])
      },
      error: (err) => {
        alert(err.status + " : " + err.error)
        this.router.navigate(["login"])
      },
    })
  }
}
