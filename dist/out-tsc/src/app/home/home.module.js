import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { SigninComponent } from './signin/signin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
var HomeModule = /** @class */ (function () {
    function HomeModule() {
    }
    HomeModule = tslib_1.__decorate([
        NgModule({
            declarations: [SigninComponent, HomeComponent],
            imports: [CommonModule, ReactiveFormsModule]
        })
    ], HomeModule);
    return HomeModule;
}());
export { HomeModule };
//# sourceMappingURL=home.module.js.map