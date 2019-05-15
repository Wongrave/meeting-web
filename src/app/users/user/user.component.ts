import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { UsersModule } from '../users.module';

@Component({
    selector: "pd-user",
    templateUrl: "user.component.html"
})
export class UserComponent {

    users: Object[] = [];

    constructor(private http: HttpClient){

        http
            .get<Object[]>("http://localhost:8080/meeting-web/listaUsuarios")
            .subscribe(users => this.users = users, err => console.log(err.message));
    }

}