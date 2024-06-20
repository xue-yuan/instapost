<template>
  <v-form ref="form" validate-on="blur">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-file-input
              accept="image/*"
              label="Select Image"
              prepend-icon="mdi-image"
              v-model="image"
              :rules="imageRules"
              @change="onChangeImageFile"
            ></v-file-input>
            <v-row justify="center">
              <v-col cols="auto">
                <v-img
                  cover
                  contain
                  :src="image === null ? '' : image.path"
                  :width="image === null ? 0 : 200"
                ></v-img>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-file-input
              required
              accept="audio/mpeg"
              label="Select Audio"
              prepend-icon="mdi-music"
              v-model="audio"
              :rules="audioRules"
              @change="onChangeAudioFile"
              @click:clear="audioInitialize"
            ></v-file-input>
            <v-row md="6">
              <v-col class="position-relative">
                <div class="overlay-box">
                  <v-range-slider
                    strict
                    step="1"
                    thumb-label="always"
                    v-model="audioRange"
                    :disabled="!audioIsLoaded"
                    :label="formatTime(audioCurrentTime)"
                    :max="audioRange[1]"
                    @update:modelValue="moveRangeSlider"
                  >
                    <template v-slot:thumb-label="{ modelValue }">
                      {{ formatTime(modelValue) }}
                    </template>
                  </v-range-slider>
                </div>
                <div class="overlay-box overlay">
                  <v-slider
                    class="opacity"
                    step="1"
                    thumb-size="10"
                    color="orange"
                    v-model="audioCurrentTime"
                    :disabled="!audioIsLoaded"
                    :label="formatTime(audioCurrentTime)"
                    :max="audioRange[1]"
                  ></v-slider>
                </div>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="auto">
                <v-btn icon :disabled="!audioIsLoaded" @click="audioToggle">
                  <v-icon
                    size="large"
                    :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
                  ></v-icon>
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn icon :disabled="!audioIsLoaded" @click="audioStop">
                  <v-icon icon="mdi-stop" size="large"></v-icon>
                </v-btn>
              </v-col>
              <audio
                controls
                id="audio-player"
                ref="audioPlayer"
                style="display: none"
                @timeupdate="onTimeUpdate"
              >
                Your browser does not support the audio element.
              </audio>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <v-btn
          outlined
          class="mt-3"
          rounded="lg"
          variant="outlined"
          elevation="2"
          color="primary"
          @click="submit"
          >Generate</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";

const audioPlayer = ref();
const form = ref();
let image = ref(null);
let audio = ref(null);
let audioRange = ref([0, 0]);
let audioCurrentTime = ref(0);
let isPlaying = ref(false);
let audioIsLoaded = ref(false);
let imageRules = ref([
  (value) => {
    if (value.length > 0) return true;
    return "Image is required";
  },
]);
let audioRules = ref([
  (value) => {
    if (value.length > 0) return true;
    return "Audio is required";
  },
  (value) => {
    if (audioRange.value[1] - audioRange.value[0] <= 30) return true;
    return "Audio must be within 30 seconds";
  },
]);

async function submit() {
  const { valid } = await form.value.validate();
  console.log(valid);
}

onMounted(() => {
  audioPlayer.value.addEventListener("pause", function () {
    if (audioIsLoaded) {
      isPlaying.value = false;
    }
  });

  audioPlayer.value.addEventListener("play", function () {
    if (audioIsLoaded) {
      isPlaying.value = true;
    }
  });

  document.addEventListener("keydown", handleKeyPress);
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function handleKeyPress(event) {
  if (event.key === " ") {
    audioToggle(event);
  }
}

function onChangeImageFile(event) {
  window.ipcRenderer.invoke("message", "message from vue").then((result) => {
    console.log("result:", result);
  });

  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    console.log(image);
  } else {
    alert("Please upload a valid image file.");
  }

  event.target.blur();
}

function onChangeAudioFile(event) {
  window.ipcRenderer.invoke("message", "message from vue").then((result) => {
    console.log("result:", result);
  });

  const file = event.target.files[0];
  if (file && file.type === "audio/mpeg") {
    const objectURL = URL.createObjectURL(file);
    audioIsLoaded.value = true;
    audioPlayer.value.src = objectURL;
    audioPlayer.value.onloadedmetadata = () => {
      audioRange.value = [0, Math.floor(audioPlayer.value.duration)];
    };
  } else {
    alert("Please upload a valid MP3 file.");
    audioInitialize(audioInitialize);
  }

  event.target.blur();
}

function onTimeUpdate(event) {
  if (audioIsLoaded) {
    if (audioPlayer.value.currentTime >= audioRange.value[1]) {
      audioStop(event);
    }

    audioCurrentTime.value = Math.floor(audioPlayer.value.currentTime);
  }
}

function moveRangeSlider(event) {
  if (audioIsLoaded) {
    audioStop(event);
  }
}

function audioToggle(event) {
  if (audioIsLoaded) {
    if (
      !isPlaying.value &&
      audioPlayer.value.currentTime < audioRange.value[1]
    ) {
      audioPlayer.value.play();
    } else {
      audioPlayer.value.pause();
    }
    isPlaying.value = !isPlaying.value;
  }
}

function audioStop(event) {
  if (audioIsLoaded) {
    audioPlayer.value.pause();
    isPlaying.value = false;
    audioPlayer.value.currentTime = audioRange.value[0];
    audioCurrentTime.value = audioRange.value[0];
  }
}

function audioInitialize(event) {
  audioPlayer.value.pause();
  isPlaying.value = false;
  audioIsLoaded.value = false;
  audioPlayer.value.currentTime = 0;
  audioCurrentTime.value = 0;
  audioRange.value = [0, 0];
}
</script>

<style>
.position-relative {
  position: relative;
  margin-right: 15px;
  margin-left: 15px;
  margin-top: 50px;
  margin-bottom: 30px;
}
.overlay-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.overlay {
  top: 0px;
}
.opacity {
  opacity: 0.5;
}
</style>
