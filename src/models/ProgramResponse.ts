import { AST } from "@typescript-eslint/typescript-estree";
import { MessageTypes, ElementTypes } from "../enums/enums";

export type ObjectProgramResponse = {
	res: ProgramResponse;
	program: AST<any>;
	declaration: any;
};

export type LoopProgramResponse = {
	res: ProgramResponse;
	program: AST<any>;
};

interface Messages {
	type: MessageTypes;
	message: string;
}

export interface ParseError {
	message: string;
}

export default class ProgramResponse {
	missingElements: Array<ElementTypes>;
	messages: Array<Messages>;

	constructor(elements: Array<ElementTypes> = []) {
		this.missingElements = elements;
		this.messages = [];
	}
}
