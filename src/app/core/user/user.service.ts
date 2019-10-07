import { Injectable } from "@angular/core";
import { TokenService } from '../token/token.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { User } from './user';
import * as jwt_decode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class UserService {

    private userSubject = new BehaviorSubject<User>(null);
    username: string;
    userId: number;

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
        this.username = user.username;
        this.userId = user.sub;
        this.userSubject.next(user);
    }

    getUser() {
        return this.userSubject.asObservable();
    }

    getUsername(){
        
        return this.username;
        // if(this.tokenService.hasToken()){

        //     this.getUser().subscribe(
        //         user => this.username = user.username, err => console.log(err.message)
        //     );
        
        //     return this.username;
        // }
        // return ""
    }

    getUserId(){
        return this.userId;
    }

    disconnect() {
        this.tokenService.removeToken();
        this.userSubject.next(null);
    }

    isLogged() {
        return this.tokenService.hasToken();
    }
}