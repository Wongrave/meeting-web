import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
var ResultComponent = /** @class */ (function () {
    function ResultComponent() {
        var _this = this;
        this.onWindowResize = function (e) {
            _this.p5.resizeCanvas(_this.p5.windowWidth, _this.p5.windowHeight);
        };
        window.onresize = this.onWindowResize;
    }
    ResultComponent.prototype.ngOnInit = function () {
        this.createCanvas();
    };
    ResultComponent.prototype.createCanvas = function () {
        this.p5 = new p5(this.sketch);
    };
    ResultComponent.prototype.sketch = function (p) {
        p.setup = function () {
            p.createCanvas(p.windowWidth, p.windowHeight - (p.windowHeight / 8)).parent('results');
            p.angleMode(p.DEGREES);
        };
        var gcer = 83;
        var counter = -100;
        p.draw = function () {
            p.background(220);
            var aux;
            var aux2 = 0;
            if (p.windowWidth < p.windowHeight) {
                aux = p.windowWidth / 2;
                aux2 = (p.windowHeight / 16);
            }
            else {
                aux = p.windowHeight / 2;
                aux2 = (p.windowHeight / 8);
            }
            if (counter < gcer) {
                var add = p.map(counter, -100, gcer, 4, 0.1);
                counter += add;
            }
            p.fill(0, 110, 110);
            p.noStroke();
            p.ellipse(p.windowWidth / 2, aux - (aux / 4), aux - 20, aux - 20);
            var value = p.map(counter, -100, 100, -90, 269);
            var color = p.map(counter, -50, 100, 0, 120);
            //200, 80, 100
            //80, 200, 140
            p.strokeWeight(4);
            p.fill(200, 100, 80);
            p.stroke(200, 100, 80);
            if (counter > -50) {
                p.fill(200 - color, 100 + color / 3, 80 + color);
                p.stroke(200 - color, 100 + color / 3, 80 + color);
            }
            p.arc(p.windowWidth / 2, aux - (aux / 4), aux, aux, -90, value, p.PIE);
            p.radius = aux - (aux / 3);
            var sizeOfText = p.round(p.map(counter, -100, gcer, 30, 70));
            p.fill(200 - color, 100 + color / 3, 80 + color);
            p.noStroke();
            p.textFont("Georgia");
            p.textSize(sizeOfText);
            // if(p.windowWidth<p.windowHeight){
            p.text(p.round(counter), ((p.windowWidth / 2) + p.radius * p.cos(value)) - 25, aux - aux2 + p.radius * p.sin(value));
            //  } else {
            //     p.text(p.round(counter), ((p.windowWidth/2) + p.radius * p.cos(value))-25, (p.windowHeight/2-aux2) + p.radius * p.sin(value));
            //  }
        };
    };
    ResultComponent = tslib_1.__decorate([
        Component({
            selector: 'pd-resultado',
            templateUrl: './result.component.html',
            styleUrls: ['./result.component.css'],
        }),
        tslib_1.__metadata("design:paramtypes", [])
    ], ResultComponent);
    return ResultComponent;
}());
export { ResultComponent };
//# sourceMappingURL=result.component.js.map