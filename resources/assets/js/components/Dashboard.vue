<template>
    <div>

        <div class="row" v-if="(companies.length || settings.skip) && $auth.ready()">
            <navbar></navbar>
            <leftbar></leftbar>

            <div class="col s12 m5 l7" style="overflow-y:scroll; height: 100vh">
                <router-view></router-view>
            </div>

            <rightbar></rightbar>
        </div>

        <div v-else>
            <company-creator></company-creator>
        </div>

        <div id="uncheckTask" class="modal">
            <div class="modal-content">
                <h4>Uncheck this task ?</h4>
                <p>Are you sure, you want to re-work on this task ?</p>
                </div>
                <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Yep</a>
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Leave it checked</a>
            </div>
        </div>
    </div>
</template>

<script>
    import Navbar from './Navbar.vue';
    import Leftbar from './Leftbar.vue';
    import Rightbar from './Rightbar.vue';
    import CompanyCreator from './sub-components/CompanyCreator.vue';
    import { mapGetters } from 'vuex';

    export default {
        name: "Dashboard",
        data () {
            return {
                settings: {},
                tasks: []
            }
        },
        computed: {
            companies () {
                return this.$auth.user().companies;
            }
        },
        mounted () {
            let settings = localStorage.getItem('settings');
            
            if (!settings) {
                settings = {
                    company: {
                        skip: false
                    }
                };
            }else {
                settings = JSON.parse(settings);
            } 

            console.log(settings);

            this.settings = settings;

            settings = JSON.stringify(settings);

            localStorage.setItem('settings', settings);
        },
        components: {Navbar, Leftbar, Rightbar, CompanyCreator}
    }
</script>