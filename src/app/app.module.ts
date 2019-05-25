import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NavbarComponent } from './navbar/navbar.component';
import { UsersModule } from './users/users.module';
import { PropositionsModule } from './data-environment/propositions/propositions.module';
import { PropositionFormComponent } from './data-environment/propositions/proposition-form/proposition-form.component';
import { AppRoutingModule } from './app.routing.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PropositionFormComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    UsersModule,
    PropositionsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
