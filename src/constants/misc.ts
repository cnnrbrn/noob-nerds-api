import { TSESTreeOptions } from "@typescript-eslint/typescript-estree";

export const PROPERTY_OF_AN_OBJECT = "a property of an object";
export const FUNCTION = "function";
export const ARRAY = "array";
export const OBJECT = "object";
export const OBJECTS = "objects";
export const STRING = "string";
export const NUMBER = "number";
export const BOOLEAN = "boolean";
export const FOR_LOOP = "forLoop";
export const FOR_LOOPS = "forLoops";
export const FOR_EACH = "forEach";
export const FOR_EACH_LOOPS = "forEachLoops";
export const LOGICAL_EXPRESSION = "LogicalExpression";
export const CHAIN_EXPRESSION = "ChainExpression";
export const MEMBER_EXPRESSION = "MemberExpression";
export const OBJECT_EXPRESSION = "ObjectExpression";
export const OBJECT_EXPRESSION_WITH_LABEL = [OBJECT_EXPRESSION, "an object"];
export const PROPERTY_OF_AN_OBJECT_WITH_LABEL = [MEMBER_EXPRESSION, PROPERTY_OF_AN_OBJECT];
export const IDENTIFIER = "Identifier";
export const LITERAL = "Literal";
export const TYPEOF = "typeof";
export const OBJECT_PATTERN = "ObjectPattern";
export const NUMERIC_LITERAL = "NumericLiteral";
export const CONST = "const";

export const options: TSESTreeOptions = {
	comment: false,
	jsx: false
};
