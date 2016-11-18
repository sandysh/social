<style>
body {
    /*background: url('images/background.jpg');*/
    width: 100%;
    height: 100vh;
}

.brand {
    position: absolute;
    top: 40px;
    background: teal;
    padding: 10px;
    left: 42%;
    right: 42%; 
}

.new-ac {
    background: #26a69a;
    color: white;
    padding: 5px;
}
</style>
<template>
    <div>
        <div class="section"></div>
        <div class="main">
            <center>
                <div class="section"></div>
                <h5 class="indigo-text">Please, login into your account</h5>
                <div class="section"></div>

                <div class="container">
                    <div class="z-depth-1 grey lighten-4 row" style="display: inline-block; padding: 32px 48px 0px 48px; border: 1px solid #EEE;">

                        <form class="col s12" method="post" action="/api/v1/login">
                            <div class='row'>
                                <div class='col s12'></div>
                            </div>

                            <div class='row'>
                                <div class='input-field col s12'>
                                    <input class='validate' type='email' name='email' id='email' v-model='credentials.email' />
                                    <label for='email'>Enter your email</label>
                                </div>
                            </div>

                            <div class='row'>
                                <div class='input-field col s12'>
                                    <input class='validate' type='password' name='password' id='password' v-model="credentials.password" />
                                    <label for='password'>Enter your password</label>
                                </div>
                                <label style='float: right;'>
                                    <a class='pink-text' href='#!'><b>Forgot Password?</b></a>
                                </label>
                            </div>

                            <br />
                            <center>
                                <div class='row'>
                                    <button @click.prevent = "authenticate()" type='submit' name='btn_login' class='col s12 btn btn-large waves-effect indigo'>{{loading ? 'Loading' : 'Login'}}</button>
                                </div>
                            </center>
                        </form>
                   </div>
                </div>
                <a href="#!">Create account</a>
            </center>
            <div class="section"></div>
            <div class="section"></div>
        </div>
    </div>
</template>

<script>
module.exports = {
    name: "Login",
    data: function () {
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