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

    saveEvidence(evidence: Evidence) {
        let id = evidence.id
        let propositionId = evidence.propositionId
        let factor = evidence.factor
        let section = evidence.section
        let profileId = evidence.profileId
        let groupId = evidence.groupId
        let favorable = evidence.favorable
        let unfavorable = evidence.unfavorable
        let weight = evidence.weight
        let confirmed = evidence.confirmed
        return this.http
            .post(APIEVIDENCE + '/new', { id, propositionId, factor, section, profileId, groupId, favorable, unfavorable, weight, confirmed }).toPromise();
        // console.log(evidences)
        // return this.http
        //     .post(APIEVIDENCE + '/new', { evidences }).toPromise();
    }
}
