import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { UsersModule } from '../users.module';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
    selector: "pd-user",
    templateUrl: "user.component.html"
})


export class UserComponent implements OnInit{

    users: Object[] = [];

    user: Object;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private auth: AuthService){ }

    ngOnInit() {

        
        

        this.http
            .get<Object[]>("http://localhost:8080/users/" + this.auth.username)
            .subscribe(user => this.user = user, err => console.log(err.message));
    }

}