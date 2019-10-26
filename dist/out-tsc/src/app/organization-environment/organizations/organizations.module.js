import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationComponent } from './organization/organization.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
var OrganizationsModule = /** @class */ (function () {
    function OrganizationsModule() {
    }
    OrganizationsModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                OrganizationComponent, OrganizationListComponent
            ],
            imports: [
                HttpClientModule,
                CommonModule,
                FormsModule,
                ReactiveFormsModule
            ],
            exports: [
                OrganizationComponent
            ]
        })
    ], OrganizationsModule);
    return OrganizationsModule;
}());
export { OrganizationsModule };
//# sourceMappingURL=organizations.module.js.map