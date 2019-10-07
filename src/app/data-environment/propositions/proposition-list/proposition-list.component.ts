import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Proposition } from '../proposition/proposition';
import { PropositionService } from '../proposition/proposition.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { stringify } from '@angular/core/src/render3/util';

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

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private propositionService: PropositionService,
    private formBuilder: FormBuilder,
    private userService: UserService ){ }


  selectProposition(id: number){

    this.propositionService.selectProposition(id)
      .subscribe(
        () => this.router.navigate(['home']),

        err => {
            console.log('erro na escolha')
            
        }

      )
    console.log(id);

  }


  newProposition() {
    
    this.propositionService
      .newProposition(this.newDescription, this.newSummary, this.newDate, this.newCollection);

  }

  ngOnInit() {

    // this.newPropositionForm = this.formBuilder.group({
    //   newDescription: ['', Validators.required],
    //   newSummary: ['', Validators.required],
    //   newDate: ['', Validators.required],
    //   newCollection: ['', Validators.required]
    // });
    

    this.username = this.userService.getUsername();
    

    console.log(this.username)

    this.propositionService
      .listFromUser(this.username)
      .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));

    // let proposition: Proposition;
    

  }

}
