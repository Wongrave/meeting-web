import * as tslib_1 from "tslib";
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
import { ExpertModule } from './expert-environment/expert.module';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                AppComponent,
                NavbarComponent,
                PropositionFormComponent
            ],
            imports: [
                AppRoutingModule,
                BrowserModule,
                UsersModule,
                PropositionsModule,
                OrganizationsModule,
                WorkspaceModule,
                ResultsModule,
                ExpertModule,
                HomeModule
            ],
            providers: [],
            bootstrap: [AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map