<template>
  <v-layout>
    <v-app-bar color="info">
      <v-app-bar-title>InstaPost</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <Form />
          </v-col>
          <v-col cols="6">
            <v-sheet class="pa-2"> .v-col-6 </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import Form from "./components/Form.vue";
</script>
