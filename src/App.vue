<template>
  <v-layout>
    <v-app-bar color="info">
      <v-app-bar-title>InstaPost</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="8">
            <Form @sendParams="onParamsSend" @showSnackbar="showSnackbar" />
          </v-col>
          <v-col cols="4">
            <VideoPlayer
              :videoPath="videoPath"
              :coverPath="coverPath"
              @removePath="onPathRemove"
              @showSnackbar="showSnackbar"
            />
          </v-col>
        </v-row>
        <Snackbar
          :text="snackbarText"
          :color="snackbarColor"
          :show="snackbarShow"
          :timeout="3000"
        />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from "vue";

import Form from "./components/Form.vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import Snackbar from "./components/Snackbar.vue";

let snackbarColor = ref("");
let snackbarText = ref("");
let snackbarShow = ref(false);

let videoPath = ref("");
let coverPath = ref("");

function onParamsSend(video, cover) {
  videoPath.value = video;
  coverPath.value = cover;
}

function onPathRemove() {
  videoPath.value = "";
}

function showSnackbar(color, text) {
  snackbarColor.value = color;
  snackbarText.value = text;
  snackbarShow.value = true;
}
</script>
