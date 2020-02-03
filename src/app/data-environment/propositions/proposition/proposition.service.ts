import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proposition } from './proposition';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const API = 'http://177.70.27.122:8080/propositions'
const PROPKEY = 'propositionId'

@Injectable({ providedIn: 'root' })
export class PropositionService {

    private propositionSubject = new BehaviorSubject<Proposition>(null);

    constructor(private http: HttpClient) { }

    listFromUser(user: number) {

        return this.http
            .get<Proposition[]>(API + '/fromUser/' + user);

    }

    selectProposition(id: number) {

        return this.http
            .get(API + '/' + id, 
            { observe: 'body', responseType: 'text'} )
            .pipe(map(
                res => {
                    const prop = res;
                    this.setProposition(prop.toString());
                }
            ))
            

    }

    hasProposition(){
        return !!this.getProposition();
    }

    setProposition(proposition){
        
        window.localStorage.setItem(PROPKEY, proposition);
    }

    decodify(){
        const proposition = window.localStorage.getItem(PROPKEY);
        const prop = JSON.parse(proposition) as Proposition;
        this.propositionSubject.next(prop);
    }

    getProposition() {
        this.decodify();
        return this.propositionSubject.asObservable();
    }

    removeProposition() {
        window.localStorage.removeItem(PROPKEY);
    }

    newProposition( userId: number, organizationId: number, description: string, summary: string, date: Date, collection: string){
        console.log(organizationId + ' eh o id')
        return this.http.post(API+'/new', { userId, organizationId, description, summary, date, collection }).toPromise();

    }
    
    deleteProposition(id: number) {
        return this.http.post(API+'/delete/'+id, {}).toPromise();
    }
}

