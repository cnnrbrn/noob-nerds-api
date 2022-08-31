import { isParseError, createErrorMessage } from "../errorHelpers";
import { MessageTypes } from "../../enums/enums";
import Responses from "../../constants/responses";

describe("error helpers", () => {
	describe("isParseError", () => {
		it("should return false if argument is not a parse error", () => {
			const error = {};
			expect(isParseError(error)).toBe(false);
		});

		it("should return true if argument is a parse error", () => {
			const error = { message: "" };
			expect(isParseError(error)).toBe(true);
		});
	});

	describe("createErrorMessage", () => {
		it("should return an error object if passed an error that is a ParseError", () => {
			const error = { message: "The error" };
			const returnValue = { type: MessageTypes.Error, message: `${Responses.invalidCode}: ${error.message}` };
			expect(createErrorMessage(error)).toEqual(returnValue);
		});

		it("should return an error object if passed an error that is not a ParseError", () => {
			const error = "The error";
			const returnValue = { type: MessageTypes.Error, message: `${Responses.invalidCode}: ${error}` };
			expect(createErrorMessage(error)).toEqual(returnValue);
		});
	});
});
