<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Login - Social Tasking</title>

    <!-- Fonts -->
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">


<!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="/css/materialize.css">

  <style type="text/css" media="screen">
    body{
      background: url(images/background.jpg);
      width: 100%;
      height: 100vh;
    }
    
    .brand{
    position: absolute;
    top: 40px;
    background: teal;
    padding: 10px;
    left: 42%;
    right: 42%; 
  }

  .new-ac{
    background: #26a69a;
    color: white;
    padding: 5px;
  }

  </style>

</head>
<body>
    
    <main>
      <center>
        <div class="section"></div>

        <div class="section row">
                <h5 class="brand white-text">Social-Tasking</h5>
        </div>

        <div class="container">
          <div class="z-depth-3 grey lighten-4 row" style="display: inline-block; padding: 32px 48px 0px 48px; border: 1px solid #EEE;">
            <form class="col s12" method="post" action="/api/v1/login">
              <div class='row'>
              </div>

              <div class='row'>
                <div class='input-field col s12'>
                  <input class='validate' type='email' name='email' id='email' />
                  <label for='email'>Enter your email</label>
                </div>
              </div>

              <div class='row'>
                <div class='input-field col s12'>
                  <input class='validate' type='password' name='password' id='password' />
                  <label for='password'>Enter your password</label>
                </div>
                <label style='float: right;'>
                  <a class='pink-text' href='#!'><b>Forgot Password?</b></a>
                </label>
              </div>

              <br />
              <center>
                <div class='row'>
                  <button type='submit' name='btn_login' class='col s12 btn btn-large waves-effect teal'>Login</button>
                </div>
              </center>
            </form>
          </div>
        </div>
        <a href="#!" class="new-ac">Create account</a>
      </center>

      <div class="section"></div>
      <div class="section"></div>
    </main>




    <!-- JavaScripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js" integrity="sha384-I6F5OKECLVtK/BL+8iSLDEHowSAfUo76ZL9+kGAgTRdiByINKJaqTPH/QVNS1VDb" crossorigin="anonymous"></script>
    <!-- Compiled and minified JavaScript -->
   <script src="/js/materialize.js"></script>
  
</body>
</html>
