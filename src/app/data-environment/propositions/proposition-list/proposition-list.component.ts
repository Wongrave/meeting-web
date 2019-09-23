import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Proposition } from '../proposition/proposition';
import { PropositionService } from '../proposition/proposition.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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


  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private propositionService: PropositionService,
    private formBuilder: FormBuilder){ }



  newProposition() {
    
    this.propositionService
      .newProposition(1, 1, this.newDescription, this.newSummary, this.newDate, this.newCollection);

  }

  ngOnInit() {

    this.newPropositionForm = this.formBuilder.group({
      newDescription: ['', Validators.required],
      newSummary: ['', Validators.required],
      newDate: ['', Validators.required],
      newCollection: ['', Validators.required]
    });

    this.propositionService
      .listFromUser(this.auth.userName)
      .subscribe(propositions => this.propositions = propositions, err => console.log(err.message));

  }

}
