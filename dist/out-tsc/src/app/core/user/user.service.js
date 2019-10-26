import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import { TokenService } from '../token/token.service';
import { BehaviorSubject } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
var UserService = /** @class */ (function () {
    function UserService(tokenService) {
        this.tokenService = tokenService;
        this.userSubject = new BehaviorSubject(null);
        this.tokenService.hasToken() && this.decodeAndNotify();
    }
    UserService.prototype.setToken = function (token) {
        this.tokenService.setToken(token);
        this.decodeAndNotify();
    };
    UserService.prototype.decodeAndNotify = function () {
        var token = this.tokenService.getToken();
        var user = jwt_decode(token);
        this.username = user.username;
        this.userId = user.sub;
        this.userSubject.next(user);
    };
    UserService.prototype.getUser = function () {
        return this.userSubject.asObservable();
    };
    UserService.prototype.getUsername = function () {
        return this.username;
        // if(this.tokenService.hasToken()){
        //     this.getUser().subscribe(
        //         user => this.username = user.username, err => console.log(err.message)
        //     );
        //     return this.username;
        // }
        // return ""
    };
    UserService.prototype.getUserId = function () {
        return this.userId;
    };
    UserService.prototype.disconnect = function () {
        this.tokenService.removeToken();
        this.userSubject.next(null);
    };
    UserService.prototype.isLogged = function () {
        return this.tokenService.hasToken();
    };
    UserService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [TokenService])
    ], UserService);
    return UserService;
}());
export { UserService };
//# sourceMappingURL=user.service.js.map