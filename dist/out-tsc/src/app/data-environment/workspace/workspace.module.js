import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
var WorkspaceModule = /** @class */ (function () {
    function WorkspaceModule() {
    }
    WorkspaceModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                WorkspaceComponent
            ],
            imports: [
                HttpClientModule,
                CommonModule,
                FormsModule,
                ReactiveFormsModule
            ],
            exports: [
                WorkspaceComponent
            ]
        })
    ], WorkspaceModule);
    return WorkspaceModule;
}());
export { WorkspaceModule };
//# sourceMappingURL=workspace.module.js.map