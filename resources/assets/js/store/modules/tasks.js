import {SET_TASKS, ADD_TASK, UPDATE_TASK, DELETE_TASK, LOADING_TASK} from '../mutation-types.js';

const state = {
    all: [],
    loading: {
        create  : false,
        read    : true,
        update  : false,
        delete  : false
    }
};

const mutations = {
    [SET_TASKS] (state, {payload}) {
        state.all = payload
    },
    [ADD_TASK] (state, {payload}) {
        state.all.push(payload)
    },
    [UPDATE_TASK] (state, {payload}) {
        for (var i = state.all.length - 1; i >= 0; i--) {
            if(state.all[i].id === payload.id){
                state.all.$set(i, payload)
                break;
            }
        }
    },
    [DELETE_TASK] (state, {payload}) {
        state.all.$remove(payload)
    },
    [LOADING_TASK] (state, {payload}) {
        if(payload.hasOwnProperty('create')) state.loading.create = !! payload.create;
        if(payload.hasOwnProperty('read')) state.loading.read = !! payload.read;
        if(payload.hasOwnProperty('update')) state.loading.update = !! payload.update;
        if(payload.hasOwnProperty('delete')) state.loading.delete = !! payload.delete;
    }
}

export default {
    state,
    mutations
}