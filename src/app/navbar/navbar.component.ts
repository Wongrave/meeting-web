import { Component } from '@angular/core';


@Component({
    selector: "pd-navbar",
    templateUrl: "navbar.component.html"
})

export class NavbarComponent {

    userName='tomiatti';
    name='Meeting';
    hrefPropositionFromUser='propositions/fromUser/'+this.userName;



}