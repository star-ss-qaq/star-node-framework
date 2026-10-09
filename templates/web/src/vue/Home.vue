<template>
    <div>
        这里是vue编写的内容哦<span @click="i++">{{ i }}</span>
        <button @click="handleRequest">ceshi</button>
    </div>
</template>
<script setup lang="ts">
import { useRequest } from '@thestarweb/star-framework-app-web-vue';
import { ref } from 'vue';

const i = ref(0);

const request = useRequest();
async function handleRequest(){
    const res = await  request.post('self:/',{body:{a:true,c:123}})
    console.log(res);
}

</script>
