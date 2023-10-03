import { Injectable } from "@nestjs/common";
import { parse, TSESTree, AST_NODE_TYPES, AST } from "@typescript-eslint/typescript-estree";
import { traverse } from "eslint/lib/shared/traverser";
import { createErrorMessage } from "../helpers/errorHelpers";
import ProgramResponse, { ObjectProgramResponse } from "../models/ProgramResponse";
import Responses from "../constants/responses";
import { LOGICAL_EXPRESSION, options } from "../constants/misc";
import { ElementTypes, MessageTypes } from "../enums/enums";

import {
	BOOLEAN,
	ARRAY,
	OBJECT,
	FUNCTION,
	OBJECT_EXPRESSION,
	STRING,
	NUMBER,
	MEMBER_EXPRESSION,
	IDENTIFIER,
	LITERAL,
	OBJECT_EXPRESSION_WITH_LABEL,
	PROPERTY_OF_AN_OBJECT_WITH_LABEL,
	PROPERTY_OF_AN_OBJECT,
	CHAIN_EXPRESSION
} from "../constants/misc";

@Injectable()
export default class ObjectsService {
	private baseChecks(code: string, variableName: string, valueType?: string[]): ProgramResponse | ObjectProgramResponse {
		const res: ProgramResponse = new ProgramResponse([ElementTypes.Variable]);

		let program: AST<any>;
		let declaration: any;

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
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							declaration = node.declarations.find((declaration) => declaration.id);

							if (!declaration) {
								return res;
							}

							res.missingElements.splice(res.missingElements.indexOf(ElementTypes.Variable), 1);

							if (declaration.id.type === AST_NODE_TYPES.Identifier && declaration.id.name !== variableName) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The variable's name is incorrect. It should be: ${variableName}`
								});

								break;
							}

							if (!declaration.init) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The variable has no value"
								});

								break;
							}

							if (valueType) {
								if (declaration.init.type !== valueType[0]) {
									res.messages.push({
										type: MessageTypes.Error,
										message: `The variable's value must be ${valueType[1]}.`
									});

									break;
								}

								if (valueType[1] === PROPERTY_OF_AN_OBJECT && declaration.init.object.object) {
									res.messages.push({
										type: MessageTypes.Error,
										message: "The variable value be a property on an object, not a nested property"
									});

									break;
								}
							}
							break;
					}
				}
			});
		} catch (error) {
			const message = createErrorMessage(error);

			res.missingElements = [];

			res.messages.push(message);
		}

		if (res.missingElements.length === 0 && res.messages.length === 0) {
			return { res, program, declaration };
		}

		console.dir(res);
		return res;
	}

	emptyObject(code: string): ProgramResponse {
		const response = this.baseChecks(code, "emptyObject", OBJECT_EXPRESSION_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type === OBJECT_EXPRESSION) {
								if (init.properties.length !== 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: "The object should be empty"
									});
									break;
								}
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
		return res;
	}

	objectWithTwoStringProperties(code: string): ProgramResponse {
		const response = this.baseChecks(code, "movie", OBJECT_EXPRESSION_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type === OBJECT_EXPRESSION) {
								const propertyCount = init.properties.length;

								if (propertyCount !== 2) {
									res.messages.push({
										type: MessageTypes.Error,
										message: Responses.propertyCount(2, propertyCount)
									});
									break;
								}

								const requiredProperties = ["title", "description"];

								init.properties.forEach((property: any) => {
									if (requiredProperties.includes(property.key.name.toString())) {
										requiredProperties.splice(requiredProperties.indexOf(property.key.name.toString()), 1);
									}
								});

								if (requiredProperties.length !== 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: Responses.missingProperties(requiredProperties) //`The object is missing the following properties: ${requiredProperties}`,
									});
									break;
								}

								const incorrectValueTypes = [];

								init.properties.forEach((property: any) => {
									if (property.value.type !== AST_NODE_TYPES.Literal || typeof property.value.value !== STRING) {
										incorrectValueTypes.push(property.key.name);
									}
								});

								if (incorrectValueTypes.length !== 0) {
									const count = incorrectValueTypes.length;
									res.messages.push({
										type: MessageTypes.Error,
										message: `The property values must all be strings. Th${count === 1 ? "is" : "ese"} propert${
											count === 1 ? "y" : "ies"
										} do${count === 1 ? "esn't" : "n't"} have a string value: ${incorrectValueTypes}`
									});
									break;
								}
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
		return res;
	}

	objectWithThreeProperties(code: string): ProgramResponse {
		const response = this.baseChecks(code, "user", OBJECT_EXPRESSION_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type === OBJECT_EXPRESSION) {
								const propertyCount = init.properties.length;

								if (propertyCount !== 3) {
									res.messages.push({
										type: MessageTypes.Error,
										message: Responses.propertyCount(3, propertyCount)
									});
									break;
								}

								const requiredProperties = ["id", "name", "isActive"];

								init.properties.forEach((property: any) => {
									if (requiredProperties.includes(property.key.name.toString())) {
										requiredProperties.splice(requiredProperties.indexOf(property.key.name.toString()), 1);
									}
								});

								if (requiredProperties.length !== 0) {
									res.messages.push({
										type: MessageTypes.Error,
										message: Responses.missingProperties(requiredProperties)
									});
									break;
								}

								const incorrectValueTypes = [];

								init.properties.forEach((property: any) => {
									if (
										property.key.name === "id" &&
										(property.value.type !== AST_NODE_TYPES.Literal || typeof property.value.value !== NUMBER)
									) {
										incorrectValueTypes.push(Responses.incorrectValue("id", "number"));
									}

									if (
										property.key.name === "name" &&
										(property.value.type !== AST_NODE_TYPES.Literal || typeof property.value.value !== STRING)
									) {
										incorrectValueTypes.push(Responses.incorrectValue("name", "string"));
									}

									if (
										property.key.name === "isActive" &&
										(property.value.type !== AST_NODE_TYPES.Literal || typeof property.value.value !== BOOLEAN)
									) {
										incorrectValueTypes.push(Responses.incorrectValue("isActive", "boolean"));
									}
								});

								if (incorrectValueTypes.length !== 0) {
									incorrectValueTypes.forEach((message: string) => {
										res.messages.push({
											type: MessageTypes.Error,
											message: message
										});
									});
									break;
								}
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

		return res;
	}

	usingDotNotation(code: string): ProgramResponse {
		const response = this.baseChecks(code, "productName", PROPERTY_OF_AN_OBJECT_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.object.name !== "product") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectName("product")
								});
								break;
							}

							if (init.property.type !== IDENTIFIER || init.computed === true) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation()
								});
								break;
							}

							if (init.property.name !== "name") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName("name")
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

		return res;
	}

	usingBracketNotation(code: string): ProgramResponse {
		const response = this.baseChecks(code, "productDescription", PROPERTY_OF_AN_OBJECT_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.object.name !== "product") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectName("product")
								});
								break;
							}

							if (init.property.type !== LITERAL && init.type === MEMBER_EXPRESSION && init.computed === true) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.stringInsideSquareBrackets
								});
								break;
							}

							if (init.property.type !== LITERAL) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useBracketNotation()
								});
								break;
							}

							if (init.property.value !== "product description") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName('"product description"')
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

		return res;
	}

	accessingNestedObjectProperty1(code: string): ProgramResponse {
		const response = this.baseChecks(code, "userFirstName");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type !== MEMBER_EXPRESSION || init.object.type != MEMBER_EXPRESSION || init.object.object.object) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.mustBeANestedProperty("object.object.property") //"The variable's value must be a property on a nested object: object.object.property",
								});
								break;
							}

							if (init.object.computed || init.property.type === LITERAL || init.computed) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation(true)
								});
								break;
							}

							if (init.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user")
								});
								break;
							}

							if (init.object.property.name !== "name") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "name")
								});
								break;
							}

							if (init.property.name !== "firstName") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("name", "firstName")
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

		return res;
	}

	accessingNestedObjectProperty2(code: string): ProgramResponse {
		const response = this.baseChecks(code, "userPassword");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type !== MEMBER_EXPRESSION || init.object.type != MEMBER_EXPRESSION || init.object.object.object) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.mustBeANestedProperty("object.object.property")
								});
								break;
							}

							if (init.computed || init.object.computed) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation(true)
								});
								break;
							}

							if (init.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user")
								});
								break;
							}

							if (init.object.property.name !== "login") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "login") //"The property on the user object must be: login",
								});
								break;
							}

							if (init.property.name !== "password") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("login", "password") //"The property on the login object should be: password",
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

		return res;
	}

	accessingNestedObjectProperty3(code: string): ProgramResponse {
		const response = this.baseChecks(code, "userStreet");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (
								init.type !== MEMBER_EXPRESSION ||
								init.object.type != MEMBER_EXPRESSION ||
								init.object.object.type != MEMBER_EXPRESSION ||
								init.object.object.object.object
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.mustBeANestedProperty("object.object.object.property") //"The variable's value must be a property on a nested object: object.object.object.property",
								});
								break;
							}

							if (init.computed || init.object.computed || init.object.object.computed) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation(true)
								});
								break;
							}

							if (init.object.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user")
								});
								break;
							}

							if (init.object.object.property.name !== "address") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "address") // "The property on the user object must be: address",
								});
								break;
							}

							if (init.object.property.name !== "locality") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("address", "locality") //"The property on the address object must be: locality",
								});
								break;
							}

							if (init.property.name !== "street") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("locality", "street") //"The property on the locality object should be: street",
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

	accessingNestedObjectProperty4(code: string): ProgramResponse {
		const response = this.baseChecks(code, "userBuildingName");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (
								init.type === OBJECT_EXPRESSION ||
								init.type === IDENTIFIER ||
								(init.property.type !== LITERAL && init.property.type !== IDENTIFIER) ||
								init.object.type != MEMBER_EXPRESSION ||
								init.object.object.type != MEMBER_EXPRESSION ||
								init.object.object.object.type != MEMBER_EXPRESSION ||
								init.object.object.object.object.type != IDENTIFIER
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: `The variable's value must be a property on a nested object: object.object.object.object["property"]`
								});
								break;
							}

							if (
								(init.object.object.object.property.type === IDENTIFIER && init.object.object.object.computed) ||
								(init.object.object.property.type === IDENTIFIER && init.object.object.computed) ||
								(init.object.property.type === IDENTIFIER && init.object.computed)
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.stringInsideSquareBrackets
								});
								break;
							}

							if (init.object.object.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user")
								});
								break;
							}

							if (
								(init.object.object.object.property.type === IDENTIFIER &&
									init.object.object.object.property.name !== "address") ||
								(init.object.object.object.property.type === LITERAL &&
									init.object.object.object.property.value !== "address")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "address")
								});
								break;
							}

							if (
								(init.object.object.property.type === IDENTIFIER && init.object.object.property.name !== "locality") ||
								(init.object.object.property.type === LITERAL && init.object.object.property.value !== "locality")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("address", "locality")
								});
								break;
							}

							if (
								(init.object.property.type === IDENTIFIER && init.object.property.name !== "building") ||
								(init.object.property.type === LITERAL && init.object.property.value !== "building")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("locality", "building")
								});
								break;
							}

							if (init.property.type !== LITERAL && init.property.type !== IDENTIFIER) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The property on the building object should be accessed with bracket notation"
								});
								break;
							}

							if (typeof init.property.value !== STRING) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The property on the building object should be a string inside brackets"
								});
								break;
							}

							if (init.property.value !== "building name") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("building", '"building name"')
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

		return res;
	}

	undefinedProperties(code: string): ProgramResponse {
		const response = this.baseChecks(code, "productPrice", PROPERTY_OF_AN_OBJECT_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.property.type === IDENTIFIER && init.computed) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.stringInsideSquareBrackets
								});
								break;
							}

							if (init.object.name !== "product") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectName("product")
								});
								break;
							}

							if (
								(init.property.type === IDENTIFIER && init.property.name !== "price") ||
								(init.property.type === LITERAL && init.property.value !== "price")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName("price")
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

	uncaughtReferenceError(code: string): ProgramResponse {
		const response = this.baseChecks(code, "userName", PROPERTY_OF_AN_OBJECT_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.property.type !== LITERAL && init.type === MEMBER_EXPRESSION && init.computed === true) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.stringInsideSquareBrackets
								});
								break;
							}

							if (init.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectName("user") //`The objects's name must be "user"`,
								});
								break;
							}

							if (init.property.type === LITERAL && init.property.value !== "name") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName("name") //"The property's name must be: name",
								});
								break;
							}

							if (init.property.type === IDENTIFIER && init.property.name !== "name") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName("name")
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

		return res;
	}

	uncaughtTypeError(code: string): ProgramResponse {
		const response = this.baseChecks(code, "username");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (
								init.object.type != MEMBER_EXPRESSION ||
								(init.object.property.type !== IDENTIFIER && init.object.property.type !== LITERAL) ||
								(init.property.type !== IDENTIFIER && init.property.type !== LITERAL) ||
								init.object.object.object
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.mustBeANestedProperty("object.object.property") //"The variable's value must be a property on a nested object: object.object.property",
								});
								break;
							}

							if (
								(init.object.property.type === IDENTIFIER && init.object.computed) ||
								(init.property.type === IDENTIFIER && init.computed)
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.stringInsideSquareBrackets //"The value inside square brackets should be a string",
								});
								break;
							}

							if (init.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user") // "The first object's name must be: user",
								});
								break;
							}

							if (
								(init.object.property.type === IDENTIFIER && init.object.property.name !== "login") ||
								(init.object.property.type === LITERAL && init.object.property.value !== "login")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "login") // "The property on the user object must be: login",
								});
								break;
							}

							if (
								(init.property.type === IDENTIFIER && init.property.name !== "username") ||
								(init.property.type === LITERAL && init.property.value !== "username")
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("login", "username") //"The property on the login object should be: username",
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

		return res;
	}

	optionalChaining(code: string): ProgramResponse {
		const response = this.baseChecks(code, "loginUsername");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type !== CHAIN_EXPRESSION || init.expression.object.object.object) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The variable's value must be a property on an optional nested object: object.object?.property"
								});
								break;
							}

							if (
								init.expression.object.property.type !== IDENTIFIER ||
								init.expression.object.computed ||
								init.expression.property.type !== IDENTIFIER ||
								init.expression.computed
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation(true)
								});
								break;
							}

							if (init.expression.object.object.name !== "user") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("user") //"The first object's name must be: user",
								});
								break;
							}

							if (init.expression.object.optional) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectShouldNotBeOptional("user") // "The user object should not be optional" //"The first object's name must be: user",
								});
								break;
							}

							if (init.expression.object.property.name !== "login") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("user", "login") //"The property on the user object must be: login",
								});
								break;
							}

							if (init.expression.property.name !== "username") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("login", "username") //"The property on the login object should be: username",
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

		return res;
	}

	nullishCoalescing1(code: string): ProgramResponse {
		const response = this.baseChecks(code, "productPrice");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type !== LOGICAL_EXPRESSION || init.operator !== "??") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useNullishCoalescingOperator
								});
								break;
							}

							if (init.left.type !== MEMBER_EXPRESSION) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The value on the left side of the ?? operator should be a property of an object"
								});
								break;
							}

							if (init.left.object.name !== "product") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectName("product")
								});
								break;
							}

							if (init.left.property.type !== IDENTIFIER || init.left.computed) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation()
								});
								break;
							}

							if (init.left.property.name !== "price") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyName("price")
								});
								break;
							}

							if (init.right.type !== LITERAL || init.right.value !== "Price unknown") {
								res.messages.push({
									type: MessageTypes.Error,
									message: 'The value on the right side of the ?? operator should be the string: "Price unknown"'
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

		return res;
	}

	nullishCoalescing2(code: string): ProgramResponse {
		const response = this.baseChecks(code, "propertyCity");

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type !== AST_NODE_TYPES.LogicalExpression || init.operator !== "??") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useNullishCoalescingOperator
								});
								break;
							}

							if (init.left.type !== AST_NODE_TYPES.ChainExpression || init.left.expression.object.object.object) {
								res.messages.push({
									type: MessageTypes.Error,
									message:
										"The value on the left of the ?? must be a property on an optional nested object: object.object?.property"
								});
								break;
							}

							if (
								init.left.expression.object.property.type !== AST_NODE_TYPES.Identifier ||
								init.left.expression.object.computed ||
								init.left.expression.property.type !== AST_NODE_TYPES.Identifier ||
								init.left.expression.computed
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useDotNotation(true)
								});
								break;
							}

							if (init.left.expression.object.object.name !== "property") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.firstObjectName("property")
								});
								break;
							}

							if (init.left.expression.object.optional) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.objectShouldNotBeOptional("property")
								});
								break;
							}

							if (init.left.expression.object.property.name !== "address") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("property", "address")
								});
								break;
							}

							if (init.left.expression.property.name !== "city") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyOnObjectMustBe("address", "city")
								});
								break;
							}

							if (init.right.type !== LITERAL || init.right.value !== "Unknown city") {
								res.messages.push({
									type: MessageTypes.Error,
									message: 'The value on the right side of the ?? operator should be the string: "Unknown city"'
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

		return res;
	}

	objectDestructuring(code: string): ProgramResponse {
		const res: ProgramResponse = new ProgramResponse();

		try {
			const program: any = parse(code, options);

			if (program.body.length > 1) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.onlyOneStatement
				});
				res.missingElements = [];
				return res;
			}

			if (!program.body[0].declarations || program.body[0].declarations.length === 0) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.incompleteCode
				});
				res.missingElements = [];
				return res;
			}

			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							const declaration: any = node.declarations.find((declaration) => declaration.id);

							if (!declaration) {
								return res;
							}

							console.log(declaration);

							if (declaration.id.type !== AST_NODE_TYPES.ObjectPattern) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useObjectDestructuring
								});
								break;
							}

							if (declaration.init.type !== AST_NODE_TYPES.Identifier || declaration.init.name != "blog") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.rightSideValueMustBe("the object called", "blog")
								});
								break;
							}

							if (declaration.id.properties.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.noPropertiesDestructured
								});
								break;
							}

							if (declaration.id.properties.length > 1) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.destructureOnlyThisProperty("summary")
								});
								break;
							}

							if (declaration.id.properties[0].key.name !== "summary") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.thePropertyToRetrieveIsCalled("summary") //"The property to retrieve is called summary"
								});
								break;
							}

							if (
								!declaration.id.properties[0].shorthand &&
								declaration.id.properties[0].key.name === declaration.id.properties[0].value.name
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.propertyShorthandWarning("summary")
								});
								break;
							}

							if (
								!declaration.id.properties[0].shorthand &&
								declaration.id.properties[0].key.name !== declaration.id.properties[0].value.name
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.unrequiredAlias("summary", declaration.id.properties[0].value.name)
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

	objectDestructuringAliasing(code: string): ProgramResponse {
		const res: ProgramResponse = new ProgramResponse();

		try {
			const program: any = parse(code, options);

			if (program.body.length > 1) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.onlyOneStatement
				});
				res.missingElements = [];
				return res;
			}

			if (!program.body[0].declarations || program.body[0].declarations.length === 0) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.incompleteCode
				});
				res.missingElements = [];
				return res;
			}

			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							const declaration: any = node.declarations.find((declaration) => declaration.id);

							if (!declaration) {
								return res;
							}

							console.log(declaration);

							if (declaration.id.type !== AST_NODE_TYPES.ObjectPattern) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useObjectDestructuring
								});
								break;
							}

							if (declaration.init.type !== AST_NODE_TYPES.Identifier || declaration.init.name != "blog") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.rightSideValueMustBe("the object called", "blog")
								});
								break;
							}

							if (declaration.id.properties.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.noPropertiesDestructured
								});
								break;
							}

							if (declaration.id.properties.length > 1) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.destructureOnlyThisProperty("summary")
								});
								break;
							}

							if (declaration.id.properties[0].key.name !== "summary") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.thePropertyToRetrieveIsCalled("summary")
								});
								break;
							}

							if (declaration.id.properties[0].shorthand) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useAliasing("summary", "synopsis")
								});
								break;
							}

							if (declaration.id.properties[0].value.name !== "synopsis") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.incorrectAlias("summary", "synopsis") //`The summary property should be aliased as: synopsis`
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

	nestedObjectDestructuring1(code: string): ProgramResponse {
		const res: ProgramResponse = new ProgramResponse();

		try {
			const program: any = parse(code, options);

			if (program.body.length > 1) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.onlyOneStatement
				});
				res.missingElements = [];
				return res;
			}

			if (!program.body[0].declarations || program.body[0].declarations.length === 0) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.incompleteCode
				});
				res.missingElements = [];
				return res;
			}

			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							const declaration: any = node.declarations.find((declaration) => declaration.id);

							if (!declaration) {
								return res;
							}

							console.log(declaration);

							if (declaration.id.type !== AST_NODE_TYPES.ObjectPattern) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useObjectDestructuring
								});
								break;
							}

							if (declaration.init.type !== AST_NODE_TYPES.Identifier || declaration.init.name != "blog") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.rightSideValueMustBe("the object called", "blog")
								});
								break;
							}

							if (declaration.id.properties.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.noPropertiesDestructured
								});
								break;
							}

							if (
								declaration.id.properties[0].shorthand ||
								declaration.id.properties[0].value.type !== AST_NODE_TYPES.ObjectPattern ||
								declaration.id.properties[0].value.properties.length === 0
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message:
										"The startDate property should be retrieved from the publishing object: { publishing: { startDate } }"
								});
								break;
							}

							if (declaration.id.properties[0].key.name !== "publishing") {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The first object should be called publishing"
								});
								break;
							}

							if (declaration.id.properties.length > 1 || declaration.id.properties[0].value.properties.length > 1) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "Only the startDate property should be retrieved from the publishing object"
								});
								break;
							}

							if (declaration.id.properties[0].value.properties[0].key.name !== "startDate") {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The destructured property should be: startDate"
								});
								break;
							}

							if (!declaration.id.properties[0].value.properties[0].shorthand) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "Don't alias the startDate property"
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

	nestedObjectDestructuring2(code: string): ProgramResponse {
		const res: ProgramResponse = new ProgramResponse();

		try {
			const program: any = parse(code, options);

			if (program.body.length > 1) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.onlyOneStatement
				});
				res.missingElements = [];
				return res;
			}

			if (!program.body[0].declarations || program.body[0].declarations.length === 0) {
				res.messages.push({
					type: MessageTypes.Error,
					message: Responses.incompleteCode
				});
				res.missingElements = [];
				return res;
			}

			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							const declaration: any = node.declarations.find((declaration) => declaration.id);

							if (!declaration) {
								return res;
							}

							console.log(declaration);

							if (declaration.id.type !== AST_NODE_TYPES.ObjectPattern) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.useObjectDestructuring
								});
								break;
							}

							if (declaration.init.type !== AST_NODE_TYPES.Identifier || declaration.init.name != "product") {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.rightSideValueMustBe("the object called", "product")
								});
								break;
							}

							if (declaration.id.properties.length === 0) {
								res.messages.push({
									type: MessageTypes.Error,
									message: Responses.noPropertiesDestructured
								});
								break;
							}

							if (
								declaration.id.properties[0].shorthand ||
								declaration.id.properties[0].value.type !== AST_NODE_TYPES.ObjectPattern ||
								declaration.id.properties[0].value.properties.length === 0
							) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The full property should be retrieved from the price object: { price: { full } }"
								});
								break;
							}

							if (declaration.id.properties[0].key.name !== "price") {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The first object should be called price"
								});
								break;
							}

							if (declaration.id.properties.length > 1 || declaration.id.properties[0].value.properties.length > 1) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "Only the full property should be retrieved from the price object"
								});
								break;
							}

							if (declaration.id.properties[0].value.properties[0].key.name !== "full") {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The destructured property should be: full"
								});
								break;
							}

							if (declaration.id.properties[0].value.properties[0].shorthand) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "Alias the full property as fullPrice: { full: fullPrice }"
								});
								break;
							}

							if (declaration.id.properties[0].value.properties[0].shorthand) {
								res.messages.push({
									type: MessageTypes.Error,
									message: "Alias the full property as fullPrice: { full: fullPrice }"
								});
								break;
							}

							if (declaration.id.properties[0].value.properties[0].value.name !== "fullPrice") {
								res.messages.push({
									type: MessageTypes.Error,
									message: "The alias is incorrect. It should be: fullPrice"
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

	objectWithVariousTypes(code: string): ProgramResponse {
		const response = this.baseChecks(code, "myObject", OBJECT_EXPRESSION_WITH_LABEL);

		if (response instanceof ProgramResponse) {
			return response;
		}

		const {
			res,
			program,
			declaration: { init }
		} = response;

		try {
			traverse(program, {
				enter(node: TSESTree.Node) {
					switch (node.type) {
						case AST_NODE_TYPES.VariableDeclaration:
							if (init.type === OBJECT_EXPRESSION) {
								const requiredTypes = [STRING, NUMBER, BOOLEAN, ARRAY, OBJECT, FUNCTION, null];
								const seenTypes = [];

								init.properties.forEach((property: any) => {
									switch (property.value.type) {
										case LITERAL:
											if (typeof property.value.value === STRING) {
												seenTypes.push(STRING);
											} else if (typeof property.value.value === NUMBER) {
												seenTypes.push(NUMBER);
											} else if (typeof property.value.value === BOOLEAN) {
												seenTypes.push(BOOLEAN);
											} else if (property.value.value === null) {
												seenTypes.push(null);
											}
											break;
										case AST_NODE_TYPES.ArrayExpression:
											seenTypes.push(ARRAY);
											break;
										case AST_NODE_TYPES.FunctionExpression:
										case AST_NODE_TYPES.ArrowFunctionExpression:
											seenTypes.push(FUNCTION);
											break;
										case OBJECT_EXPRESSION:
											seenTypes.push(OBJECT);
											break;
									}
								});

								const missingTypes = requiredTypes.filter((type) => !seenTypes.includes(type));

								if (missingTypes.length !== 0) {
									let errorMessage;

									if (missingTypes.length === 1) {
										errorMessage = `The object is missing a property with the type: ${missingTypes[0]}`;
									} else {
										errorMessage = `The object is missing properties with the following types: ${missingTypes.join(
											", "
										)}`;
									}

									res.messages.push({
										type: MessageTypes.Error,
										message: errorMessage
									});
									break;
								}
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

		return res;
	}
}
