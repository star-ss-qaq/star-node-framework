<template>
	<div>
		这里是vue的layout<span @click="i++">{{ i }}</span>
		<div v-if="code">页面数据错误：{{ code }}</div>
		<sf-route v-else />
	</div>
</template>
<script setup lang="ts">
import { useRoute } from "@thestarweb/star-framework-app-web-vue";
import { ref, watch } from "vue";
const { code } = defineProps<{ code?: number }>();
// const r =useRoute();
// watch(r,()=>{
//     console.log(r);
// })
// console.log(r)
const i = ref(0);
</script>
