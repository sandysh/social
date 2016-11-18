import {SKIP_CREATE_COMPANY} from '../mutation-types.js';

let settings = localStorage.getItem('settings');

if(!settings) {
    settings = {
        company: {
            skip: false
        }
    };
} else {
    settings = JSON.parse(settings);
}

const state = settings;

function saveSettings (settings) {
    settings = JSON.stringify(settings);

    localStorage.setItem('settings', settings);
}

const mutations = {
    [SKIP_CREATE_COMPANY] (state, {payload}) {
        state.company.skip = payload;
        saveSettings(state);
    }
}

export default {
    state,
    mutations
}