import { Factor } from '../factor/factor';

export interface Section {
    id: number;
    tag : string;
    description : string;
    summary : string;
    selected : boolean;
}