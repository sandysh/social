<template>
    <ul class="collection with-header">
        <li class="collection-header">
            <strong>Task Status <i class="material-icons green-text">trending_up</i></strong>
        </li>
        <li class="collection-item avatar">
            <i class="material-icons circle">folder</i>
            <span class="title">Sunday</span>
            <p>Total task : 1 <br>
            Completed : 1 <br>
            Incomplete : 1
            </p>
            <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
        </li>
        <li class="collection-item avatar">
            <i class="material-icons circle">folder</i>
            <span class="title">Monday</span>
            <p>Total task : 1 <br>
            Completed : 1 <br>
            Incomplete : 1
            </p>
            <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
        </li>
        <li class="collection-item avatar">
            <i class="material-icons circle green">insert_chart</i>
            <span class="title">Tuesday</span>
            <p>Total task : 1 <br>
            Completed : 1 <br>
            Incomplete : 1
            </p>
            <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
        </li>
        <li class="collection-item avatar">
            <i class="material-icons circle red">play_arrow</i>
            <span class="title">Wednesday</span>
            <p>Total task : 1 <br>
            Completed : 1 <br>
            Incomplete : 1
            </p>
            <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'TasksStatus',
        data () {
            return {}
        }
    }
</script>