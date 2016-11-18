import Vue from 'vue'
import VueResource from 'vue-resource'
import {API_URL} from '../config.js'
import * as Mutation from './mutation-types.js'

Vue.use(VueResource)

const TaskResource = Vue.resource(API_URL + '/tasks{/id}')

/* helper methods */
const loading = {
    tasks: {
        create (dispatch, value) {
            dispatch({
                type: Mutation.LOADING_TASK,
                payload: {create: value}
            })
        },
        read (dispatch, value) {
            dispatch({
                type: Mutation.LOADING_TASK,
                payload: {read: value}
            })
        },
        update (dispatch, value) {
            dispatch({
                type: Mutation.LOADING_TASK,
                payload: {update: value}
            })
        },
        delete (dispatch, value) {
            dispatch({
                type: Mutation.LOADING_TASK,
                payload: {delete: value}
            })
        }
    }
}

/* Tasks CRUD methods */
export function fetchTasks ({dispatch}) {
    loading.task.read(dispatch, true)

    TaskResource.get()
        .then(handleSuccess, handleFail)
        .catch(handleError)

    function handleSuccess({data: {data}}) {
        dispatch({
            type: Mutation.SET_TASKS,
            payload: data
        })

        loading.task.read(dispatch, false)
    }

    function handleFail (error) {
        loading.task.read(dispatch, false)
    }

    function handleError (error) {
        console.warn(error)
        loading.task.read(dispatch, false)
    }
}

export function createTask ({dispatch}, task, callback) {

    loading.task.create(dispatch, true)
    
    TaskResource.save(null, task)
        .then(handleSuccess, handleFail)
        .catch(handleError)

    function handleSuccess({data: {data: {task}}}) {
        dispatch({
            type: Mutation.ADD_TASK,
            payload: task
        })

        if(callback && typeof(callback) === 'function') callback()

        loading.task.create(dispatch, false)
    }

    function handleFail (error) {
        loading.task.create(dispatch, false)
    }

    function handleError (error) {
        console.warn(error)
        loading.task.create(dispatch, false)
    }
}

export function editTask ({dispatch}, task, callback) {
    loading.task.update(dispatch, true)
    
    TaskResource.update({id: task.id}, task)
        .then(handleSuccess, handleFail)
        .catch(handleError)

    function handleSuccess({data}) {
        dispatch({
            type: Mutation.UPDATE_TASK,
            payload: task
        })

        if(callback && typeof(callback) === 'function') callback()
        
        loading.task.update(dispatch, false)
    }

    function handleFail (error) {
        loading.task.update(dispatch, false)
    }

    function handleError (error) {
        console.warn(error)
        loading.task.update(dispatch, false)
    }
}

export function deleteTask ({dispatch}, task, callback) {

    loading.task.delete(dispatch, true)
    
    TaskResource.delete({id: task.id})
        .then(handleSuccess, handleFail)
        .catch(handleError)

    function handleSuccess({data}) {
        dispatch({
            type: Mutation.DELETE_TASK,
            payload: task
        })

        if(callback && typeof(callback) === 'function') callback()

        loading.task.delete(dispatch, false)
    }

    
    function handleFail (error) {
        loading.task.delete(dispatch, false)
    }

    function handleError (error) {
        console.warn(error)
        loading.task.delete(dispatch, false)
    }
}

/*User Settings actions*/
export function skipCompanyCreation({dispatch}, skip = true) {
    dispatch({
        type: Mutation.SKIP_CREATE_COMPANY,
        payload: skip
    })
}