import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStorageService } from './data-storage-services';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private dataStorageService: DataStorageService = inject(DataStorageService)
  doLogin(user:any): Observable<any>{
    return this.dataStorageService.InviaRichiesta("POST", "/login", user)!
  }
}
