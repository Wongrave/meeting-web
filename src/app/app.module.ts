import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NavbarComponent } from './navbar/navbar.component';
import { UsersModule } from './users/users.module';
import { PropositionsModule } from './data-environment/propositions/propositions.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    UsersModule,
    PropositionsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
