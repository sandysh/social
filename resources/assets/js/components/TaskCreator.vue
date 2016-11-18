<template>
    <form class="col s12">
        <div class="row">
            <div class="input-field col s12">
                <i class="material-icons prefix">speaker_notes</i>
                <textarea id="icon_prefix2" class="task-post-input z-depth-2" placeholder="what will you work on today ??" v-model="task"></textarea>
            </div>
            <a class="waves-effect waves-light btn right post-btn">Save</a>
        </div>
    </form>
</template>

<script>
    export default {
        name: 'TaskCreator',
        data () {
            return {}
        }
    }
</script>