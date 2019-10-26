import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { UsersModule } from '../users.module';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/user/user';

@Component({
    selector: "pd-user",
    templateUrl: "user.component.html"
})


export class UserComponent implements OnInit{

    users: User[] = [];

    user: User;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private auth: AuthService){ }

    ngOnInit() {

        
        

        this.http
            .get<User[]>("http://localhost:8080/users/" + this.auth.username)
            .subscribe(user => this.users = user, err => console.log(err.message));
    }

}