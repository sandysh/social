$( document ).ready(function(){
	$('.modal').modal();
	$(".button-collapse").sideNav();
	$(".dropdown-button").dropdown();

	$('#task').on('click',function(){
		$('#modal1').modal('open');
		//$('#add-task').hide();
	});	
});
