import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from './factor/factor';
import { Proposition } from '../propositions/proposition/proposition';
import { Section } from './section/section';
import { Profile } from './profile/profile';
import { Group } from './group/group';
import { UserPd } from '../../users/user/userpd'

const APIFACTOR = 'http://177.70.27.122:8080/factors'
const APISECTION = 'http://177.70.27.122:8080/sections'
const APIGROUP = 'http://177.70.27.122:8080/groups'
const APIPROFILE = 'http://177.70.27.122:8080/profiles'


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

    changeAdmin(id: number, admin: boolean) {
      return this.http.put(APIPROFILE+'/changeAdmin/'+id, { id, admin }).subscribe();
    }

    changeExpert(id: number, expert: boolean) {
      return this.http.put(APIPROFILE+'/changeExpert/'+id, { id, expert }).subscribe();
    }

    changeAnalyst(id: number, analyst: boolean) {
      return this.http.put(APIPROFILE+'/changeAnalyst/'+id, { id, analyst }).subscribe();
    }

    addProfile( propositionId: number, userId: number, name: string ) {
      return this.http.post<Profile>(APIPROFILE+'/new', { propositionId, userId, name }).toPromise();
    }

    getSuggestedUsers(propositionId:number) {
      return this.http.get<UserPd[]>(APIPROFILE+'/suggestedUsers/'+propositionId, {});
    }

    getProfiles(propositionId: number){
      return this.http.get<Profile[]>(APIPROFILE+'/from/'+propositionId, {})

    }

    getGroups(propositionId: number) {
      return this.http.get<Group[]>(APIGROUP+'/from/'+propositionId, {})

    }

    deleteProfile(id:number) {
      return this.http.delete(APIPROFILE+'/delete/'+id, {}).toPromise();

    }
}
