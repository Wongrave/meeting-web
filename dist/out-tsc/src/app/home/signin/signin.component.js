import * as tslib_1 from "tslib";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
var SigninComponent = /** @class */ (function () {
    function SigninComponent(formBuilder, authService, router) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
    }
    SigninComponent.prototype.ngOnInit = function () {
        this.loginForm = this.formBuilder.group({
            userName: ['', Validators.required],
            password: ['', Validators.required]
        });
    };
    SigninComponent.prototype.login = function () {
        var _this = this;
        var userName = this.loginForm.get('userName').value;
        var password = this.loginForm.get('password').value;
        this.authService
            .authenticate(userName, password)
            .subscribe(function () { return _this.router.navigate(['organizations/fromUser', userName]); }, function (err) {
            console.log('login invalido');
            _this.loginForm.reset();
            alert('invalid username or password');
            _this.userNameInput.nativeElement.focus();
        });
    };
    tslib_1.__decorate([
        ViewChild('userNameInput'),
        tslib_1.__metadata("design:type", ElementRef)
    ], SigninComponent.prototype, "userNameInput", void 0);
    SigninComponent = tslib_1.__decorate([
        Component({
            styleUrls: ['./signin.component.css'],
            templateUrl: './signin.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [FormBuilder,
            AuthService,
            Router])
    ], SigninComponent);
    return SigninComponent;
}());
export { SigninComponent };
//# sourceMappingURL=signin.component.js.map