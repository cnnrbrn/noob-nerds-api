import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import ObjectsService from "./services/objects.service"
import ObjectExamplesService from "./services/examples/objectExamples.service"
import ForLoopsService from "./services/forLoops.service"
import ForLoopExamplesService from "./services/examples/forLoopExamples.service"
import ForEachLoopsService from "./services/forEachLoops.service"
import ForEachLoopExamplesService from "./services/examples/forEachLoopExamples.service"

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		ObjectsService,
		ObjectExamplesService,
		ForLoopsService,
		ForLoopExamplesService,
		ForEachLoopsService,
		ForEachLoopExamplesService
	]
})
export class AppModule {}
