<template>
    <div>这里可以接收一些参数</div>
    <div>{{ id }}</div>
</template>
<script setup lang="ts">
const { id } = defineProps<{ id: number }>();
</script>
