<template>
    <div>
        <h1>404 Error: <small>Resource Not Found</small></h1>
        <p>Go Home: <router-link :to="{name: 'tasks'}">click here</router-link></p>
    </div>
</template>

<script>
    export default {
        name: 'Error404'
    }
</script>