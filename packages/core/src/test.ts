import { isCustomTypeClass, typeOf } from "@deepkit/type";
import { diCreate, Module } from "./di";
import { Inject } from "./di/@inject";
class B {
	str = "world";
}
function factory(obj: B) {
	return obj.str;
}
@Module({
	providers: [factory],
})
class A {
	@Inject(factory)
	d!: string;
}
debugger;
diCreate(A).then((instance) => {
	console.log(instance);
});
