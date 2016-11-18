<template>
    <div class="container">
        <div class="row">
            <task-creator></task-creator>
        </div>
        <div class="row">
            <task-list></task-list>
        </div>                      
    </div>
</template>

<script>
    import TaskCreator from './TaskCreator.vue';
    import TaskList from './TaskList.vue';

    export default {
        name: "Tasks",
        data () {
            return {
                tasks: [], 
            }
        },
        components: {TaskCreator, TaskList}
    }
</script>