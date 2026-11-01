import { SFRoute } from "@thestarweb/star-framework-app-web-react";
import { useState } from "react";

export default function () {
	const [num, setNum] = useState(1);
	return (
		<div>
			<div onClick={() => setNum((i) => i + 1)}>这里是react layout{num}</div>
			<SFRoute />
		</div>
	);
}
