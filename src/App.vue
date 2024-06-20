<template>
  <v-layout>
    <v-app-bar color="info">
      <v-app-bar-title>InstaPost</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="8">
            <Form @sendPath="onPathSend" />
          </v-col>
          <v-col cols="4">
            <VideoPlayer :src="videoPath" @removePath="onPathRemove" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from "vue";

import Form from "./components/Form.vue";
import VideoPlayer from "./components/VideoPlayer.vue";

let videoPath = ref("");

function onPathSend(path) {
  videoPath.value = path;
}

function onPathRemove() {
  videoPath.value = "";
}
</script>
