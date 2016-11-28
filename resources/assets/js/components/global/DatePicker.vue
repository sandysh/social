<template>
    <input type="date" class="datepicker">
</template>

<script>
    export default {
        name: 'DatePicker',
        props: {
            selectMonths: {
                type: Boolean,
                required: false,
                default: true
            },
            selectYears: {
                type: Number,
                required: false,
                default: 5
            }
        },
        computed: {
            options () {
                return {
                    selectYears: this.selectYears,
                    selectMonths: this.selectMonths
                }
            }
        },
        mounted () {
            $(this.$el).pickadate(this.options);
        }
    }
</script>


