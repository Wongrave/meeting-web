import { Component, OnInit } from '@angular/core';

import { PropositionService } from './proposition.service';
import { Proposition } from './proposition';

@Component({
    selector: 'pd-proposition',
    templateUrl: 'proposition.component.html'
})
export class PropositionComponent implements OnInit { 

    propositions: Proposition[] = [];
    proposition: Proposition

    constructor(private propositionService: PropositionService) { }

    ngOnInit(): void {
        
    }
    // ngOnInit(): void {
    //     this.propositionService
    //         .listFromUser(0)
    //         .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));
    // }
}