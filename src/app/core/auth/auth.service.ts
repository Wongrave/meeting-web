import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:8080';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userName: string;

  constructor(private http: HttpClient) { }

  authenticate(userName: string, password: string) {

    this.userName =  userName;
    return this.http.post(API_URL+'/users/login', { userName, password })

  }
}
