<template>
    <div class="row">
        <div class="col s12 m8 offset-m2">
            <task-creator></task-creator>
        </div>
    </div>
</template>

<script>
    import TaskCreator from './TaskCreator.vue';

    export default {
        name: "Tasks",
        data () {
            return {
                tasks: [], 
            }
        },
        components: {TaskCreator}
    }
</script>