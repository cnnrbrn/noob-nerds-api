import { Injectable } from "@nestjs/common";
import { parse, AST_NODE_TYPES, AST } from "@typescript-eslint/typescript-estree";
import { traverse } from "eslint/lib/shared/traverser";
import ProgramResponse, { LoopProgramResponse } from "../models/ProgramResponse";
import Responses from "../constants/responses";
import { CONST, options } from "../constants/misc";
import { createErrorMessage } from "../helpers/errorHelpers";
import { ElementTypes, MessageTypes } from "../enums/enums";

@Injectable()
export default class ForLoopsService {
	private baseChecks(code: string, arrayName: string, startAtBeginning = true): ProgramResponse | LoopProgramResponse {
		const res: ProgramResponse = new ProgramResponse([ElementTypes.ForLoop]);

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
						case AST_NODE_TYPES.ForStatement:
							res.missingElements.splice(res.missingElements.indexOf(ElementTypes.ForLoop), 1);

							if (node.init.type !== AST_NODE_TYPES.VariableDeclaration || !node.init.declarations[0].init) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The first part of the for loop should be a variable declaration, e.g: let i = 0;`
								});
								break;
							}

							const initialiserVariableName = node.init.declarations[0].id.name;

							if (node.init.kind === CONST) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The variable declaration in the initial expression must not use const, but let or var: let i = 0;`
								});
								break;
							}

							console.log("node.init.declarations[0].init:" + node.init.declarations[0].init.value);

							if (isNaN(node.init.declarations[0].init.value)) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The variable in the initial expression must be initialised with a number value: let i = 0;"
								});

								break;
							}

							if (startAtBeginning) {
								if (node.init.declarations[0].init.value !== 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: "The variable in the initial expression must be initialised with 0: let i = 0;"
									});

									break;
								}
							}

							if (initialiserVariableName != "i") {
								res.messages.push({
									type: MessageTypes.Warning,
									message: 'The variable used in the for loop is conventionally named "i": let i = 0;'
								});
							}

							if (
								node.test.type !== AST_NODE_TYPES.BinaryExpression ||
								node.test.operator != "<" ||
								node.test.right.type !== AST_NODE_TYPES.MemberExpression ||
								node.test.right.object.name !== arrayName ||
								node.test.right.property.name !== "length"
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The condition expression (the second section) in the for loop should be: i < ${arrayName}.length;`
								});

								break;
							}

							if (startAtBeginning) {
								if (node.update.type !== AST_NODE_TYPES.UpdateExpression || node.update.operator !== "++") {
									res.messages.push({
										type: MessageTypes.Error,
										message: "Use the increment operator ++ to increment the value of the variable: i++"
									});
									// this.skip()
									break;
								}
							}

							if (initialiserVariableName !== node.test.left.name || initialiserVariableName !== node.update.argument.name) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The variable name in the first, second and third part of the for loop must be the same: let i = 0; i < ${arrayName}.length; i++`
								});

								break;
							}

							if (node.body.body.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "There are no statements inside the loop"
								});

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

	dotNotation1(code: string): ProgramResponse {
		const arrayName = "books";
		const variableName = "bookTitle";
		const propertyName = "title";

		const response = this.baseChecks(code, arrayName);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const { res, program } = response;
		try {
			traverse(program, {
				enter(node: any) {
					switch (node.type) {
						case AST_NODE_TYPES.ForStatement:
							const loopVariableName = node.init.declarations[0].id.name;

							if (node.body.body.length === 1) {
								if (node.body.body[0].type !== AST_NODE_TYPES.VariableDeclaration) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `Retrieve each ${propertyName} property and assign it to a variable called: ${variableName}`
									});
									break;
								}

								if (node.body.body[0].declarations[0].id.name !== variableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable inside the loop must be called: ${variableName}`
									});
									break;
								}

								if (
									node.body.body[0].declarations[0].init === null ||
									node.body.body[0].declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									node.body.body[0].declarations[0].init.object.type !== AST_NODE_TYPES.MemberExpression ||
									node.body.body[0].declarations[0].init.object.object.name !== arrayName ||
									node.body.body[0].declarations[0].init.property.name !== propertyName
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The ${propertyName} property of each item in the ${arrayName} array must be assigned to the ${variableName} variable: const ${variableName} = ${arrayName}[i].${propertyName};`
									});
									break;
								}

								if (node.body.body[0].declarations[0].init.object.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: books[${loopVariableName}].title`
									});
									break;
								}
							}

							if (node.body.body.length === 2) {
								if (
									node.body.body[0].type !== AST_NODE_TYPES.VariableDeclaration ||
									node.body.body[0].declarations[0].init === null ||
									node.body.body[0].declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									node.body.body[0].declarations[0].init.object.name !== arrayName ||
									node.body.body[0].declarations[0].init.computed === false
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The first statement inside the loop should assign each item in the ${arrayName} array to a variable: const book = ${arrayName}[i];`
									});
									break;
								}

								if (node.body.body[0].declarations[0].init.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}]`
									});
									break;
								}

								const firstVariable = node.body.body[0].declarations[0].id.name;

								if (
									node.body.body[1].type !== AST_NODE_TYPES.VariableDeclaration ||
									node.body.body[1].declarations[0].id.name !== variableName ||
									node.body.body[1].declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									node.body.body[1].declarations[0].init.object.name !== firstVariable ||
									node.body.body[1].declarations[0].init.property.name !== propertyName
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The second statement in the loop must assign the ${propertyName} property to a variable called ${variableName}: const ${variableName} = ${firstVariable}.${propertyName}`
									});
									break;
								}

								break;
							}

							if (node.body.body.length > 2) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "There should be a maximum of 2 statements inside the loop"
								});
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

		console.dir(res);
		return res;
	}

	continue1(code: string): ProgramResponse {
		const arrayName = "recipes";
		const variableName = "recipeName";
		const propertyToGet = "name";
		const propertyToCheck = "numberOfIngredients";

		const response = this.baseChecks(code, arrayName);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const { res, program } = response;
		try {
			traverse(program, {
				enter(node: any) {
					switch (node.type) {
						case AST_NODE_TYPES.ForStatement:
							if (node.body.body.length < 2) {
								res.messages.push({
									type: MessageTypes.Error,
									message:
										"Inside the for loop there should be an if statement and then a property assignment to a variable"
								});
								break;
							}

							const loopVariableName = node.init.declarations[0].id.name;
							const firstStatement = node.body.body[0];
							const secondStatement = node.body.body[1];

							if (firstStatement.type !== AST_NODE_TYPES.IfStatement) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The first statement inside the loop should be an if statement checking the value of the ${propertyToCheck} property`
								});
								break;
							}

							if (
								firstStatement.test.type !== AST_NODE_TYPES.BinaryExpression ||
								firstStatement.test.operator !== ">=" ||
								firstStatement.test.left.type !== AST_NODE_TYPES.MemberExpression ||
								firstStatement.test.left.computed ||
								firstStatement.test.left.object.object.name !== arrayName ||
								firstStatement.test.left.property.name !== propertyToCheck ||
								firstStatement.test.right.value !== 10
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The test in the if statement should be ${arrayName}[${loopVariableName}].${propertyToCheck} >= 10`
								});
								break;
							}

							if (firstStatement.test.left.object.property.name !== loopVariableName) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}].${propertyToCheck}`
								});
								break;
							}

							if (
								firstStatement.consequent.body.length === 0 ||
								firstStatement.consequent.body[0].type !== AST_NODE_TYPES.ContinueStatement
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The body of the if statement should be a continue statement"
								});
								break;
							}

							if (node.body.body.length === 2) {
								if (secondStatement.type !== AST_NODE_TYPES.VariableDeclaration) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `After the if statement, retrieve each ${propertyToGet} property and assign it to a variable called: ${variableName}`
									});
									break;
								}

								if (secondStatement.declarations[0].id.name !== variableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The property must be assigned to a variable called: ${variableName}`
									});
									break;
								}

								if (
									secondStatement.declarations[0].init === null ||
									secondStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.object.name !== arrayName ||
									secondStatement.declarations[0].init.property.name !== propertyToGet
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The ${propertyToGet} property of each item in the ${arrayName} array must be assigned to the ${variableName} variable: const ${variableName} = ${arrayName}[i].${propertyToGet};`
									});
									break;
								}

								if (secondStatement.declarations[0].init.object.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}].title`
									});
									break;
								}
							}

							if (node.body.body.length === 3) {
								const thirdStatement = node.body.body[2];

								const intermediateVariableName =
									secondStatement.declarations?.length > 0
										? secondStatement.declarations[0]?.id?.name ?? "recipe"
										: "recipe";
								if (
									secondStatement.type !== AST_NODE_TYPES.VariableDeclaration ||
									secondStatement.declarations[0].init === null ||
									secondStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.name !== arrayName ||
									secondStatement.declarations[0].init.computed === false
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The second statement inside the loop should assign each item in the ${arrayName} array to a variable: const ${intermediateVariableName} = ${arrayName}[i];`
									});
									break;
								}

								if (secondStatement.declarations[0].init.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}]`
									});
									break;
								}

								const firstVariable = secondStatement.declarations[0].id.name;

								if (
									thirdStatement.type !== AST_NODE_TYPES.VariableDeclaration ||
									thirdStatement.declarations[0].id.name !== variableName ||
									thirdStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									thirdStatement.declarations[0].init.object.name !== firstVariable ||
									thirdStatement.declarations[0].init.property.name !== propertyToGet
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The third statement in the loop must assign the ${propertyToGet} property to a variable called ${variableName}: const ${variableName} = ${firstVariable}.${propertyToGet}`
									});
									break;
								}

								break;
							}

							if (node.body.body.length > 3) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "There should be a maximum of 3 statements inside the loop"
								});
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

		console.dir(res);
		return res;
	}

	break1(code: string): ProgramResponse {
		const arrayName = "blogs";
		const variableName = "blogTitle";
		const propertyToGet = "title";

		const response = this.baseChecks(code, arrayName);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const { res, program } = response;
		try {
			traverse(program, {
				enter(node: any) {
					switch (node.type) {
						case AST_NODE_TYPES.ForStatement:
							if (node.body.body.length < 2) {
								res.messages.push({
									type: MessageTypes.Error,
									message:
										"Inside the for loop there should be an if statement and then a property assignment to a variable"
								});
								break;
							}

							const loopVariableName = node.init.declarations[0].id.name;
							const firstStatement = node.body.body[0];
							const secondStatement = node.body.body[1];

							if (firstStatement.type !== AST_NODE_TYPES.IfStatement) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The first statement inside the loop should be an if statement checking the value of the ${loopVariableName} variable`
								});
								break;
							}

							if (
								firstStatement.test.type !== AST_NODE_TYPES.BinaryExpression ||
								firstStatement.test.operator !== "===" ||
								// firstStatement.test.operator !== "===" ||
								firstStatement.test.left.type !== AST_NODE_TYPES.Identifier ||
								firstStatement.test.left.name !== loopVariableName ||
								// firstStatement.test.left.computed ||
								// firstStatement.test.left.object.object.name !== arrayName ||
								firstStatement.test.right.value !== 3
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The test in the if statement should be: ${loopVariableName} === 3`
								});
								break;
							}

							// if (firstStatement.test.left.object.property.name !== loopVariableName) {
							// 	res.messages.push({
							// 		type: MessageTypes.Error,
							// 		message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}].${propertyToCheck}`
							// 	})
							// 	break
							// }

							if (
								firstStatement.consequent.body.length === 0 ||
								firstStatement.consequent.body[0].type !== AST_NODE_TYPES.BreakStatement
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The body of the if statement should be a break statement"
								});
								break;
							}

							if (node.body.body.length === 2) {
								if (secondStatement.type !== AST_NODE_TYPES.VariableDeclaration) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `After the if statement, retrieve each ${propertyToGet} property and assign it to a variable called: ${variableName}`
									});
									break;
								}

								if (secondStatement.declarations[0].id.name !== variableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The property must be assigned to a variable called: ${variableName}`
									});
									break;
								}

								if (
									secondStatement.declarations[0].init === null ||
									secondStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.object.name !== arrayName ||
									secondStatement.declarations[0].init.property.name !== propertyToGet
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The ${propertyToGet} property of each item in the ${arrayName} array must be assigned to the ${variableName} variable: const ${variableName} = ${arrayName}[i].${propertyToGet};`
									});
									break;
								}

								if (secondStatement.declarations[0].init.object.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}].title`
									});
									break;
								}
							}

							if (node.body.body.length === 3) {
								const thirdStatement = node.body.body[2];
								const intermediateVariableName =
									secondStatement.declarations?.length > 0
										? secondStatement.declarations[0]?.id?.name ?? "recipe"
										: "recipe";

								if (
									secondStatement.type !== AST_NODE_TYPES.VariableDeclaration ||
									secondStatement.declarations[0].init === null ||
									secondStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									secondStatement.declarations[0].init.object.name !== arrayName ||
									secondStatement.declarations[0].init.computed === false
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The second statement inside the loop should assign each item in the ${arrayName} array to a variable: const ${intermediateVariableName} = ${arrayName}[i];`
									});
									break;
								}

								if (secondStatement.declarations[0].init.property.name !== loopVariableName) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable used as the array index must be the same as the loop variable: ${arrayName}[${loopVariableName}]`
									});
									break;
								}

								const firstVariable = secondStatement.declarations[0].id.name;

								if (
									thirdStatement.type !== AST_NODE_TYPES.VariableDeclaration ||
									thirdStatement.declarations[0].id.name !== variableName ||
									thirdStatement.declarations[0].init.type !== AST_NODE_TYPES.MemberExpression ||
									thirdStatement.declarations[0].init.object.name !== firstVariable ||
									thirdStatement.declarations[0].init.property.name !== propertyToGet
								) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The third statement in the loop must assign the ${propertyToGet} property to a variable called ${variableName}: const ${variableName} = ${firstVariable}.${propertyToGet}`
									});
									break;
								}

								break;
							}

							if (node.body.body.length > 3) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "There should be a maximum of 3 statements inside the loop"
								});
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

		console.dir(res);
		return res;
	}
}
