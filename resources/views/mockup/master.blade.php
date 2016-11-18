<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Dashboard - Social Tasking</title>

    <!-- Fonts -->
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>


<!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="/css/materialize.css">
  <link rel="stylesheet" href="/css/style.css">

</head>
<body>

<!-- Navbar goes here -->

 <ul id="dropdown1" class="dropdown-content">
   <li><a href="#!">one</a></li>
   <li><a href="#!">two</a></li>
   <li class="divider"></li>
   <li><a href="#!">three</a></li>
 </ul>

   <nav>
     <div class="nav-wrapper blue lighten-1">
       <a href="#!" class="brand-logo">Social Tasking</a>
       <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>
       <ul class="right hide-on-med-and-down">
         <li><a href="#!" class="dropdown-button" data-activates="dropdown1"><img src="images/yuna.jpg" alt="" class="circle responsive-img right">Hi! Sandesh</a></li>
       </ul>
       <ul class="side-nav" id="mobile-demo">
         <li><a href="sass.html">Sass</a></li>
         <li><a href="badges.html">Components</a></li>
         <li><a href="collapsible.html">Javascript</a></li>
         <li><a href="mobile.html">Mobile</a></li>
         <!-- <li><a class="dropdown-button" href="#!" data-activates="dropdown1">Dropdown<i class="material-icons right">arrow_drop_down</i></a></li>
-->     </ul>
     </div>
   </nav>

<!-- Page Layout here -->
<div class="row">



  <div class="col s12 m4 l3"> <!-- Note that "m4 l3" was added -->
    <!-- Grey navigation panel

          This content will be:
      3-columns-wide on large screens,
      4-columns-wide on medium screens,
      12-columns-wide on small screens  -->

      <ul id="nav-mobile" class="side-nav fixed" style="transform: translateX(0px);">
        <li class="bold"><a href="about.html" class="waves-effect waves-teal">All Tasks</a></li>
        <li class="divider"></li>
        <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal">Filters</a></li>
        <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal"><i class="material-icons dp48">add_alert</i>Priority</a></li>
        <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal"><i class="material-icons dp48">perm_contact_calendar</i>Today</a></li>
        <li class="bold"><a href="http://materializecss.com/mobile.html" class="waves-effect waves-teal">Done</a></li>
        <li class="bold"><a href="http://materializecss.com/mobile.html" class="waves-effect waves-teal">Deleted</a></li>
      </ul>

  </div>

  <div class="col s12 m8 l9 col offset-l3"> <!-- Note that "m8 l9" was added -->

    <div class="container new-wrapper">
            
          @yield('content')

    </div>

  </div>

</div>
            


    <!-- JavaScripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js" integrity="sha384-I6F5OKECLVtK/BL+8iSLDEHowSAfUo76ZL9+kGAgTRdiByINKJaqTPH/QVNS1VDb" crossorigin="anonymous"></script>
    <!-- Compiled and minified JavaScript -->
   <script src="/js/materialize.js"></script>
  <script src="/js/custom.js"></script>
</body>
</html>
