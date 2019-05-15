import { NgModule } from "@angular/core";
import { UserComponent } from './user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [ 
      UserComponent 
    ],
    imports: [
      HttpClientModule,
      CommonModule
    ],
    exports: [
      UserComponent
    ]
  })
export class UsersModule{

}