import { Component, inject } from '@angular/core';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-component',
  imports: [],
  templateUrl: './main-component.html',
  styleUrl: './main-component.css',
})
export class MainComponent {
  public commonService: CommonService = inject(CommonService)
  private router: Router = inject(Router)

  ngOnInit() {
    this.commonService.getMails().subscribe({
      "next": (data: any) => {
        // alert("Login ok")
        console.log(data)
      },
      "error": (error: any) => {
        console.log(error)
        if (error.status == 403)
          this.router.navigate(["/login"])
        else
          alert(error.status + " : " + error.error)
      }
    })
  }
}
