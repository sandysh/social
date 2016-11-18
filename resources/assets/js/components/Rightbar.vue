<template>
    <div class="col s12 m3 l3 rightbar"> <!-- Note that "m8 l9" was added -->
        <completed-tasks-list></completed-tasks-list>
        <tasks-status></tasks-status>
    </div>
</template>

<script>
    import CompletedTasksList from './CompletedTasksList.vue';
    import TasksStatus from './TasksStatus.vue';

    export default {
        name: 'Rightbar',
        data () {
            return {};
        },
        components: {CompletedTasksList, TasksStatus}
    }
</script>