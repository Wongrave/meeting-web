import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { PropositionService } from '../proposition/proposition.service';
import { FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
var PropositionListComponent = /** @class */ (function () {
    function PropositionListComponent(route, router, http, auth, propositionService, formBuilder, userService) {
        this.route = route;
        this.router = router;
        this.http = http;
        this.auth = auth;
        this.propositionService = propositionService;
        this.formBuilder = formBuilder;
        this.userService = userService;
        this.propositions = [];
        this.newDescription = "";
        this.newSummary = "";
        this.newDate = new Date;
        this.newCollection = "";
    }
    PropositionListComponent.prototype.selectProposition = function (id) {
        var _this = this;
        this.propositionService.selectProposition(id)
            .subscribe(function () { return _this.router.navigate(['home']); }, function (err) {
            console.log('erro na escolha');
        });
        console.log(id);
    };
    PropositionListComponent.prototype.newProposition = function () {
        this.propositionService
            .newProposition(this.newDescription, this.newSummary, this.newDate, this.newCollection);
    };
    PropositionListComponent.prototype.ngOnInit = function () {
        // this.newPropositionForm = this.formBuilder.group({
        //   newDescription: ['', Validators.required],
        //   newSummary: ['', Validators.required],
        //   newDate: ['', Validators.required],
        //   newCollection: ['', Validators.required]
        // });
        var _this = this;
        this.username = this.userService.getUsername();
        this.userId = this.userService.getUserId();
        console.log(this.username);
        this.propositionService
            .listFromUser(this.userId)
            .subscribe(function (propositions) { return _this.propositions = propositions; }, function (err) { return console.log(err.message); });
        // let proposition: Proposition;
    };
    PropositionListComponent = tslib_1.__decorate([
        Component({
            selector: 'app-proposition-list',
            templateUrl: './proposition-list.component.html',
            styleUrls: ['./proposition-list.component.css']
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute,
            Router,
            HttpClient,
            AuthService,
            PropositionService,
            FormBuilder,
            UserService])
    ], PropositionListComponent);
    return PropositionListComponent;
}());
export { PropositionListComponent };
//# sourceMappingURL=proposition-list.component.js.map