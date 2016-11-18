import Vue from 'vue';

Vue.directive('char-counter', {
    inserted (el) {
        $(el).characterCounter();
    }
});
