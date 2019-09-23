export interface Proposition {

    id:number;
	userId:number;
	organizationId:number;
	description:string;
	analysisDescription:string;
	analysisConfidence:number;
	analysisContradiction:number;
	summary:string;
	date:Date;
	collection:string;
}