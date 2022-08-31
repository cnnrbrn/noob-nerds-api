import Responses from "../constants/responses";
import { ParseError } from "../models/ProgramResponse";
import { MessageTypes } from "../enums/enums";

interface CodeErrorMessage {
	type: MessageTypes;
	message: string;
}

export function isParseError(error: any): error is ParseError {
	return error.message !== undefined;
}

export function createErrorMessage(error: any): CodeErrorMessage {
	let errorMessage: string;

	if (isParseError(error)) {
		errorMessage = error.message;
	} else {
		errorMessage = error.toString();
	}

	return {
		type: MessageTypes.Error,
		message: `${Responses.invalidCode}: ${errorMessage}`
	};
}
