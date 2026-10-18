import { QueryRunner } from "../query-runner/index.js";

export interface IDrive {
	createQueryRunner(): QueryRunner;
}
