import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
var UserComponent = /** @class */ (function () {
    function UserComponent(route, router, http, auth) {
        this.route = route;
        this.router = router;
        this.http = http;
        this.auth = auth;
        this.users = [];
    }
    UserComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http
            .get("http://localhost:8080/users/" + this.auth.username)
            .subscribe(function (user) { return _this.user = user; }, function (err) { return console.log(err.message); });
    };
    UserComponent = tslib_1.__decorate([
        Component({
            selector: "pd-user",
            templateUrl: "user.component.html"
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute,
            Router,
            HttpClient,
            AuthService])
    ], UserComponent);
    return UserComponent;
}());
export { UserComponent };
//# sourceMappingURL=user.component.js.map