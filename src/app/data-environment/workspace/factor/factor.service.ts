import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from './factor';
import { Proposition } from '../../propositions/proposition/proposition';
import { Section } from '../section/section';
import { Profile } from '../profile/profile';
import { Group } from '../group/group';
import { UserPd } from '../../../users/user/userpd'

const APIFACTOR = 'http://177.70.27.122:8080/factors'

@Injectable({ providedIn: 'root' })

export class FactorService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

    newFactor(tag: string, description: string, summary: string, selected: boolean, proposition: Proposition) {
        return this.http.post(APIFACTOR + '/new', { tag, description, summary, selected, proposition }).toPromise();
    }

    deleteFactor(id: number) {
      return this.http.delete(APIFACTOR+'/delete/'+id, {}).toPromise();
    }
}
