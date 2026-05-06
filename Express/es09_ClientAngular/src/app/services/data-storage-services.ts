import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  private http = inject(HttpClient)
  private REST_API_SERVER = "https://localhost:3001/api"

  public InviaRichiesta(method: string, endpoint: string, options: any = {}) {
    let url = this.REST_API_SERVER + endpoint
    switch (method.toLowerCase()) {
      case "get": return this.http.get(url, { "params": options, withCredentials: true })
      case "post": return this.http.post(url, options, { withCredentials: true })
      case "put": return this.http.put(url, options, { withCredentials: true })
      case "patch": return this.http.patch(url, options, { withCredentials: true })
      case "delete": return this.http.delete(url, { "params": options, withCredentials: true })
      default:
        return undefined
    }
  }
}
