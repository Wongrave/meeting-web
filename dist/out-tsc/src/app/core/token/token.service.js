import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
var KEY = 'authToken';
var TokenService = /** @class */ (function () {
    function TokenService() {
    }
    TokenService.prototype.hasToken = function () {
        return !!this.getToken();
    };
    TokenService.prototype.setToken = function (token) {
        window.localStorage.setItem(KEY, token.toString());
    };
    TokenService.prototype.getToken = function () {
        return window.localStorage.getItem(KEY);
    };
    TokenService.prototype.removeToken = function () {
        window.localStorage.removeItem(KEY);
    };
    TokenService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' })
    ], TokenService);
    return TokenService;
}());
export { TokenService };
//# sourceMappingURL=token.service.js.map