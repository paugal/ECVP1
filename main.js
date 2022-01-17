var server = null;
var location_server = "wss://tamats.com:55000";
var room_name = "PauGGRoom";
var userId = '';
var DB ={
	msgs: [
		{type = 'text',
		content = 'hello',
		username = 'paugal'},
	]
}
//connect to the server
server = new SillyClient();
server.connect( location_server , room_name);
//this method is called when the user gets connected to the server
server.on_ready = function( my_id )
{
	console.log(my_id);
}

server.on_connect = function( server ){
    
};

function enterChat(){
	const validation = document.getElementById("userid");
	if (validation.checkValidity()) {
		var loginBox = document.getElementById("loginBox");
		var chatBox = document.getElementById("allApp");

		loginBox.style.display = 'none';
		chatBox.style.display = 'inline';
	}
}

function getUserId(){
	userId =  document.getElementById("userid").value;
	console.log(userId);
}

function setNameTitle(){
	document.getElementById("nameTitle").innerHTML = room_name +'/' + userId;
}