import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { stringify } from '@angular/core/src/render3/util';
import { Proposition } from '../propositions/proposition/proposition';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { Factor } from './factor/factor';
import { WorkspaceService } from './workspace.service';

@Component({
  styleUrls: ['./workspace.component.css'],
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

  proposition: Proposition;
  username: string;
  factors: Factor[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private propositionService: PropositionService,
    private workspaceService: WorkspaceService ){ }



  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.workspaceService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )



  }

}
