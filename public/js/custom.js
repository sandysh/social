$( document ).ready(function(){
	
	$(".button-collapse").sideNav();
	$(".dropdown-button").dropdown();

	$('#task').on('click',function(){
		$('#modal1').openModal();
		// $('#add-task').hide();
	});
	
});
