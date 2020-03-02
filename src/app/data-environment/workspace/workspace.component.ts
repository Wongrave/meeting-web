import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { UserPd } from '../../users/user/userpd';
import { Proposition } from '../propositions/proposition/proposition';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { Factor } from './factor/factor';
import { WorkspaceService } from './workspace.service';
import { OrganizationService } from '../../organization-environment/organizations/organization/organization.service'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Section } from './section/section';
import { Profile } from './profile/profile';
import { Group } from './group/group';

@Component({
  styleUrls: ['./workspace.component.css'],
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

  proposition: Proposition;
  newFactorTag = "";
  newFactorDescription = "";
  newFactorSummary = "";
  newFactorSelected = false;
  newSectionTag = "";
  newSectionDescription = "";
  newSectionSummary = "";
  newSectionSelected = false;
  changeAdminProfile = false;
  changeExpertProfile = false;
  changeAnalystProfile = false;
  username: string;

  factors: Factor[] = []
  groups: Group[] = []
  newGroupName = "Grupo";
  profiles: Profile[] = [];
  suggestedUsers: UserPd[] = [];




  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private location: Location,
    private userService: UserService,
    private propositionService: PropositionService,
    private organizationService: OrganizationService,
    private workspaceService: WorkspaceService,
    private modalService: NgbModal) { }

  closeResult: string;

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  async newFactor(newFactorTag: string, newFactorDescription: string, newFactorSummary: string, newFactorSelected: boolean) {

    await this.workspaceService
      .newFactor(newFactorTag, newFactorDescription, newFactorSummary, newFactorSelected, this.proposition);

    this.modalService.dismissAll();

    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

    async deleteFactor(id: number) {

      await this.workspaceService
        .deleteFactor(id)


    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

  async newSection(newSectionTag: string, newSectionDescription: string, newSectionSummary: string, newSectionSelected: boolean, factor: Factor) {

    await this.workspaceService
      .newSection(newSectionTag, newSectionDescription, newSectionSummary, newSectionSelected, factor);

    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

    async deleteSection(id: number) {

      await this.workspaceService
              .deleteSection(id)

      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      });

    }

    visible = false;
    toggle() {
      this.visible = !this.visible;
    }


    async newGroup(){
      await this.workspaceService
      .newGroup(this.newGroupName, this.proposition.id)

      this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      })
    
    }

    changeAdmin( id: number, checked: boolean ) {

      this.workspaceService.changeAdmin( id, checked );

    }

    changeExpert( id: number, checked: boolean ) {

      this.workspaceService.changeExpert( id, checked );

    }

    changeAnalyst( id: number, checked: boolean ) {

      this.workspaceService.changeAnalyst( id, checked );

    }

    async addProfile(userId: number, name:string) {

      await this.workspaceService.addProfile( this.proposition.id, userId, name);

      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      });

    }


  ngOnInit(): void {
    this.workspaceService.getSuggestedUsers(this.organizationService.getOrganizationId()).subscribe(
      suggestedUsers => this.suggestedUsers = suggestedUsers
    )
    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.workspaceService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

    this.workspaceService.getProfiles(this.proposition.id).subscribe(
      profiles => this.profiles = profiles
    )
    console.log(this.profiles)

    this.workspaceService.getGroups(this.proposition.id).subscribe(
      groups => this.groups = groups
    )

  }

}
