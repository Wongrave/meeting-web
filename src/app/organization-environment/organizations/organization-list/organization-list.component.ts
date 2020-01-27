import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Organization } from '../organization/organization';
import { OrganizationService } from '../organization/organization.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
})
export class OrganizationListComponent implements OnInit {

  organizations: Organization[] = [];

  newDescription = "";
  newSummary = "";

  newOrganizationForm: FormGroup;

  username: string;
  userId: number;
  organizationId: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private location: Location,
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


  newOrganization(description: string, summary: string) {

    this.organizationService
      .newOrganization(description, summary, true);


    this.organizationService
      .newOrganization(description, summary, true, );


      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
    })


  }

  ngOnInit() {

    // this.newOrganizationForm = this.formBuilder.group({
    //   newDescription: ['', Validators.required],
    //   newSummary: ['', Validators.required],
    //   newDate: ['', Validators.required],
    //   newCollection: ['', Validators.required]
    // });

    if(!!this.auth.username) {
      this.userId = this.userService.getUserId();
    } else {
      this.userService.getUser().subscribe(user => this.userId = user.sub, err => console.log(err.message));
    }

    this.organizationService
      .listFromUser(this.userId)
      .subscribe(organizations => this.organizations = organizations, err => console.log(err.message));

  }

}
