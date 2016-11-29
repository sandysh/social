<?php
/**
 * Author: Laravel
 * Date:   2016-09-17 23:06:40
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 03:13:45
 */
$router->group(['prefix' => 'v1', 'namespace' => 'Api\V1'], function () use ($router)
{
    $router->post('auth/login', 'AuthController@login');
    $router->post('auth/register', 'AuthController@register');
    $router->get('auth/refresh', ['middleware' => 'jwt.refresh', function(){}]);

    $router->group(['middleware' => ['jwt.auth']], function () use ($router) {
        $router->get('auth/user', 'UserController@user');
    });

    $router->resource('companies', 'CompanyController');
});
