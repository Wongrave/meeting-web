import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NavbarComponent } from './navbar/navbar.component';
import { UsersModule } from './users/users.module';
import { PropositionsModule } from './data-environment/propositions/propositions.module';
import { PropositionFormComponent } from './data-environment/propositions/proposition-form/proposition-form.component';
import { AppRoutingModule } from './app.routing.module';
import { HomeModule } from './home/home.module';
import { ResultsModule } from './analysis-environment/results/results.module';
import { OrganizationsModule } from './organization-environment/organizations/organizations.module';
import { WorkspaceModule } from './data-environment/workspace/workspace.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ExpertModule } from './expert-environment/expert.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RefreshComponent } from './refresh/refresh.component';
import { ManagementModule } from './organization-environment/management/management.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RefreshComponent,
    PropositionFormComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    UsersModule,
    PropositionsModule,
    OrganizationsModule,
    ManagementModule,
    WorkspaceModule,
    ResultsModule,
    ExpertModule,
    HomeModule,
    AngularFontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
