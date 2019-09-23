import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proposition } from './proposition';

const API = 'http://localhost:8080/propositions'

@Injectable({ providedIn: 'root' })
export class PropositionService {

    constructor(private http: HttpClient) { }

    listFromUser(user: string) {

        return this.http
            .get<Proposition[]>(API + '/fromUser/' + user);

    }

    newProposition(userId: number, organizationId: number, description: string, summary: string, date: Date, collection: string){
        
        return this.http.post(API+'/new', { userId, organizationId, description, summary, date, collection })

    }

}