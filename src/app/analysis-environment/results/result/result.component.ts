import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';

declare var p5: any;

@Component({
    selector: 'pd-resultado',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.css'],
    
})
export class ResultComponent implements OnInit { 

    private p5;
    


    constructor() {
        window.onresize = this.onWindowResize;
      }

      private onWindowResize = (e) => {
        this.p5.resizeCanvas(this.p5.windowWidth, this.p5.windowHeight);
      }

    ngOnInit() {
        this.createCanvas();
    }

    private createCanvas() {
        this.p5 = new p5(this.sketch);
      }
      
      private sketch(p: any) {
        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight-(p.windowHeight/8)).parent('results');
            p.angleMode(p.DEGREES);
        };
        let gcer = 83;

        let counter = -100;
        p.draw = () => {
          p.background(220);
          let aux;
          let aux2 = 0;
            if(p.windowWidth<p.windowHeight){
               aux  = p.windowWidth/2;
               aux2 = (p.windowHeight/16)
               
            } else {
                aux  = p.windowHeight/2;
                aux2 = (p.windowHeight/8)
            }

            if(counter<gcer){
                let add = p.map(counter, -100, gcer, 4, 0.1);
                counter += add;
            }




            p.fill(0, 110, 110);
            p.noStroke();
            p.ellipse(p.windowWidth/2, p.windowHeight/2-(aux/4), aux-20, aux-20);

            let value = p.map(counter, -100, 100, -90, 269);

            let color = p.map(counter, -50, 100, 0, 120);

            //200, 80, 100
            //80, 200, 140

            p.strokeWeight(4);
            p.fill(200, 100, 80);
            p.stroke(200, 100, 80);
            if(counter>-50){
                p.fill(200-color,100+color/3,80+color);
                p.stroke(200-color,100+color/3,80+color);
            }
            p.arc(p.windowWidth/2, p.windowHeight/2-(aux/4), aux, aux, -90, value, p.PIE);

            p.radius = aux-(aux/3);

            let sizeOfText = p.round(p.map(counter, -100, gcer, 30, 70));


            p.fill(200-color,100+color/3,80+color);
            p.noStroke();
            p.textFont("Georgia");
            p.textSize(sizeOfText);
            p.text(p.round(counter), ((p.windowWidth/2) + p.radius * p.cos(value))-25, (p.windowHeight/2-aux2) + p.radius * p.sin(value));
        };
      }
}