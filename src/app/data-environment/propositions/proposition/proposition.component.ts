import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'pd-proposition',
    templateUrl: 'proposition.component.html'
})
export class PropositionComponent { 

    propositions: Object[] = [];

    constructor(private http: HttpClient){

        http
            .get<Object[]>("http://localhost:8080/meeting-web/listaProposicoes")
            .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));
    }
}