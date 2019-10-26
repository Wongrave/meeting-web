import * as tslib_1 from "tslib";
import { NgModule } from "@angular/core";
import { UserComponent } from './user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
var UsersModule = /** @class */ (function () {
    function UsersModule() {
    }
    UsersModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                UserComponent
            ],
            imports: [
                HttpClientModule,
                CommonModule
            ],
            exports: [
                UserComponent
            ]
        })
    ], UsersModule);
    return UsersModule;
}());
export { UsersModule };
//# sourceMappingURL=users.module.js.map