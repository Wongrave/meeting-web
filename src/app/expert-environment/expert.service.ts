import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Factor } from '../data-environment/workspace/factor/factor';
import { Evidence } from './evidences/evidence';
const APIFACTOR = 'http://177.70.27.122:8080/factors';
const APIEVIDENCE = 'http://177.70.27.122:8080/evidences';

@Injectable({ providedIn: 'root' })
export class ExpertService {

    private evidenceSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

    getFromProposition(propositionId: number, userId: number) {
        return this.http
            .get<Evidence[]>(APIEVIDENCE + '/' + userId.toString() + '/' + propositionId.toString());
    }

    saveEvidences(evidences: Evidence[]) {
       return this.http
            .post(APIEVIDENCE + '/new', evidences);
    }
}
