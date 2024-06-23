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
              v-if="props.videoPath"
              :src="props.videoPath"
            ></video>
            <v-textarea
              clearable
              label="✏️ Caption"
              v-model="caption"
              :readonly="props.videoPath && !isLoading ? false : true"
            ></v-textarea>
          </div>
        </v-card-item>
        <v-card-actions class="mb-3">
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn
                variant="tonal"
                :disabled="props.videoPath && !isLoading ? false : true"
                @click="saveVideo"
              >
                <template v-if="!isSaved">Save</template>
                <template v-else>
                  <v-icon icon="mdi-check"></v-icon>
                </template>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                variant="outlined"
                :disabled="props.videoPath ? false : true"
                :loading="isLoading"
                @click="uploadVideo"
              >
                Upload
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps(["videoPath", "coverPath"]);
const emit = defineEmits(["removePath"]);
const video = ref(null);

let caption = ref("");
let isSaved = ref(false);
let isLoading = ref(false);

function saveVideo(event) {
  window.ipcRenderer
    .invoke("video:save", props.videoPath)
    .then((res) => {
      emit("showSnackbar", "success", `File saved successfully at ${res}`);
    })
    .catch((err) => {
      emit("showSnackbar", "error", err);
    });
}

function uploadVideo(event) {
  isLoading.value = true;
  window.ipcRenderer
    .invoke("video:upload", props.videoPath, props.coverPath, caption.value)
    .then((res) => {
      emit("showSnackbar", "success", "Uploaded!");
    })
    .catch((err) => {
      emit("showSnackbar", "error", err);
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>
