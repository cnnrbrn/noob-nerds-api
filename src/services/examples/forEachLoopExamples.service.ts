import { Injectable } from "@nestjs/common"
import { returnHtml } from "../../helpers/helpers"

@Injectable()
export default class ForEachLoopExamplesService {
	forEach1(): string {
		return returnHtml(`articles.forEach(function(article) {
  const  { headline }  = article;
});

articles.forEach((article) => {
  const  { headline }  = article;
});
`)
	}

	forEach2(): string {
		return returnHtml(`phones.forEach(function(phone) {
  const  { brand, model, price }  = phone;
});

phones.forEach((phone) => {
  const  { brand, model, price }  = phone;
});
`)
	}
}
