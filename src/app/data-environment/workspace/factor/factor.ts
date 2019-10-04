import { Proposition } from '../../propositions/proposition/proposition';

export interface Factor {
    id : number;
    tag : string;
    description : string;
    summary : string;
    selected : boolean;
    proposition : Proposition;
    sections : []
}