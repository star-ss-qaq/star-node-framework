<template>
    <div>
        假装这是about<span @click="i++">{{ i }}</span>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const i = ref(0);
</script>
