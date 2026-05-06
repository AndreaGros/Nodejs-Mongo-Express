import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataStorageService } from './data-storage-services';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private dataStorageService: DataStorageService = inject(DataStorageService)
  public mailList: any = []

  doLogin(user: any): Observable<any> {
    return this.dataStorageService.InviaRichiesta("POST", "/login", user)!.pipe
      (
        tap((data: any) => {

        })
      )
  }

  getMails(): Observable<any> {
    return this.dataStorageService.InviaRichiesta("GET", "/mails")!.pipe
      (
        tap((data: any) => {
          this.mailList = data.mail
        })
      )
  }

  doLogout() {
    return this.dataStorageService.InviaRichiesta("POST", "/logout")!
  }

  loginWithGoogle(googleToken: any) {
    return this.dataStorageService.InviaRichiesta("POST", "/loginWithGoogle", { googleToken })
  }
}
