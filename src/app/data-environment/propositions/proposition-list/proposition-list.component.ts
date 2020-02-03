import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Proposition } from '../proposition/proposition';
import { PropositionService } from '../proposition/proposition.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { OrganizationService } from 'src/app/organization-environment/organizations/organization/organization.service';

@Component({
  selector: 'app-proposition-list',
  templateUrl: './proposition-list.component.html',
  styleUrls: ['./proposition-list.component.css']
})
export class PropositionListComponent implements OnInit {

  propositions: Proposition[] = [];

  newDescription = "";
  newSummary = "";
  newDate: Date = new Date;
  newCollection = "";

  newPropositionForm: FormGroup;

  username: string;
  userId: number;
  organizationId: number;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private auth: AuthService,
    private propositionService: PropositionService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private organizationService: OrganizationService 
    ) { }


  selectProposition(id: number){

    this.propositionService.selectProposition(id)
      .subscribe(
        () => this.router.navigate(['dashboard']),

        err => {
            console.log('erro na escolha')
            
        }

      )
    console.log(id);

  }


  async newProposition(description: string, summary: string, date: Date, collection: string) {
  
    
    await this.propositionService
      .newProposition(this.userId, this.organizationId, description, summary, date, collection);

     this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
   })

  }

  async deleteProposition(id: number) {
      await this.propositionService
        .deleteProposition(id)
      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
          console.log(decodeURI(this.location.path()))
          this.router.navigate([decodeURI(this.location.path())])
      })
  }

  ngOnInit() {

    // this.newPropositionForm = this.formBuilder.group({
    //   newDescription: ['', Validators.required],
    //   newSummary: ['', Validators.required],
    //   newDate: ['', Validators.required],
    //   newCollection: ['', Validators.required]
    // });
    

    this.username = this.userService.getUsername();
    this.userId = this.userService.getUserId();
    console.log(this.organizationService.getOrganizationId() + '  before')
    this.organizationId = this.organizationService.getOrganizationId()


    console.log(this.username)

    this.propositionService
      .listFromUser(this.userId)
      .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));

    // let proposition: Proposition;
    

  }

}
