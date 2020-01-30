import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from './factor/factor';
import { Proposition } from '../propositions/proposition/proposition';
import { Section } from './section/section';

const APIFACTOR = 'http://177.70.27.122:8080/factors'
const APISECTION = 'http://177.70.27.122:8080/sections'

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

    newFactor( tag: string, description: string, summary: string, selected: boolean, proposition: Proposition ){
        return this.http.post(APIFACTOR+'/new', { tag, description, summary, selected, proposition }).subscribe();
    }

    newSection( tag: string, description: string, summary: string, selected: boolean, factor: Factor ) {
        return this.http.post(APISECTION+'/new', { tag, description, summary, selected, factor }).subscribe();
    }

    deleteFactor( id: number) {
        return this.http.post(APIFACTOR+'/delete/'+id, {})
    }

    deleteSection( id: number) {
        return this.http.post(APISECTION+'/delete/'+id, {})
    }
}
