import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { stringify } from '@angular/core/src/render3/util';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { Proposition } from '../data-environment/propositions/proposition/proposition';
import { Factor } from '../data-environment/workspace/factor/factor';
import { ExpertService } from './expert.service';

@Component({
  selector: 'pd-evidences',
  templateUrl: './expert.component.html',
  styleUrls: ['./expert.component.css']
})
export class ExpertComponent implements OnInit {

    username: string;
    proposition: Proposition;
    factors: Factor[] = []
    gce = Math.round(Math.random() * 100);
    gin = Math.round(Math.random() * 100);


  constructor(private route: ActivatedRoute,
    private router: Router,
    private expertService: ExpertService,
    private auth: AuthService,
    private propositionService: PropositionService,
    private userService: UserService ){ }


  

  

  ngOnInit() {

    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.expertService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

   





  }

}
