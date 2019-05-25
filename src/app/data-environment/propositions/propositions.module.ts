import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PropositionComponent } from './proposition/proposition.component';
import { PropositionListComponent } from './proposition-list/proposition-list.component';

@NgModule({
    declarations: [ 
      PropositionComponent, PropositionListComponent 
    ],
    imports: [
      HttpClientModule,
      CommonModule
    ],
    exports: [
        PropositionComponent
    ]
  })
export class PropositionsModule{

}