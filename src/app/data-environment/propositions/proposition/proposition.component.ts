import { Component } from '@angular/core';

@Component({
    selector: 'pd-proposition',
    templateUrl: 'proposition.component.html'
})
export class PropositionComponent { 

    propositions: Object[] = [];

    constructor(private http: HttpClient){

        http
            .get<Object[]>("http://localhost:8080/meeting-web/listaUsuarios")
            .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));
    }
}