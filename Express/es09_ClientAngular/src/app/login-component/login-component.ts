import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonService } from '../services/common-service';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private commonService: CommonService = inject(CommonService)
  txtUsername: string = "pippo@gmail.com"
  txtPassword: string = "pippo"
  lblErrore: boolean = false

  controllaLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      Object.values(loginForm.controls).forEach((control: any) => {
        control.markAsTouched()
      })
    }
    const user: any = { "username": this.txtUsername, "password": this.txtPassword }
    this.commonService.doLogin(user).subscribe({
      "next": (data) => {
        alert("Login ok")
      },
      "error": (error) => {
        console.log(error)
        if (error.status == 401)
          this.lblErrore = true
        else
          alert(error.status + " : " + error.error)
      }
    })
  }

  chiudi() {
    this.lblErrore = false
  }
}
