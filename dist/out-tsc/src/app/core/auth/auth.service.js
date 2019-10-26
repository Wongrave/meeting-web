import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserService } from '../user/user.service';
var API_URL = 'http://localhost:8080';
var AuthService = /** @class */ (function () {
    function AuthService(http, userService) {
        this.http = http;
        this.userService = userService;
    }
    AuthService.prototype.authenticate = function (username, password) {
        var _this = this;
        this.username = username;
        return this.http
            .post(API_URL + '/auth', { username: username, password: password }, { observe: 'body',
            responseType: 'text' })
            .pipe(
        // map((response) => ({
        //   data: response.body, 
        //   status: response.status})
        // tap(res => {
        // const authToken = res.headers.get('x-access-token');
        // console.log(authToken)
        //}
        map(function (res) {
            var authToken = res;
            _this.userService.setToken(authToken);
            console.log(authToken.toString());
        }));
    };
    AuthService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [HttpClient,
            UserService])
    ], AuthService);
    return AuthService;
}());
export { AuthService };
//# sourceMappingURL=auth.service.js.map