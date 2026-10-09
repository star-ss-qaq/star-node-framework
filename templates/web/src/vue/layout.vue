<template>
    <div>
        这里是vue的layout<span @click="i++">{{ i }}</span>
        <div><a href="1">111</a></div>
        <sf-route />
    </div>
</template>
<script setup lang="ts">
import { useRoute } from '@thestarweb/star-framework-app-web-vue';
import { ref, watch } from 'vue';
// const r =useRoute();
// watch(r,()=>{
//     console.log(r);
// })
// console.log(r)
const i = ref(0);
</script>
