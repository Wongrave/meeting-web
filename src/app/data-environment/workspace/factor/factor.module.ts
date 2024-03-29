import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FactorComponent } from './factor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SectionModule } from '../section/section.module';

@NgModule({
    declarations: [ 
      FactorComponent 
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      AngularFontAwesomeModule,
      NgbModule,
      SectionModule,
    ],
    exports: [
        FactorComponent
    ]
  })
export class FactorModule{

}
