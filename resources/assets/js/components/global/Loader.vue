<template>
    <div class="loader">
        <div :class="['bounce1', color]" :style="style"></div>
        <div :class="['bounce2', color]" :style="style"></div>
        <div :class="['bounce3', color]" :style="style"></div>
    </div>
</template>
<script>
    export default {
        name: 'Loader',
        props: {
            color: {
                type: String,
                required: false,
                default: 'white'
            },
            height: {
                type: Number,
                required: false,
                default: 10
            },
            width: {
                type: Number,
                required: false,
                default: 10
            }
        },
        computed: {
            style () {
                return {
                    height: this.height + 'px',
                    width: this.width + 'px',
                }
            }
        }
    }
</script>
<style>
.loader {
  width: 70px;
  text-align: center;
}

.loader > div {
  width: 10px;
  height: 10px;
  background-color: #333;

  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.loader .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.loader .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% { -webkit-transform: scale(0) }
  40% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% { 
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% { 
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
}
</style>