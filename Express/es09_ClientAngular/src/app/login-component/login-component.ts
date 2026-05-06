import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonService } from '../services/common-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

declare const google: any;

@Component({
  selector: 'app-login-component',
  imports: [FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private commonService: CommonService = inject(CommonService)
  private router: Router = inject(Router)
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
        // alert("Login ok")
        this.router.navigate(["/main"])
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

  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.loginWithGoogle(response)
    });

    let buttonContainer = document.getElementById("myGoogleDiv")
    buttonContainer!.innerHTML = ""
    google.accounts.id.renderButton(
      buttonContainer,
      {
        "theme": "outline",
        "size": "large",
        "type": "standard",
        "text": "continue_with",
        "shape": "rectangular",
        "logo_alignment": "center"
      }
    )
  }
  
  loginWithGoogle(response: any) {
    console.log(response.credential)
    const googleToken = response.credential
    this.commonService.loginWithGoogle(googleToken)?.subscribe({
      next: (data: any) => {
        this.router.navigate(["/main"])
      },
      error: (err: any) => {
        if(err.status == 403)
          this.lblErrore
        else{
          alert(err.status + " : " + err.error)
          console.log(err)
        }
      }
    })
  }
}
