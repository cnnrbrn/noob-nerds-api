export default class Responses {
	public static readonly invalidCode = "Invalid code"
	public static readonly incompleteCode = "Incomplete code"
	public static readonly onlyOneStatement = "There should only be one statement in your code. Do you have an extra semi-colon?"
	public static readonly stringInsideSquareBrackets = "The value inside the square brackets should be a string"
	public static readonly useNullishCoalescingOperator = "Please use the nullish coalescing operator: ??"
	public static readonly useObjectDestructuring = "Please use object destructuring"
	public static readonly noPropertiesDestructured = "You are not destructuring any properties"

	static objectName(name: string): string {
		return `The object's name must be: ${name}`
	}

	static firstObjectName(name: string): string {
		return `The first object's name must be: ${name}`
	}

	static propertyName(name: string): string {
		return `The property's name must be: ${name}`
	}

	static propertyOnObjectMustBe(objectName: string, propertyName: string): string {
		return `The property on the ${objectName} object must be: ${propertyName}`
	}

	static propertyCount(expectedCount: number, actualCount: number): string {
		return `The object should have ${expectedCount} properties, your object has ${actualCount} propert${
			actualCount === 1 ? "y" : "ies"
		}`
	}

	static missingProperties(requiredProperties: string[]): string {
		return `The object is missing the following properties: ${requiredProperties}`
	}

	static incorrectValue(property: string, valueType: string): string {
		return `${property} should have a ${valueType} value`
	}

	static mustBeANestedProperty(shape: string) {
		return `The variable's value must be a property on a nested object: ${shape}`
	}

	static useDotNotation(plural: boolean = false) {
		return `Please use dot notation to access the propert${plural ? "ies" : "y"}`
	}

	static useBracketNotation(plural: boolean = false) {
		return `Please use bracket notation to access the propert${plural ? "ies" : "y"}`
	}

	static objectShouldNotBeOptional(objectName: string) {
		return `The ${objectName} object should not be optional`
	}

	static rightSideValueMustBe(valueType: string, valueName: string) {
		return `The value on the right side of the = must be ${valueType}: ${valueName}`
	}

	// destructuring
	static destructureOnlyThisProperty(property: string) {
		return `Destructure only the ${property} property`
	}

	static thePropertyToRetrieveIsCalled(property: string) {
		return `The property to retrieve is called:  ${property}`
	}

	static propertyShorthandWarning(property: string) {
		return `To destructure a property without renaming it you don't need the value, only the key, i.e { ${property} }`
	}

	static unrequiredAlias(property: string, alias: string) {
		return `You are aliasing the ${property} property as: ${alias}`
	}

	static useAliasing(property: string, alias: string) {
		return `Use aliasing to rename the ${property} property to ${alias}, i.e. { ${property}:  ${alias} }` // `You are aliasing the ${property} property incorrectly as: ${incorrectAlias}`
	}

	static incorrectAlias(property: string, alias: string) {
		return `The  ${property} property should be aliased as ${alias}, i.e. { ${property}:  ${alias} }`
	}
}
