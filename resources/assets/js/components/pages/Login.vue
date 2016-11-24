<style>
    html, body {
        height: 100%;
    }

    body {
        background: url(/images/background.jpg);
    }

    .main-login {
        height: 100%;
        width: 100%;
        display: table;
    }

    .brand{
        position: relative;
        background: teal;
        padding: 5px 30px;
        top: -50px;
    }

    .login-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .login-container {
        width: 450px;
        margin: 0 auto;
    }
    .register-link {
        padding: 5px;
    }
</style>
<template>
    <div class="main-login">
        <div class="login-wrapper">
            <div class="login-container">
                <div class="card z-depth-3 grey lighten-4">
                    <div class="card-content">
                        <div class="center">
                            <span class="card-title brand white-text">Social-Tasking</span>
                        </div>
                        <form method="post" action="/api/v1/login" @submit.prevent="authenticate">
                            <div class='row'>
                                <div class='input-field col s12'>
                                    <input class='validate' type='email' name='email' v-model="credentials.email"/>
                                    <label for='email' class="_center">Enter your email</label>
                                </div>
                            </div>

                            <div class='row'>
                                <div class='input-field col s12'>
                                    <input class='validate' type='password' name='password' v-model="credentials.password"/>
                                    <label for='password' class="_center">Enter your password</label>
                                </div>
                                <label class="right">
                                    <router-link to="/forgot-password" class="pink-text">
                                        <strong>Forgot Password?</strong>
                                    </router-link>
                                </label>
                            </div>
                            <div class='row'>
                                <button type='submit'
                                    class='col s12 btn btn-large waves-effect teal'
                                    :disabled="loading"
                                >
                                    <loader v-if="loading" style="width:auto" color="grey"></loader>
                                    <span v-else>Login</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="center">
                    <router-link to="/register" class="white-text teal lighten-1 register-link">Create account</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Login",
    data () {
        return {
            loading: false,
            credentials: {
                email: 'ptrantow@example.com',
                password: 'password',
            }
        }
    },

    methods: {
        authenticate () {
            if(this.loading) return;

            this.loading = true;

            this.$auth.login({
                body: this.credentials,
                success (response) {
                    this.loading = false;
                    console.log(response);
                },
                error (response) {
                    this.loading = false;
                    console.log(response);
                },
                rememberMe: true
            });        
        }
    },
 }
</script>