import highlight from "highlight.js";

export function returnHtml(code: string): string {
	return highlight.highlight(code, { language: "js" }).value;
}
