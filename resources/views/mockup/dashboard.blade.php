@extends('mockup.master')

@section('content')


  <nav id="add-task">
    <div class="nav-wrapper white">
      <form>
        <div class="input-field">
          <input id="task" type="search" placeholder="type a task here" required>
          <i class="material-icons">close</i>
        </div>
      </form>
    </div>
  </nav>

  <!-- Modal Structure -->
  <div id="modal1" class="modal taskModal">
    <div class="modal-fixed-header">
      <h4>New Task</h4>
     </div>
    <div class="modal-content">
      <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s12">
                <input placeholder="" id="first_name" type="text" class="validate">
                <label for="first_name">Title</label>
              </div>
              </div>
            <div class="row">
              <div class="input-field col s12">
                <input id="last_name" type="text" class="validate">
                <label for="last_name">Tags</label>
              </div>
            </div>
            <div class="row">
            <label for="priority">Priority</label>
                <p>
                    <input class="with-gap" name="group3" type="radio" id="test5" checked />
                    <label for="test5">High</label>
                  </p>
                  <p>
                    <input class="with-gap" name="group3" type="radio" id="test5" checked />
                    <label for="test5">Moderate</label>
                  </p>
                  <p>
                    <input class="with-gap" name="group3" type="radio" id="test5" checked />
                    <label for="test5">Low</label>
                  </p>
            </div>
            <div class="row">
               <div class="input-field col s12">
                 <i class="material-icons prefix">mode_edit</i>
                 <textarea id="icon_prefix2" class="materialize-textarea"></textarea>
                 <label for="icon_prefix2">Notes</label>
               </div>
            </div>

          </form>
        </div>
    </div>
    <div class="modal-footer">
      <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Add</a>
      <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Discard</a>
    </div>
  </div>
        

@endsection