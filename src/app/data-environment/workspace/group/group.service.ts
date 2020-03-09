import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from './group';
import { Profile } from '../profile/profile';

const API = 'http://177.70.27.122:8080/groups'

const APIPROFILE = 'http://177.70.27.122:8080/profiles'


@Injectable({ providedIn: 'root' })
export class GroupService {

    constructor(private http: HttpClient) { }

    newGroup(description: string, propositionId: number) {
      return this.http.post<Group>(API + '/new', {description, propositionId}).toPromise();
    }

    getGroups(propositionId: number) {
      return this.http.get<Group[]>(API+'/from/'+propositionId, {})

    }

    getSuggestedProfiles(propositionId: number) {
      return this.http.get<Profile[]>(APIPROFILE + '/from/' + propositionId, {})
    }

    addToGroup(profileId: number, groupId: number) {
      return this.http.post<Group>(API + '/new', {profileId, groupId}).toPromise();
    }

    editGroup(description: string, summary: string ,propositionId: number, groupId: number ) {
      return this.http.put<Group>(API + '/' + groupId, {description, summary, propositionId}).toPromise();
    }
}
