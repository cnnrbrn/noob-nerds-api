import { Injectable } from "@nestjs/common"
import { returnHtml } from "../../helpers/helpers"

@Injectable()
export default class ObjectExamplesService {
	emptyObject(): string {
		return returnHtml("const emptyObject = {};")
	}

	objectWithTwoStringProperties(): string {
		return returnHtml(`const movie = {
    title: "Movie Title",
    description: "Movie description"
};`)
	}

	objectWithThreeProperties(): string {
		return returnHtml(`const user = {
    id: 1234,
    name: "Mrs Blobby",
    isActive: true
};`)
	}

	usingDotNotation(): string {
		return returnHtml("const productName = product.name;")
	}

	usingBracketNotation(): string {
		return returnHtml(`const productDescription = product["product description"];`)
	}

	accessingNestedObjectProperty1(): string {
		return returnHtml("const userFirstName = user.name.firstName;")
	}

	accessingNestedObjectProperty2(): string {
		return returnHtml("const userPassword = user.login.password;")
	}

	accessingNestedObjectProperty3(): string {
		return returnHtml("const userStreet = user.address.locality.street;")
	}

	accessingNestedObjectProperty4(): string {
		return returnHtml(`const userBuildingName = user.address.locality.building["building name"];
		
const userBuildingName = user["address"]["locality"]["building"]["building name"];`)
	}

	undefinedProperties(): string {
		return returnHtml(`const productPrice = product.price;
		
const productPrice = product["price"];`)
	}

	uncaughtReferenceError(): string {
		return returnHtml(`const userName = user.name;
		
const userName = user["name"];`)
	}

	uncaughtTypeError(): string {
		return returnHtml(`const username = user.login.username;

const username = user["login"]["username"];
		`)
	}

	optionalChaining(): string {
		return returnHtml("const loginUsername = user.login?.username;")
	}

	nullishCoalescing1(): string {
		return returnHtml('const productPrice = product.price ?? "Price unknown";')
	}

	nullishCoalescing2(): string {
		return returnHtml('const propertyCity = property.address?.city ?? "Unknown city";')
	}

	objectDestructuring(): string {
		return returnHtml("const { summary } = blog;")
	}

	objectDestructuringAliasing(): string {
		return returnHtml("const { summary: synopsis } = blog;")
	}

	nestedObjectDestructuring1(): string {
		return returnHtml("const {	publishing: { startDate } } = blog;")
	}

	nestedObjectDestructuring2(): string {
		return returnHtml("const { price: { full: fullPrice } } = product;")
	}
}
