import { Injectable } from "@nestjs/common"
import { returnHtml } from "../../helpers/helpers"

@Injectable()
export default class ForLoopExamplesService {
	dotNotation1(): string {
		return returnHtml(`for(let i = 0; i < books.length; i++) {
  const bookTitle = books[i].title;
}

// or
for(let i = 0; i < books.length; i++) {
  const book = books[i];
  const bookTitle = book.title;
}
`)
	}

	continue1(): string {
		return returnHtml(`for(let i = 0; i < recipes.length; i++) {

  if(recipes[i].numberOfIngredients >= 10) {
    continue;
  }
     
  const recipeName = recipes[i].name;
}

// or
for(let i = 0; i < recipes.length; i++) {

  if(recipes[i].numberOfIngredients >= 10) {
    continue;
  }
     
  const recipe = recipes[i];
  const recipeName = recipe.name;
}
`)
	}

	break1(): string {
		return returnHtml(`for(let i = 0; i < blogs.length; i++) {

  if(i === 2) {
    break;
  }
     
  const blogTitle = blogs[i].title;
}

// or
for(let i = 0; i < blogs.length; i++) {

  if(i === 2) {
    break;
  }
     
  const blog = blogs[i];
  const blogTitle = blog.title;
}
`)
	}
}
