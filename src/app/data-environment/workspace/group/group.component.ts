import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from './group.service';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { Proposition } from '../../propositions/proposition/proposition';
import { Group } from './group';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/profile';
import { UserPd } from '../../../users/user/userpd';
import { Identifiers } from '@angular/compiler';

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
  
  suggestedProfiles: Profile[] = []


    constructor(private modalService: NgbModal,
      private router: Router,
      private location: Location,
      private propositionService: PropositionService,
      private groupService: GroupService,
      private profileService: ProfileService
    ) { }

    open(content, group: Group) {
      this.group = group
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = 'Closed with: ${result}'
      }, (reason) => {
        this.closeResult = 'Dismissed ${this.getDismissReason(reason)}'
      });
      this.groupService.getSuggestedProfiles(this.proposition.id).subscribe(
        suggestedProfiles => this.suggestedProfiles = suggestedProfiles
      )
      console.log(this.suggestedProfiles)
    }

    async addToGroup(profileId: number, groupId: number) {
      await this.groupService.addToGroup(profileId, groupId);
        
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
