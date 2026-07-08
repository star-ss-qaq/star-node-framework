import { buildApp } from "./build-app.js";
import { Command } from "./index.js";
import { Options } from "./params.js";

let number = 0;
class App {
	@Command()
	a(@Options() arg: number) {
		console.log("hellp");
		number = arg;
	}
}
const app = buildApp(new App());
app(["", "", "--arg", "10"]);
console.log(number);
