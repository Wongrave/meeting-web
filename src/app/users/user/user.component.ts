import { Component } from '@angular/core';

@Component({
    selector: "pd-user",
    templateUrl: "user.component.html"
})
export class UserComponent {

    constructor(private http: HttpClient){
        
    }


}