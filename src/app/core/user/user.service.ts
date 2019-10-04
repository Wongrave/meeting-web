import { Injectable } from "@angular/core";
import { TokenService } from '../token/token.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { User } from './user';
import * as jwt_decode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class UserService {

    private userSubject = new BehaviorSubject<User>(null);
    username: string;

    constructor(private tokenService: TokenService){
        this.tokenService.hasToken() && this.decodeAndNotify();
     }

    setToken(token: string){
        this.tokenService.setToken(token);
        this.decodeAndNotify();
    }

    private decodeAndNotify(){
        const token = this.tokenService.getToken();
        const user = jwt_decode(token) as User;
        this.userSubject.next(user);
    }

    getUser() {
        return this.userSubject.asObservable();
    }

    getUsername(){
        
        if(this.tokenService.hasToken()){

            this.getUser().subscribe(
                user => this.username = user.username, err => console.log(err.message)
            );
        
            return this.username;
        }
        return ""
    }

    disconnect() {
        this.tokenService.removeToken();
    }
}