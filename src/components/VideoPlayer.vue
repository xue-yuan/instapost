<template>
  <video
    :src="src"
    controls
    style="width: 100%; max-width: 600px; margin-top: 20px"
  ></video>
</template>

<script>
export default {
  props: ["src"],
};
</script>
