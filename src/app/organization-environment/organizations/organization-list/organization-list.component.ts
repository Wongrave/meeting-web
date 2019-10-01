import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Organization } from '../organization/organization';
import { OrganizationService } from '../organization/organization.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { stringify } from '@angular/core/src/render3/util';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html'
})
export class OrganizationListComponent implements OnInit {

  organizations: Organization[] = [];

  newDescription = "";
  newSummary = "";

  newOrganizationForm: FormGroup;

  username: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private userService: UserService ){ }


  selectOrganization(id: number){
    
    this.userService.getUser().subscribe(user => this.username = user.username, err => console.log(err.message))

    this.organizationService.selectOrganization(id)
      .subscribe(
        () => this.router.navigate(['propositions/fromUser', this.username]),

        err => {
            console.log('erro na escolha')                    
        }
      )
    console.log(id);

  }


  newOrganization() {
    
    this.organizationService
      .newOrganization(this.newDescription, this.newSummary, true);

  }

  ngOnInit() {

    // this.newOrganizationForm = this.formBuilder.group({
    //   newDescription: ['', Validators.required],
    //   newSummary: ['', Validators.required],
    //   newDate: ['', Validators.required],
    //   newCollection: ['', Validators.required]
    // });
    
    if(!!this.auth.username) {
      this.username = this.auth.username;
    } else {
      this.userService.getUser().subscribe(user => this.username = user.username, err => console.log(err.message));
    }

    this.userService.getUser().subscribe()

    this.organizationService
      .listFromUser(this.username)
      .subscribe(organizations => this.organizations = organizations, err => console.log(err.message));

  }

}
