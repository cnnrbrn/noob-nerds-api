import { returnHtml } from "../Helpers";

describe("helpers", () => {
	describe("returnHtml", () => {
		it("should return a string of code formatted as html", () => {
			const codeString = "const emptyObject = {};";

			expect(returnHtml(codeString)).toBe('<span class="hljs-keyword">const</span> emptyObject = {};');
		});
	});
});
