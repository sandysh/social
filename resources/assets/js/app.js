import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import VueAuth from '@websanova/vue-auth';

Vue.use(VueRouter);
Vue.use(VueResource);

require('./directives.js');
require('./components.js');

import App from './components/App.vue'
import routes from './routes.js';
import store from './store/store.js';
import auth from './auth.js';

Vue.config.silent = false;
Vue.config.devtools = true;
Vue.http.options.root = '/api/v1';
const router = new VueRouter({routes, linkActiveClass: 'active', base: __dirname});

Vue.use(VueAuth, {
    router: router,
    http: Vue.http,
    ...auth
});

const app = new Vue({ router, store, ...App }).$mount('#app');

window.app = app;
/*
const router = new VueRouter({routes});

new Vue({
    name: 'SocialTask',
    store: store,
    router: router,
    render (c) {
        return c('div',{},[
            c('router-view')
        ]);
    } 
}).$mount('#app');
 */