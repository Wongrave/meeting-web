import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpertComponent } from './expert.component';
import { ValueComponent } from './value/value.component';
var ExpertModule = /** @class */ (function () {
    function ExpertModule() {
    }
    ExpertModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                ExpertComponent,
                ValueComponent
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule
            ],
            exports: [
                ExpertComponent
            ]
        })
    ], ExpertModule);
    return ExpertModule;
}());
export { ExpertModule };
//# sourceMappingURL=expert.module.js.map