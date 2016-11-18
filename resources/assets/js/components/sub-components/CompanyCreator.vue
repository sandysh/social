<template>
    <div class="row">
        <div class="col s12 m7">
            <form @submit.prevent="submit" autocomplete="off">
                <div class="card horizontal">
                    <div class="card-stacked">
                        <h2 class="card-header"><i class="material-icons">business</i> Create Company</h2>
                        <div class="card-content">
                            <div class="row">
                                <notification type="indigo lighten-1" message="Field marked <strong>(*)</strong> are required."></notification>
                                <div class="input-field col s12">
                                    <input id="company-name" type="text" v-model="company.name">
                                    <label for="company-name" class="required">Name</label>
                                </div>
                            </div>
                            <div class="row">
                                <div class="input-field col s12">
                                    <textarea id="company-description" class="materialize-textarea" v-char-counter length="160" v-model="company.description"></textarea>
                                    <label for="company-description" class="required">Description</label>
                                </div>
                            </div>
                        </div>
                        <div class="card-action">
                            <div class="col s12">
                                <button type="submit" class="waves-effect waves-light btn-flat teal white-text" :disabled="loading">
                                    <loader v-if="loading"></loader>
                                    <span v-else>
                                        <i class="material-icons left">cloud</i> Save
                                    </span>
                                </button>

                                <button type="button" @click.prevent="skip()" class="waves-effect waves-light btn-flat right"><i class="material-icons right">skip_next</i>Skip</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CompanyCreator',
        data () {
            return {
                company: {name: '', description: ''},
                errors: {},
                loading: false
            }
        },
        methods: {
            submit () {
                this.loading = true;
                this.$http.post('companies', this.company)
                    .then(handleSuccess, handleFail)
                    .catch(handleError);

                function handleSuccess({body: {data}}) {
                    this.loading = false;
                    let user = this.$auth.user();
                    user.companies.push(data);
                }

                function handleFail(res) {
                    this.loading = false;
                    console.log(res)
                }

                function handleError(error) {
                    console.warn(error)
                }
            },
            skip () {
                let settings = localStorage.getItem('settings');
                settings = JSON.parse(settings);
                console.log(settings);
                settings.company.skip = true;

                //localStorage.setItem('settings', settings);
            }
        }
    }
</script>