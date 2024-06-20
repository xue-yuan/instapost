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
                    class="custom-range-slider"
                    step="1"
                    thumb-label="always"
                    v-model="audioRange"
                    :disabled="!audioIsLoaded"
                    :label="formatTime(audioCurrentTime)"
                    :max="audioMax"
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
                    thumb-size="12"
                    color="primary"
                    v-model="audioCurrentTime"
                    :disabled="!audioIsLoaded"
                    :label="formatTime(audioCurrentTime)"
                    :max="audioMax"
                    @update:modelValue="moveSlider"
                  ></v-slider>
                </div>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="auto">
                <div class="text-h6 text-primary font-weight-bold">
                  {{ (audioRange[1] - audioRange[0]) / 1000 }}
                </div>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="auto">
                <v-btn icon :disabled="!audioIsLoaded" @click="audioToggle">
                  <v-icon
                    size="large"
                    :icon="audioIsPlaying ? 'mdi-pause' : 'mdi-play'"
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
          :loading="isLoading"
          @click="generate"
          >Generate</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

let image = ref(null);
let audio = ref(null);

let audioRange = ref([0, 0]);
let audioCurrentTime = ref(0);
let audioMax = ref(0);
let audioIsPlaying = ref(false);
let audioIsLoaded = ref(false);
let isLoading = ref(false);
let oldResult = ref("");

const audioPlayer = ref();
const form = ref();
const emit = defineEmits(["sendPath"]);
const imageRules = ref([
  (value) => {
    return value.length > 0 ? true : "Image is required";
  },
]);
const audioRules = ref([
  (value) => {
    return value.length > 0 ? true : "Audio is required";
  },
  (value) => {
    return audioRange.value[1] - audioRange.value[0] <= 30 * 1000
      ? true
      : "Audio must be within 30 seconds";
  },
]);

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);

  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let milliseconds = ms % 1000;

  let formattedMinutes = minutes.toString().padStart(2, "0");
  let formattedSeconds = seconds.toString().padStart(2, "0");
  let formattedMilliseconds = milliseconds.toString().padStart(3, "0");

  return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}

function handleKeyPress(event) {
  if (event.key === " ") {
    audioToggle(event);
  }
}

function onChangeImageFile(event) {
  const file = event.target.files[0];
  if (!(file && file.type.startsWith("image/"))) {
    alert("Please upload a valid image file.");
  }

  event.target.blur();
}

function onChangeAudioFile(event) {
  const file = event.target.files[0];
  if (file && file.type === "audio/mpeg") {
    const objectURL = URL.createObjectURL(file);
    audioIsLoaded.value = true;
    audioPlayer.value.src = objectURL;
    audioPlayer.value.onloadedmetadata = () => {
      const duration = Math.floor(audioPlayer.value.duration * 1000);
      audioRange.value = [0, duration];
      audioMax.value = duration;
    };
  } else {
    alert("Please upload a valid MP3 file.");
    audioInitialize(audioInitialize);
  }

  event.target.blur();
}

function onTimeUpdate(event) {
  if (audioIsLoaded) {
    if (audioPlayer.value.currentTime * 1000 >= audioRange.value[1]) {
      audioStop(event);
    }

    audioCurrentTime.value = Math.floor(audioPlayer.value.currentTime * 1000);
  }
}

function moveRangeSlider(event) {
  if (audioIsLoaded) {
    audioStop(event);
  }
}

function moveSlider(event) {
  if (audioIsLoaded) {
    audioIsPlaying.value = false;
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = audioCurrentTime.value / 1000;
  }
}

function audioToggle(event) {
  if (audioIsLoaded) {
    if (
      !audioIsPlaying.value &&
      audioPlayer.value.currentTime < audioRange.value[1]
    ) {
      audioPlayer.value.play();
    } else {
      audioPlayer.value.pause();
    }
    audioIsPlaying.value = !audioIsPlaying.value;
  }
}

function audioStop(event) {
  if (audioIsLoaded) {
    audioIsPlaying.value = false;
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = audioRange.value[0] / 1000;
    audioCurrentTime.value = audioRange.value[0];
  }
}

function audioInitialize(event) {
  audioIsPlaying.value = false;
  audioIsLoaded.value = false;
  audioPlayer.value.pause();
  audioPlayer.value.currentTime = 0;
  audioCurrentTime.value = 0;
  audioRange.value = [0, 0];
}

onMounted(() => {
  audioPlayer.value.addEventListener("pause", function () {
    if (audioIsLoaded) {
      audioIsPlaying.value = false;
    }
  });

  audioPlayer.value.addEventListener("play", function () {
    if (audioIsLoaded) {
      audioIsPlaying.value = true;
    }
  });

  document.addEventListener("keydown", handleKeyPress);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyPress);
});

async function generate() {
  const { valid } = await form.value.validate();

  if (valid) {
    isLoading.value = true;

    window.ipcRenderer
      .invoke(
        "media-process",
        image.value.path,
        audio.value.path,
        audioRange.value[0] / 1000,
        audioRange.value[1] / 1000,
        oldResult.value,
      )
      .then((result) => {
        oldResult.value = result;
        emit("sendPath", result);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }
}
</script>

<style>
.position-relative {
  position: relative;
  margin-right: 40px;
  margin-left: 20px;
  margin-top: 50px;
  margin-bottom: 10px;
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
