// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAHUqBtYrYj5odUsdFsyyJlMG4ZJmLslC4",
    authDomain: "concession-helper.firebaseapp.com",
    databaseURL: "https://concession-helper.firebaseio.com",
    storageBucket: "concession-helper.appspot.com",
    messagingSenderId: "899989255789"
  };
  firebase.initializeApp(config);

var server = null;
var total = 0;
var database = firebase.database();
var servers = [];
var menuItems = [];
var order = [];
var tempOrder = [];
var removeRow;
var removeId;
var timeoutId = 0; //taphold to remove
var menuBtnCnt = 0;

var get = {

	servers: function(){ //gets server names from Firbase and fills selection box
		
		var getServers = database.ref('servers');

		getServers.on('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
			    var childData = childSnapshot.val();
			    
			    servers.push(childData);
			});

		    $.each(servers, function(val, text) {
	    		$('#server').append(
	        		$('<option></option>').html(text)
			    );
			});
		});
	},
	menu: function(){ //gets menu information from Firbase and generates the menu items
		var getMenu = database.ref('menu');

		getMenu.on('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
			    var childData = childSnapshot.val();
			    
			    menuItems.push(childData);
			});

		    for ( var i=0; i<menuItems.length;i++){
		    	
		    	
		    	var image = $('<img />', { 
				 src: menuItems[i].pic,
				 alt: menuItems[i].name,
				 class: 'menuBtn',
				 'data-id': [i]

				});

		    	var div = $('<div >',{
  				 id: menuItems[i].name,
  				 class: 'menuBtns col-xs-4 col-sm-2 col-md-2 col-lg-2',
  				 html: '<div class="price">' + "$" + menuItems[i].price + '</div>'
				});

				image.appendTo(div);

				div.appendTo('#menu');

		    }
		});
	}
}

function renderTable(){
	$('#tbody').empty();

	for (var i=0; i<menuBtnCnt; i++){
		if (order.hasOwnProperty([i])){
			
		$('#menu-item > tbody:last-child').append(
            '<tr data-id='+ order[i].id +'>'
            +'<td class="item">'+order[i].name+'</td>'
            +'</tr>' 
        )};
	}
	calculateTotal();
	setList();
}

var totalMoneyDueForOrder = 0;


function calculateTotal(){
	total = 0 
	for (var i=0; i < order.length; i++ ){
		total = (order[i].price + total)
	}
	
	totalMoneyDueForOrder = total;

	$('.moneyUnderline').html("$" + total.toFixed(2));
}

function pressHold(){ //This function removes the item from order.array
	                 
	for (var i=0; i<(menuBtnCnt+1);i++){
		 //check to make sure key exists  
		if (order.hasOwnProperty([i])){
 			
 			var checkNum = order[i].id 

			if (checkNum == removeID){
				
				 order.splice(i,1);
				 renderTable();
				 calculateTotal();
				 return
				
			}
		}
	}
	
}

function clearOrder(){

	order = [];
	$('#tbody').empty();
	menuBtnCnt = 0;
	total = 0;
	$('.moneyUnderline').html("$" + total);

}

function setList(){
	Pressure.set('.item', {
		start: function(event){

			},
		end: function(){

			},
		startDeepPress: function(event){
		 $(this).css("background-color", "orange")
			},
		endDeepPress: function(){
			removeRow = $(this).parent();
			removeID  = ($(this).parent().attr('data-id'));
		pressHold();
			},
		change: function(force, event){
			},
		unsupported: function(){
			}
});}


/*
Start 
*/
$( document ).ready(function() {
	$("#setServer").hide();
});

$("#setServer").hide();
get.servers();
get.menu();


var interval = setInterval(function(){
  if ($('#server > option').length > 1){
  	$("#setServer").show();
  	clearInterval(interval);
      }

}, 500);




window.onbeforeunload = function() {
	return 'You will lose any unsaved changes you may have made';
}

/*
Clicks
*/

//Set server button
$(document).on('click', '#setServer', function() {

	event.preventDefault();

	if ( $('#server').val() != '' ) {

		server = $('#server').val();
		
		//hide current visible window
		
		$( ".serverSelection").fadeOut( 300, function() {
    		
	    	$('.serverSelection').remove();
	    	$(".serverBody").css("background-color", "white");
			$('.menuItems, .currentOrder').fadeIn("slow");
			
 		});
	
	}
	
	else{
		//Now server set
	}
	
});

//Submit order to Firebase
$(document).on('click', '#submitOrder', function() {

	
		$("#submitOrder").hide();

		for (var i=0; i<order.length;i++){ //Removed extra data before sending order
		
			tempOrder.push({ 
			"name": order[i].name, "price": order[i].price
			});

		}
		
		database.ref().child('orders').child(moment().format("M[-]D[-]YY")).push({

		        order: tempOrder,
		        server: server,
		        status: "active",
		        timeAdded: firebase.database.ServerValue.TIMESTAMP
		});

		menuBtnCnt = 0;
		order = []
		tempOrder = []
		clearOrder();

		$("#result").html("$" + total);
	       $(firstNumber).empty();
	   
});

//Menu item button click
$(document).on('click', '.menuBtn', function() {
	var item = $(this).attr("data-id")
	var dataId = menuBtnCnt;
	
	menuBtnCnt++;
		
	//TODO make sure data-id isn't alreadu used.
	    
	total = (total + menuItems[item].price);
	$('.moneyUnderline').html("$" + total);
	
	
	order.push({ 
		"name": menuItems[item].name, "price": menuItems[item].price, "id": dataId 
		});

	renderTable();


	

});



$(document).on('click', '.continueBtn', function() {
	if (total > 0){
     $('#myModal').modal();
     $("#result").html("$" + total.toFixed(2)); 
     $(".amtRemain").html("They owe you $" + total.toFixed(2));
       $('.moneyUnderline').html("$" + total.toFixed(2));
   }
    
});


$(document).on("click", ".cancelBtn", function(){
	
	var r = confirm("Are you sure you want to cancel your order?");
	if (r == true) {
	    clearOrder()
	} else {
	    
	}
});




//CACULATOR CODE 

// Make our variables global to the runtime of our application
// var totalNumber;
     var firstNumber = 0;

// Function initialized calculator
// When the user hits clear, we guarantee a reset of the app

     function initializeCalculator() {
       firstNumber = 0;

       // $(".number, .operator, #result").empty();
       $("#result").html(total.toFixed(2));
     };

     //initializeCalculator();

     function showTotal() {

	// Use parseInt to convert our string representation of numbers into actual integers
	//Calculate the results on Click
       // firstNumber = parseFloat(firstNumber);

       totalMoneyDueForOrder -= firstNumber;

       if (totalMoneyDueForOrder < 0) {

       $(".amtRemain").html("You owe them $" + Math.abs(totalMoneyDueForOrder).toFixed(2));
       $(".modal-footer").html("<button type='button' id='submitOrder' class='btn btn-default btn-success calcSubmit' data-dismiss='modal'>Submit</button>");

       } else {

       $(".amtRemain").html("They owe you $" + (Math.abs(totalMoneyDueForOrder)).toFixed(2));
       firstNumber = 0;

       };

     };

showTotal();


// Add an on click listener to all elements that have the class "number"
     $(document).on("click", ".number", function() {

         firstNumber = this.value;

         showTotal();

     });

     
// CLEAR BUTTON Add an on click listener to all elements that have the class "clear"
     $(document).on("click", "#button-clear", function(){
// Call initializeCalculater so we can reset the state of our app

       $(".amtRemain").html("They owe you $" + total.toFixed(2));
       firstNumber= 0;

       $(firstNumber, totalMoneyDueForOrder).empty();
       firstNumber=0
       totalMoneyDueForOrder = total
       $(".calcSubmit").remove();
     });



    initializeCalculator();



/*
Testing
*/


