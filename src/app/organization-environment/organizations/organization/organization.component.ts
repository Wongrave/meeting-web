import { Component, OnInit } from '@angular/core';

import { OrganizationService } from './organization.service';
import { Organization } from './organization';

@Component({
    selector: 'pd-organization',
    templateUrl: 'organization.component.html'
})
export class OrganizationComponent implements OnInit { 

    organizations: Organization[] = [];

    constructor(private organizationService: OrganizationService) { }

    ngOnInit(): void {
        this.organizationService
            .listFromUser(0)
            .subscribe(organizations => this.organizations = organizations, err => console.log(err.message));
    }
}