<style>
    [type="checkbox"]+label {
        top: 8px;
    }
    .started, .stopped, .paused {
        opacity: 0.1;
    }
</style>

<template>
    <div>        
        <h5>Today's Task</h5>
        <ul class="collection z-depth-1" v-if="true">
            <li>
                <div class="collapsible-header">
                    <input class="checktask" type="checkbox"/>
                    <label for="test5"></label>
                    This is my task for today
                    <span class="right"> 
                        <i class="material-icons dp48">play_circle_filled</i>
                        <i class="material-icons dp48">pause</i>
                        <i class="material-icons dp48">replay</i>
                        <i class="material-icons dp48">stop</i>
                        <i class="material-icons dp48">delete</i>
                    </span>
                </div>
                <div class="collapsible-body"><p>Lorem ipsum dolor sit amet.</p></div>
            </li>
        </ul>
        <div v-else>No tasks present</div> 

        <!-- Modal Structure -->
        <div id="deleteTaskModal" class="modal">
            <div class="modal-content">
                <h4>Delete this task ?</h4>
                <p>Are you sure you want to delete this task ?</p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Delete</a>
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Nope</a>
            </div>
        </div>                      
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: "TaskList",
        data () {
            return {}
        },
        computed: mapGetters({
            all: 'allTasks',
            complete: 'completedTasks',
            incomplete: 'incompleteTasks',
        })
    }
</script>