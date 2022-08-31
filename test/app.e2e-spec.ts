import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import ProgramDto from "../src/dto/program.dto";

describe("AppController (e2e)", () => {
	let app: INestApplication;
	let httpServer: any;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		httpServer = app.getHttpServer();
	});

	describe("GET requests for the examples", () => {
		it("should return a 404 when calling the base URL", () => {
			return request(httpServer).get("/").expect(404);
		});

		it("should return a 404 when either the service or method cannot be found", async () => {
			const notFoundResponse = { statusCode: 404, message: "Example answer not found.", error: "Not Found" };

			const response = await request(httpServer).get("/section/question");

			expect(response.status).toBe(404);
			expect(response.body).toMatchObject(notFoundResponse);
		});

		it("should return a 200 when getting an example is successful", () => {
			return request(httpServer).get("/objects/emptyObject").expect(200);
		});
	});

	describe("POST requests for the code parsing services", () => {
		// TODO: test for 400 is validation fails. e2e currently ignoring validation

		it("should return a 404 when either the service or method cannot be found", async () => {
			const programRequest: ProgramDto = {
				section: "doesn't exist",
				question: "doesn't exist",
				code: "nonsense"
			};

			const response = await request(httpServer).post("/").send(programRequest);
			expect(response.status).toBe(404);
		});

		it("should return a populated missingElements array if the submitted code does not contain a required element", async () => {
			const programRequest: ProgramDto = {
				section: "objects",
				question: "emptyObject",
				code: "nonsense"
			};

			const response = await request(httpServer).post("/").send(programRequest);
			expect(response.status).toBe(200);
			expect(response.body.missingElements.length).toBeGreaterThan(0);
		});

		it("should return a populated messages array if the submitted code does not meet all requirements", async () => {
			const programRequest: ProgramDto = {
				section: "objects",
				question: "emptyObject",
				code: "const x = {}"
			};

			const response = await request(httpServer).post("/").send(programRequest);
			expect(response.status).toBe(200);
			expect(response.body.messages.length).toBeGreaterThan(0);
		});

		it("should return an empty missingElements and an empty messages array if the submitted code meets all requirements", async () => {
			const programRequest: ProgramDto = {
				section: "objects",
				question: "emptyObject",
				code: "const emptyObject = {}"
			};

			const response = await request(httpServer).post("/").send(programRequest);
			expect(response.status).toBe(200);
			expect(response.body.missingElements.length).toBe(0);
			expect(response.body.messages.length).toBe(0);
		});
	});
});
