import { Controller, Post, Body, NotFoundException, Get, Param, HttpCode } from "@nestjs/common";
import ObjectsService from "./services/objects.service";
import ObjectExamplesService from "./services/examples/objectExamples.service";
import ForLoopsService from "./services/forLoops.service";
import ForLoopExamplesService from "./services/examples/forLoopExamples.service";
import ForEachLoopsService from "./services/forEachLoops.service";
import ForEachLoopExamplesService from "./services/examples/forEachLoopExamples.service";
import ProgramDto from "./dto/program.dto";
import { FOR_EACH_LOOPS, FOR_LOOPS, FUNCTION, OBJECTS } from "./constants/misc";
import ProgramResponse from "./models/ProgramResponse";

@Controller()
export class AppController {
	constructor(
		private readonly objectsService: ObjectsService,
		private readonly objectExamplesService: ObjectExamplesService,
		private readonly forLoopsService: ForLoopsService,
		private readonly forLoopExamplesService: ForLoopExamplesService,
		private readonly forEachLoopsService: ForEachLoopsService,
		private readonly forEachLoopExamplesService: ForEachLoopExamplesService
	) {}

	@Get(":section/:question")
	getExample(@Param("section") section: string, @Param("question") question: string): string {
		let service: ObjectExamplesService | ForLoopExamplesService | ForEachLoopExamplesService;

		switch (section) {
			case OBJECTS:
				service = this.objectExamplesService;
				break;
			case FOR_LOOPS:
				service = this.forLoopExamplesService;
				break;
			case FOR_EACH_LOOPS:
				service = this.forEachLoopExamplesService;
				break;
			default:
				service = null;
		}

		if (service) {
			if (typeof service[question] === FUNCTION) {
				return service[question]();
			}
		}

		throw new NotFoundException("Example answer not found.");
	}

	@Post()
	@HttpCode(200)
	checkCode(@Body() programDto: ProgramDto): ProgramResponse {
		let service: ObjectsService | ForLoopsService | ForEachLoopsService;

		const { code, section, question } = programDto;

		switch (section) {
			case OBJECTS:
				service = this.objectsService;
				break;
			case FOR_LOOPS:
				service = this.forLoopsService;
				break;
			case FOR_EACH_LOOPS:
				service = this.forEachLoopsService;
				break;
			default:
				service = null;
		}

		if (service) {
			if (typeof service[question] === FUNCTION) {
				return service[question](code);
			}
		}

		throw new NotFoundException("Question not found.");
	}
}
