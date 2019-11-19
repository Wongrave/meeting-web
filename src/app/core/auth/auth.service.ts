import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserService } from '../user/user.service';

const API_URL = 'http://177.70.27.122:8080';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  username: string;

  constructor(
    private http: HttpClient,
    private userService: UserService) { }

  authenticate(username: string, password: string) {

    this.username =  username;
    return this.http
      .post(
        API_URL+'/auth', 
        { username, password }, 
        { observe: 'body', 
        responseType: 'text' }
      )
      .pipe(

        // map((response) => ({
        //   data: response.body, 
        //   status: response.status})
        // tap(res => {
        // const authToken = res.headers.get('x-access-token');
        // console.log(authToken)
        //}

        map(res => {
          const authToken = res;

          this.userService.setToken(authToken);
          console.log(authToken.toString())
         
          
        }
      )
    );
      

  }
}
