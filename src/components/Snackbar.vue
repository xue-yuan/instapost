<template>
  <v-snackbar v-model="props.show" :timeout="timeout">
    {{ props.text }}

    <template v-slot:actions>
      <v-btn :color="props.color" variant="text" @click="props.show = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
const props = defineProps(["text", "color", "show"]);
</script>
