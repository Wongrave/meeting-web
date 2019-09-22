import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ResultComponent } from './result/result.component';

@NgModule({
    declarations: [ 
      ResultComponent
    ],
    imports: [
      HttpClientModule,
      CommonModule
    ],
    exports: [
        ResultComponent
    ]
  })
export class ResultsModule{

}