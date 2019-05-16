import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PropositionComponent } from './proposition/proposition.component';

@NgModule({
    declarations: [ 
      PropositionComponent 
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