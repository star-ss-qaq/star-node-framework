declare module "@thestarweb/star-framework-app-web" {
	interface AllApi {
		test: {
			GET: {
				"/test": {
					prop: {};
					return: any;
				};
			};
		};
	}
}
export {};