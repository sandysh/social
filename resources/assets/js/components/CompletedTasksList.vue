<template>
    <ul class="collection with-header">
        <li class="collection-header">
            <strong><i class="material-icons balanced teal white-text">done</i>Completed Task</strong>
        </li>
        <li v-for="task in tasks" class="collection-item">
            <div>
                <input type="checkbox" class="filled-in" checked="checked" />
                <label for="uncheckTask"></label>Task 1 <a href="#!" class="secondary-content"><i class="material-icons">send</i></a>
            </div>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'CompletedTasksList',
        data () {
            return {}
        }
    }
</script>