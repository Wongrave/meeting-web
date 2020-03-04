import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { Proposition } from '../propositions/proposition/proposition';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { Factor } from './factor/factor';
import { WorkspaceService } from './workspace.service';
import { OrganizationService } from '../../organization-environment/organizations/organization/organization.service'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Section } from './section/section';
import { Group } from './group/group';

@Component({
  styleUrls: ['./workspace.component.css'],
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

  proposition: Proposition;
  newSectionTag = "";
  newSectionDescription = "";
  newSectionSummary = "";
  newSectionSelected = false;
  username: string;

  factors: Factor[] = []
  groups: Group[] = []
  newGroupName = "Grupo";




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


    async newGroup(){
      await this.workspaceService
      .newGroup(this.newGroupName, this.proposition.id)

      this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      })

    }


  ngOnInit(): void {

    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.workspaceService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

    this.workspaceService.getGroups(this.proposition.id).subscribe(
      groups => this.groups = groups
    )

  }

}
