<template>
	<div>
		这里是vue编写的内容哦<span @click="i++">{{ i }}</span>
		<button @click="handleRequest">ceshi</button>
	</div>
</template>
<script setup lang="ts">
import { useRequest } from "@thestarweb/star-framework-app-web-vue";
import { ref } from "vue";

const i = ref(0);

const request = useRequest();
async function handleRequest() {
	const res = await request.post("self:/", {
		body: {
			a: true,
			// @ts-ignore
			c: 123, // 后端应当正确丢弃
		},
	});
	console.log(1111, res);
}
// 理论上不应该这么做，但是这里为了检验服务器调用这块是否正常
// handleRequest();
request.get("self:/delay", {});
request.get("self:/delay", { keepRequest: true });
</script>
