import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from './group.service';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { Proposition } from '../../propositions/proposition/proposition';
import { Group } from './group';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/profile';

@Component({
  styleUrls: ['./group.component.css'],
  selector: 'pd-group',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {

  proposition: Proposition
  username: string
  closeResult: string;
  profile: Profile;
  group: Group
  groups: Group[] = []
  newGroupName = "Novo Grupo"
  newGroupSummary = ""
  profiles: Profile[] = []
  
  suggestedProfiles: Profile[] = []


    constructor(private modalService: NgbModal,
      private router: Router,
      private location: Location,
      private propositionService: PropositionService,
      private groupService: GroupService,
      private profileService: ProfileService
    ) { }

    async open(content, groupId: number, groupName: string, groupSummary: string) {
      console.log(groupId)
      
      this.newGroupName = groupName
      this.newGroupSummary = groupSummary
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = 'Closed with: ${result}'
      }, (reason) => {
        this.closeResult = 'Dismissed ${this.getDismissReason(reason)}'
      });
      await this.groupService.getProfiles(groupId).toPromise()
      .then(profiles => this.profiles = profiles)
      await this.groupService.getSuggestedProfiles(this.proposition.id).toPromise()
      .then(suggestedProfiles => this.suggestedProfiles = suggestedProfiles)
      console.log(this.profiles)
      console.log(this.suggestedProfiles)
    }

    async removeFromGroup(profile: Profile){
      console.log(this.profiles)
      console.log(profile.id)

      await this.groupService.removeFromGroup(profile.id)
      .then(() => this.suggestedProfiles.push(profile))
      .then(() => this.profiles = this.profiles.filter(newProfile => newProfile != profile))
    }

    async addToGroup(profile: Profile, groupId: number) {
      console.log(profile.id, groupId)

      await this.groupService.addToGroup(profile.id, groupId)
      .then(() => this.profiles.push(profile))
      .then(() => this.suggestedProfiles = this.suggestedProfiles.filter(newProfile => newProfile != profile))

      console.log(this.profiles)
        
    }

    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
    }

    async newGroup(){
        await this.groupService.newGroup(this.newGroupName, this.proposition.id).then(group => this.groups.push(group))
        this.modalService.dismissAll();
    }

    visible = false;
    toggle() {
      this.visible = !this.visible;
    }

     async editGroup(newGroupName: string, newGroupSummary: string, groupId: number){
      console.log(newGroupName, newGroupSummary, groupId) 
      await this.groupService.editGroup(newGroupName, newGroupSummary, this.proposition.id, groupId).then(group => this.groups.push(group))

       this.modalService.dismissAll();

       this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
         console.log(decodeURI(this.location.path()))
         this.router.navigate([decodeURI(this.location.path())])
    })
  }

    ngOnInit(): void {
   
        this.propositionService.getProposition().subscribe(
        proposition => this.proposition = proposition
        )

        this.groupService.getGroups(this.proposition.id).subscribe(
        groups => this.groups = groups
        )

    }

}
