<template>
  <v-layout>
    <v-app-bar color="indigo-darken-4" elevation="2" scroll-behavior="elevate">
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
      <template v-slot:append>
        <v-btn
          :icon="darkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
          @click="toggleTheme"
        ></v-btn>
        <v-btn icon="mdi-instagram"></v-btn>
        <v-btn icon="mdi-dots-vertical"></v-btn>
      </template>
      <v-app-bar-title>InstaPost✨</v-app-bar-title>
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
import { onMounted, ref } from "vue";
import { useTheme } from "vuetify";

import Form from "./components/Form.vue";
import Snackbar from "./components/Snackbar.vue";
import VideoPlayer from "./components/VideoPlayer.vue";

const theme = useTheme();

let snackbarColor = ref("");
let snackbarText = ref("");
let snackbarShow = ref(false);

let darkMode = ref(theme.global.name.value === "light" ? false : true);

let videoPath = ref("");
let coverPath = ref("");

onMounted(() => {
  window.ipcRenderer.on("theme-updated", (event, theme) => {
    updateTheme(theme);
  });
});

function updateTheme(updatedTheme) {
  theme.global.name.value = updatedTheme;
  darkMode.value = theme.global.name.value === "dark" ? true : false;
}

function toggleTheme() {
  darkMode.value = !darkMode.value;
  theme.global.name.value = darkMode.value ? "dark" : "light";
}

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
