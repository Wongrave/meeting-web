import { Component, OnInit } from '@angular/core';
import { Section } from './section';
import { SectionService } from './section.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { Proposition } from '../../propositions/proposition/proposition';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { Factor } from '../factor/factor';
import { OrganizationService } from '../../../organization-environment/organizations/organization/organization.service'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FactorService } from '../factor/factor.service';

@Component({
    selector: 'pd-section',
    templateUrl: './section.component.html'
})
export class SectionComponent implements OnInit {
    proposition: Proposition;

    newSectionTag = "";
    newSectionDescription = "";
    newSectionSummary = "";
    newSectionSelected = false;

    factors: Factor[] = [];

    constructor(private modalService: NgbModal,
    private router: Router,
    private sectionService: SectionService,
    private factorService: FactorService,
    private propositionService: PropositionService,
    private location: Location) { }

    async newSection(newSectionTag: string, newSectionDescription: string, newSectionSummary: string, newSectionSelected: boolean, factor: Factor) {

        await this.sectionService
            .newSection(newSectionTag, newSectionDescription, newSectionSummary, newSectionSelected, factor);

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        });

    }

    async deleteSection(id: number) {

        await this.sectionService
            .deleteSection(id)

        this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        });

    }

    ngOnInit() {

        this.propositionService.getProposition().subscribe(
            proposition => this.proposition = proposition
        )

        this.factorService.listFromProposition(this.proposition.id).subscribe(
            factors => this.factors = factors
        )

    }

}
