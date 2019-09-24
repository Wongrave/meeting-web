import { Component } from '@angular/core';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { Observable } from 'rxjs';
import { Proposition } from '../data-environment/propositions/proposition/proposition';
import { Router } from '@angular/router';
import { UserService } from '../core/user/user.service';
import { TokenService } from '../core/token/token.service';


@Component({
    selector: "pd-navbar",
    templateUrl: "navbar.component.html"
})

export class NavbarComponent {

    username='tomiatti';
    name='Meeting';
    hrefPropositionFromUser='propositions/fromUser/'+this.username;

    proposition$: Observable<Proposition>;
    proposition: Proposition;

    constructor( 
        private propositionService: PropositionService, 
        private router: Router,
        private userService: UserService,
        private tokenService: TokenService) { 
        this.proposition$ = propositionService.getProposition();
        this.proposition$.subscribe(proposition => this.proposition = proposition);
    }

    changeProposition(){
        this.propositionService.removeProposition();
        this.proposition = null;
        this.router.navigate(['propositions/fromUser', this.username])
        
    }

    evaluate(){
        
    }

    disconnect(){
        this.propositionService.removeProposition();
        this.tokenService.removeToken();
        this.router.navigate(['/'])
    }

}