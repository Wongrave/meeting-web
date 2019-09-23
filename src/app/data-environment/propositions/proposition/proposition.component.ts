import { Component, OnInit } from '@angular/core';

import { PropositionService } from './proposition.service';
import { Proposition } from './proposition';

@Component({
    selector: 'pd-proposition',
    templateUrl: 'proposition.component.html'
})
export class PropositionComponent implements OnInit { 

    propositions: Proposition[] = [];

    constructor(private propositionService: PropositionService) { }

    ngOnInit(): void {
        this.propositionService
            .listFromUser('')
            .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));
    }
}