import { Component } from '@angular/core';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { Observable } from 'rxjs';
import { Proposition } from '../data-environment/propositions/proposition/proposition';
import { Router } from '@angular/router';
import { UserService } from '../core/user/user.service';
import { TokenService } from '../core/token/token.service';
import { OrganizationService } from '../organization-environment/organizations/organization/organization.service';
import { TouchSequence } from 'selenium-webdriver';


@Component({
    selector: "pd-navbar",
    templateUrl: "navbar.component.html"
})

export class NavbarComponent {

    constructor( 
        private propositionService: PropositionService, 
        private router: Router,
        private userService: UserService,
        private organizationService: OrganizationService,
        private tokenService: TokenService) { 
        this.proposition$ = propositionService.getProposition();
        this.proposition$.subscribe(proposition => this.proposition = proposition);
        this.username = this.userService.getUsername();

        
        

        
    }

    username: string;
    name='Meeting';
    hrefPropositionFromUser: string;
    hrefPropositionWorkspace: string;
0
    proposition$: Observable<Proposition>;
    proposition: Proposition;

    

    changeProposition(){
        this.propositionService.removeProposition();
        this.proposition = null;
        this.router.navigate(['propositions/fromUser', this.username])
        
    }

    evaluate(){
        
    }

    disconnect(){
        this.propositionService.removeProposition();
        this.organizationService.removeOrganization();
        this.tokenService.removeToken();
        this.router.navigate(['/'])
    }

}