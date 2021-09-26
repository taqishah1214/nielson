import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient) {}
  getClientId(): string {
    // @ts-ignore
    return environment.clientCode;
  }

  getUserName(): string {
    // @ts-ignore
    return environment.userName;
  }

}
