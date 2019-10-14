import { Proposition } from '../../propositions/proposition/proposition';
import { Section } from '../section/section';

export interface Factor {
    id : number;
    tag : string;
    description : string;
    summary : string;
    selected : boolean;
    proposition : Proposition;
    sections : Section[];
}