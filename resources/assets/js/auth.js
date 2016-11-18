export default {
    rolesVar: 'roles',
    // loginData: {url: 'api/v1/auth/login', method: 'POST', redirect: '/'},
    // fetchData: {url: 'api/v1/auth/user', method: 'GET'}
    /*bearerAuth: {
        request (req, token) {
            this.options._setHeaders.call(this, req, {Authorization: 'Bearer ' + token});
        },
        response (res) {
            let token = this.options._getHeaders.call(this, res).Authorization;

            if (token) {
                token = token.split('Bearer ');

                return token[token.length > 1 ? 1 : 0];
            }

            token = res.body.token;

            if (token && token.length) {
                return token
            }
        }
    },*/
}