import Vue from 'vue'
import Vuex from 'vuex'
// modules
import tasks from './modules/tasks.js'
import * as actions from './actions.js'
import * as getters from './getters.js'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    actions,
    getters, 
    modules: {
        tasks,        
    },
    strict: debug,
})