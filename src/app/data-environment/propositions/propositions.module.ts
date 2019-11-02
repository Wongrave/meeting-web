import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PropositionComponent } from './proposition/proposition.component';
import { PropositionListComponent } from './proposition-list/proposition-list.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
    declarations: [ 
      PropositionComponent, PropositionListComponent 
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      AngularFontAwesomeModule,
    ],
    exports: [
        PropositionComponent
    ]
  })
export class PropositionsModule{

}