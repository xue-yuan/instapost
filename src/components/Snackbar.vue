<template>
  <v-snackbar
    v-model="props.show"
    :timeout="props.timeout"
    :color="props.color"
  >
    {{ props.text }}

    <template v-slot:actions>
      <v-btn variant="text" :visible="props.show" @click="props.show = false">
        X
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
const props = defineProps(["text", "color", "show", "timeout"]);
</script>
