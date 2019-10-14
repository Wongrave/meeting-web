import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'pd-expert-value',
    templateUrl: 'value.component.html',
    styleUrls: ['value.component.css']
})
export class ValueComponent{

    selectedValue = 0;


    @Input()
    get valor() {
        return this.selectedValue;
    }
  
    @Output() valueChange = new EventEmitter();
    set valor(val) {
        this.selectedValue = val;
        this.valueChange.emit(this.selectedValue);
    }
    
    

}