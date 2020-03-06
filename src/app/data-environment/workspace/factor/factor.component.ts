import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FactorService } from './factor.service';
import { Factor } from './factor';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Proposition } from '../../propositions/proposition/proposition';
import { formatDate, Location } from '@angular/common';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { Section } from '../section/section';


@Component({
  styleUrls: ['./factor.component.css'],
  selector: 'pd-new-factor',
  templateUrl: './factor.component.html'
})
export class FactorComponent {
  closeResult: string;
  proposition: Proposition;
  newFactorTag = "";
  newFactorDescription = "";
  newFactorSummary = "";
  newFactorSelected = false;

  factors: Factor[] = []

  constructor(private modalService: NgbModal,
    private router: Router,
    private factorService: FactorService,
    private propositionService: PropositionService,
    private location: Location,
  ) {}

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
      return  `with: ${reason}`;
    }
  }

   async newFactor(newFactorTag: string, newFactorDescription: string, newFactorSummary: string, newFactorSelected: boolean) {

    await this.factorService
      .newFactor(newFactorTag, newFactorDescription, newFactorSummary, newFactorSelected, this.proposition);

    this.modalService.dismissAll();

    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }
   async deleteFactor(id: number) {

    await this.factorService
        .deleteFactor(id)


    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

  visible = false;
    toggle() {
      this.visible = !this.visible;
    }

  ngOnInit(): void {

    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.factorService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

  }

}
