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

    selectedValue = 0;


    @Input()
    get valor() {
        return this.selectedValue;
    }
  
    @Output() valueChange = new EventEmitter();
    set valor(val) {
        this.selectedValue = val;
        this.valueChange.emit(this.selectedValue);
      }
      
      username: string;
      proposition: Proposition;
      factors: Factor[] = [];
      evidences: Array<Evidence> = [];
      weight = 0;
      currentEvidences: Evidence[] = [];
      gce = Math.round(Math.random() * 100);
      gin = Math.round(Math.random() * 100);
      userId: number;
      
      
      constructor(private route: ActivatedRoute,
        private router: Router,
        private expertService: ExpertService,
        private auth: AuthService,
        private propositionService: PropositionService,
        private userService: UserService ){ }
        
        saveWeight(evidence: Evidence, w: number) {
          evidence.weight = w;
        }
        
        newEvidence() {
        
        }

        async saveEvidences() {
          console.log(this.evidences)
            await this.evidences.forEach(evidence => this.expertService.saveEvidence(evidence))
          }

          

  async ngOnInit() {

    this.username = this.userService.getUsername();
    if(!!this.auth.username) {
      this.userId = this.userService.getUserId();
    } else {
      this.userService.getUser().subscribe(user => this.userId = user.sub, err => console.log(err.message));
    }

    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.expertService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

    
    await this.expertService.getFromProposition(this.proposition.id, this.userId).toPromise().then(
      evidences => this.evidences = evidences
    )

//  this.gce = this.evidences[0].favorable
//  this.gin = this.evidences[0].desfavorable


  }


  // favorableFromFactor(factor: number) {
  //   this.currentEvidences = this.evidences.filter(evidence => evidence.factor.id == factor)
  //   return this.currentEvidences[0].favorable
  // }

  // unfavorableFromFactor(factor: number) {
  //   this.currentEvidences = this.evidences.filter(evidence => evidence.factor.id == factor)
  //   return this.currentEvidences[0].desfavorable
  // }
}

