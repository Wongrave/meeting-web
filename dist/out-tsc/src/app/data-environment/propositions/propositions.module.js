import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropositionComponent } from './proposition/proposition.component';
import { PropositionListComponent } from './proposition-list/proposition-list.component';
var PropositionsModule = /** @class */ (function () {
    function PropositionsModule() {
    }
    PropositionsModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                PropositionComponent, PropositionListComponent
            ],
            imports: [
                HttpClientModule,
                CommonModule,
                FormsModule,
                ReactiveFormsModule
            ],
            exports: [
                PropositionComponent
            ]
        })
    ], PropositionsModule);
    return PropositionsModule;
}());
export { PropositionsModule };
//# sourceMappingURL=propositions.module.js.map