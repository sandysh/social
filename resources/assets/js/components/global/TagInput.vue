<template>
    <div class="chips"></div>
</template>

<script>
    export default {
        name: 'TagInput',
        props: {
            placeholder: {
                type: String,
                required: false,
                default: 'Enter a tag'
            },
            secondaryPlaceholder: {
                type: String,
                required: false,
                default: '+Tag'
            },
            tags: {
                type: Array,
                required: false,
                default () {
                    return []
                }
            }
        },
        watch: {
            tags (value) {
                this.draw();
                $(this.$el).find('input').focus();
            }
        },
        methods: {
            draw () {
                $(this.$el).material_chip({
                    placeholder: '+Tag',
                    secondaryPlaceholder: 'Enter a tag',
                    data: this.tags
                });
            },
            listenEvents () {
                $(this.$el).on('chip.add', (e, tag) => {
                    this.tags.push(tag);
                }).on('chip.delete', (e, tag) => {
                    let index = this.tags.indexOf(tag);
                    this.tags.splice(index, 1);
                });
            }
        },
        mounted () {
            this.draw();
            this.listenEvents();
        }
    }
</script>