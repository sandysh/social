<template>
    <nav>
        <div class="nav-wrapper">
            <a href="#!" class="brand-logo">Social Tasking</a>
            <ul class="right hide-on-med-and-down">
                <li><a href="sass.html"><i class="material-icons">search</i></a></li>
                <li><a href="#!"><i class="material-icons">refresh</i></a></li>
                <li>
                    <select class="browser-default transparent" style="margin-top:10px">
                        <option>Project 1</option>
                        <option>Project 2</option>
                        <option>Project 3 </option>
                    </select>
                </li>
                <li><a href="#!">company name</a></li>
                <li>
                    <a class="dropdown-button" href="#!" data-activates="dropdown1">sandesh satyal<i class="material-icons right">arrow_drop_down</i></a>
                    <ul id="dropdown1" class="dropdown-content">
                        <li><a href="#!">one</a></li>
                        <li><a href="#!">two</a></li>
                        <li class="divider"></li>
                        <li><a href="#!">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
    export default {
        name: 'Navbar',
        data () {
            return {}
        }
    }
</script>