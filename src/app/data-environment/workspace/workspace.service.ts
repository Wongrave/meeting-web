import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from './factor/factor';
import { Proposition } from '../propositions/proposition/proposition';
import { Section } from './section/section';
import { Group } from './group/group';

const APIFACTOR = 'http://177.70.27.122:8080/factors'
const APISECTION = 'http://177.70.27.122:8080/sections'
const APIGROUP = 'http://177.70.27.122:8080/groups'


@Injectable({ providedIn: 'root' })
export class WorkspaceService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

    newSection(tag: string, description: string, summary: string, selected: boolean, factor: Factor) {
        return this.http.post(APISECTION + '/new', { tag, description, summary, selected, factor }).toPromise();
    }

    deleteSection(id: number) {
      return this.http.delete(APISECTION+'/delete/'+id, {}).toPromise();

    }

    newGroup(description: string, propositionId: number) {
      return this.http.post(APIGROUP + '/new', {description, propositionId}).toPromise();
    }

    getGroups(propositionId: number) {
      return this.http.get<Group[]>(APIGROUP+'/from/'+propositionId, {})

    }

}
