import { IsNotEmpty, IsString } from "class-validator";

export default class ProgramDto {
	@IsNotEmpty()
	@IsString()
	readonly section: string;
	@IsNotEmpty()
	readonly question: string;
	@IsNotEmpty()
	readonly code: string;
}
