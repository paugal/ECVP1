var server = null;
var location_server = "wss://ecv-etic.upf.edu/node/9000/ws";
var room_name = "PauGGRoom";
var userId = '';
var userName = '';

var msgs =[
	{
		type: 'text',
		content: 'Holaa',
		username: 'paugal'
	}
];
//connect to the server
server = new SillyClient();
server.connect( location_server , room_name);
//this method is called when the user gets connected to the server
server.on_ready = function( my_id )
{
	console.log(my_id);
	userId = my_id;
}

server.on_connect = function( server ){
    
};

function onMessageReceived( author_id, str_msg )
{
  displayMsg(str_msg, author_id);
}

server.on_message = onMessageReceived;

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
	userName =  document.getElementById("userid").value;
	console.log(userId);
}

function setNameTitle(){
	document.getElementById("nameTitle").innerHTML = room_name +'/' + userName;
}

function pushMsg(){
	var msgtext = document.getElementById("inputMsg").value;
	msgs.push(['text', msgtext,userName]);
	document.getElementById("inputMsg").value = '';
	displayMsg(msgtext, userName);
	server.sendMessage(msgtext);
}

function displayMsg(msgtext, userNameMsg){
	var div = document.createElement("div");
	div.classList.add('chattext');
	if( userNameMsg == userName){
		div.classList.add('send');
		div.textContent = msgtext;
	}else{
		div.classList.add('receive');
		div.textContent = userName + ": " + msgtext;
	}
	document.getElementById("chat").appendChild(div);
}