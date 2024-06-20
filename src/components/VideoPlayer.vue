<template>
  <v-row justify="center">
    <v-col cols="12">
      <v-card color="indigo" variant="tonal" class="mx-auto">
        <v-card-item>
          <div>
            <div class="text-overline mb-1">InstaPost</div>
            <div class="text-h3 mb-3">Preview</div>
            <video
              controls
              style="width: 100%"
              ref="video"
              v-if="props.src && showVideo"
              :src="props.src"
            ></video>
          </div>
        </v-card-item>
        <v-card-actions class="mb-3">
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn
                variant="tonal"
                :disabled="props.src ? false : true"
                @click="unloadVideo"
              >
                Close
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                variant="tonal"
                :disabled="props.src ? false : true"
                @click="saveFile"
              >
                <template v-if="!isSaved"> Save </template>
                <template v-else>
                  <v-icon icon="mdi-check"></v-icon>
                </template>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn variant="outlined" :disabled="props.src ? false : true">
                Upload
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12"> </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch } from "vue";

import Snackbar from "./Snackbar.vue";

const props = defineProps(["src"]);
const emit = defineEmits(["removePath"]);
const video = ref(null);

const showVideo = ref(true);

let isSaved = ref(false);

// let snackbarColor = ref("");
// let snackbarText = ref("");
// let snackbarShow = ref(false);

function unloadVideo(event) {
  window.ipcRenderer.invoke("remove-file", props.src).then((result) => {
    video.value.pause();
    video.value.load();
    emit("removePath");
  });
}

function saveFile(event) {
  window.ipcRenderer.invoke("save-file", props.src).then((result) => {});
}
</script>
