<template>
    <div :class='["toast", type, "z-depth-" + depth ]'  style="float: none; display: block" v-html="message">Hi</div>
</template>

<script>
    export default {
        name: 'Notification',
        props: {
            type: {
                type: String,
                required: false,
                default: ''
            },
            message: {
                type: String,
                required: true
            },
            depth: {
                type: Number,
                required: false,
                default: 0
            }
        }
    }
</script>