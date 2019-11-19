import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Factor } from '../data-environment/workspace/factor/factor';

const APIFACTOR = 'http://177.70.27.122:8080/factors'

@Injectable({ providedIn: 'root' })
export class ExpertService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

}