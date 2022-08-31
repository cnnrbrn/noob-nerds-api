import { Injectable } from "@nestjs/common";
import { parse, AST_NODE_TYPES, AST } from "@typescript-eslint/typescript-estree";
import { traverse } from "eslint/lib/shared/traverser";
import ProgramResponse, { LoopProgramResponse } from "../models/ProgramResponse";
import Responses from "../constants/responses";
import { FOR_EACH, options } from "../constants/misc";
import { createErrorMessage } from "../helpers/errorHelpers";
import { ElementTypes, MessageTypes } from "../enums/enums";

@Injectable()
export default class ForEachLoopsService {
	private baseChecks(
		code: string,
		arrayName: string,
		propertiesToDestruct: string[] = [],
		singleStatment = true
	): ProgramResponse | LoopProgramResponse {
		const res: ProgramResponse = new ProgramResponse([ElementTypes.ForEachLoop]);

		let program: AST<any>;

		try {
			program = parse(code, options);

			if (program.body.length > 1) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.onlyOneStatement
				});
				res.missingElements = [];
				return res;
			}

			traverse(program, {
				enter(node: any) {
					switch (node.type) {
						case AST_NODE_TYPES.ExpressionStatement:
							if (
								node.expression.type === AST_NODE_TYPES.CallExpression &&
								node.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
								node.expression.callee.property.name === FOR_EACH
							) {
								res.missingElements.splice(res.missingElements.indexOf(ElementTypes.ForEachLoop), 1);
							} else {
								break;
							}

							if (
								node.expression.arguments.length === 0 ||
								(node.expression.arguments[0].type !== AST_NODE_TYPES.FunctionExpression &&
									node.expression.arguments[0].type !== AST_NODE_TYPES.ArrowFunctionExpression)
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The forEach should take a function or arrow function as an argument"
								});
								break;
							}

							if (node.expression.callee.object.name !== arrayName) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `forEach should be called on the array variable called: ${arrayName}`
								});
								break;
							}

							if (node.expression.arguments[0].body.body.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The function has no statements`
								});
								break;
							}

							if (singleStatment) {
								if (node.expression.arguments[0].body.body.length > 1) {
									res.messages.push({
										type: MessageTypes.Error,
										message: "The function should have only one statement"
									});
									break;
								}
							}

							if (propertiesToDestruct.length > 0) {
								const argumentName = node.expression.arguments[0].params[0].name;
								const firstStatement = node.expression.arguments[0].body.body[0];

								if (
									firstStatement.type !== AST_NODE_TYPES.VariableDeclaration ||
									firstStatement.declarations[0].id.type !== AST_NODE_TYPES.ObjectPattern
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The first statement in the body of the function should a variable declaration that destructs 
                                            properties from the function argument: const { ${propertiesToDestruct} } = ${argumentName};`
									});
									break;
								}

								if (
									firstStatement.declarations[0].init.type !== AST_NODE_TYPES.Identifier ||
									firstStatement.declarations[0].init.name !== argumentName
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The value on the right side of the = should be the name of the parameter: ${argumentName}`
									});
									break;
								}

								const missingProperties = [...propertiesToDestruct];
								const unneededProperties = [];
								let hasAlias = false;

								firstStatement.declarations[0].id.properties.forEach((prop) => {
									if (!prop.shorthand) {
										hasAlias = true;
									}
									if (missingProperties.includes(prop.key.name)) {
										missingProperties.splice(missingProperties.indexOf(prop.key.name), 1);
									} else {
										unneededProperties.push(prop.key.name);
									}
								});

								if (missingProperties.length > 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The following propert${missingProperties.length === 1 ? "y" : "ies"} need${
											missingProperties.length === 1 ? "s" : ""
										} to be destructured: ${missingProperties}`
									});
								}

								if (unneededProperties.length > 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The following propert${
											unneededProperties.length === 1 ? "y" : "ies"
										} should not be destructured: ${unneededProperties}`
									});
								}

								if (hasAlias) {
									res.messages.push({
										type: MessageTypes.Error,
										message: "None of the properties should have aliases"
									});
								}

								break;
							}

							break;
					}
				}
			});
		} catch (error) {
			res.missingElements = [];

			const message = createErrorMessage(error);
			res.messages.push(message);
		}

		// are there messages of type error
		const errorMessages = res.messages.find((m) => m.type === MessageTypes.Error);

		if (res.missingElements.length === 0 && !errorMessages) {
			return { res, program };
		}

		console.dir(res);
		return res;
	}

	forEach1(code: string): ProgramResponse {
		const arrayName = "articles";
		const propertiesToDeconstruct = ["headline"];

		const response = this.baseChecks(code, arrayName, propertiesToDeconstruct);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const { res } = response;

		console.dir(res);
		return res;
	}

	forEach2(code: string): ProgramResponse {
		const arrayName = "phones";
		const propertiesToDeconstruct = ["brand", "model", "price"];

		const response = this.baseChecks(code, arrayName, propertiesToDeconstruct);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const { res } = response;

		console.dir(res);
		return res;
	}
}
