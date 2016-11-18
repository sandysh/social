import Tasks from './components/Tasks.vue';
import News from './components/pages/News.vue';
import Teams from './components/pages/Teams.vue';
import Login from './components/pages/Login.vue';
import Events from './components/pages/Events.vue';
import Dashboard from './components/Dashboard.vue';
import Projects from './components/pages/Projects.vue';
import Messages from './components/pages/Messages.vue';
import Error404 from './components/pages/errors/Error404.vue';

export default [
    {
        path: '/',
        name: 'dashboard',
        meta: { auth: true },
        component: Dashboard,
        children: [
            {
                path: '/',
                name: 'tasks',
                component: Tasks
            },
            {
                path: '/news',
                name: 'news',
                component: News
            },
            {
                path: '/messages',
                name: 'messages',
                component: Messages
            },
            {
                path: '/events',
                name: 'events',
                component: Events
            },
            {
                path: '/teams',
                name: 'teams',
                component: Teams
            },
            {
                path: '/projects',
                name: 'projects',
                component: Projects
            },
        ]
    },
    {
        path: '/login', 
        name: 'login',
        meta: {auth: false},
        component: Login
    },
    {
        path: '*',
        name: '404',
        component: Error404
    }
]