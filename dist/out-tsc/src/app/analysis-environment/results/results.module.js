import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ResultComponent } from './result/result.component';
var ResultsModule = /** @class */ (function () {
    function ResultsModule() {
    }
    ResultsModule = tslib_1.__decorate([
        NgModule({
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
    ], ResultsModule);
    return ResultsModule;
}());
export { ResultsModule };
//# sourceMappingURL=results.module.js.map