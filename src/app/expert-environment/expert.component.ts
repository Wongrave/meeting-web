import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/user/user.service';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { Proposition } from '../data-environment/propositions/proposition/proposition';
import { Factor } from '../data-environment/workspace/factor/factor';
import { ExpertService } from './expert.service';
import { Evidence } from './evidences/evidence';

@Component({
  selector: 'pd-evidences',
  templateUrl: './expert.component.html',
  styleUrls: ['./expert.component.css']
})
export class ExpertComponent implements OnInit {

    username: string;
    proposition: Proposition;
    factors: Factor[] = []
    evidences: Evidence[] = []
    currentEvidences: Evidence[] = [] 
    gce = Math.round(Math.random() * 100);
    gin = Math.round(Math.random() * 100);


  constructor(private route: ActivatedRoute,
    private router: Router,
    private expertService: ExpertService,
    private auth: AuthService,
    private propositionService: PropositionService,
    private userService: UserService ){ }

  async ngOnInit() {

    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.expertService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

    
    await this.expertService.getFromProposition(this.proposition.id).toPromise().then(
      evidences => this.evidences = evidences
    )

    this.gce = this.evidences[0].favorable
    this.gin = this.evidences[0].desfavorable


  }

  newEvidence() {

  }

  favorableFromFactor(factor: number) {
    this.currentEvidences = this.evidences.filter(evidence => evidence.factor.id == factor)
    return this.currentEvidences[0].favorable
  }

  unfavorableFromFactor(factor: number) {
    this.currentEvidences = this.evidences.filter(evidence => evidence.factor.id == factor)
    return this.currentEvidences[0].desfavorable
  }
}

