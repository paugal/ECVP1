
//VARIABLES GLOBALES
var server = null;
var location_server = "wss://ecv-etic.upf.edu/node/9000/ws";
var room_name = "PauGGRoom/";
var selectedRoom = "Principal";
var userId = '';
var userName = '';
var users = [
	{
		userid: '0',
		username: 'pauGalan'
	}
]
var msgs =[
	{
		type: 'text',
		content: 'Holaa',
		username: 'paugal'
	}
];

var msg = {
	type: "history",
	content: [
		{
			type: "text",
			username: "foo",
			content: "..."
		}		
	]
};



//INICIO DE CONECXION
server = new SillyClient();



server.on_ready = function( my_id )
{
	console.log(my_id);
	userId = my_id;
}

server.on_connect = function( server ){
};
function selectRoom(roomName){

}

function enterChat(){
	const validation = document.getElementById("useridInput");
	if (validation.checkValidity()) {
		var loginBox = document.getElementById("loginBox");
		var chatBox = document.getElementById("allApp");

		loginBox.style.display = 'none';
		chatBox.style.display = 'inline';
		try {
			selectedRoom = document.querySelector('input[name="roomselector"]:checked').value;
			server.connect( location_server , room_name + selectedRoom);
		} catch (error) {
			selectedRoom = 'Principal';
			server.connect( location_server , room_name + selectedRoom);
		}
		setNameTitle();
		
	}
}

function getUserName(){
	userName =  document.getElementById("useridInput").value;
	enterChatMsg()
}

function setNameTitle(){
	console.log(selectedRoom)
	document.getElementById("nameTitle").innerHTML = selectedRoom;
}

function enterChatMsg(){
	var enterMsg = {type: 'enter', username: userName,content: null}
	var msg_str = JSON.stringify( enterMsg );
	server.sendMessage(msg_str);
}

//RECEPCION DE MENSAJES
server.on_message = onMessageReceived;

function onMessageReceived( authorId, data )
{
	var msgData = JSON.parse(data);
	if(msgData.type == 'text'){
		receiveTextMsg(msgData);
	}else if(msgData.type == 'enter'){
		newUserChat(msgData);
	}
	
}

function receiveTextMsg(msgData){
	displayMsg(msgData.username, msgData.content);
}

function newUserChat(msgData){
	var div = document.createElement("div");
	div.classList.add('chattext');
	div.classList.add('enter');
	div.textContent = "El usuario " + msgData.username + " acaba de conertarse.";
	document.getElementById("chat").appendChild(div);

}


//ENVIO DE MENSAJES
function pushMsg(){
	var msgtext = document.getElementById("inputMsg").value;
	var msgAux = {type:'text', username: userName, content: msgtext};
	msgs.push(msgAux);
	document.getElementById("inputMsg").value = '';

	//mostramos nuestro mensaje
	displayMsg(userName, msgtext);

	//Convertimos el objeto en string
	var msg_str = JSON.stringify( msgAux );
	server.sendMessage(msg_str);
}

function displayMsg(userNameMsg, msgtext){
	var div = document.createElement("div");
	div.classList.add('chattext');
	if( userNameMsg == userName){
		div.classList.add('send');
		div.textContent = msgtext;
	}else{
		div.classList.add('receive');
		div.textContent = userNameMsg + ": " + msgtext;
	}
	document.getElementById("chat").appendChild(div);
}




//EXTRAS


//FUNCIONES PARA PODER ENVIAR CON ENTER EN LAS CAJAS DE TEXTO
function ClientOnTyping(inputElement, elementBtn){
	console.log('Typing...');
	var input = document.getElementById(inputElement);
	// Execute a function when the user releases a key on the keyboard
	input.addEventListener("keyup", buttonWithEnter(event, elementBtn));
}

function buttonWithEnter(event, elementBtn) {
	// Number 13 is the "Enter" key on the keyboard
	if (event.keyCode === 13) {
	  // Cancel the default action, if needed
	  event.preventDefault();
	  // Trigger the button element with a click
	  document.getElementById(elementBtn).onclick();
	}
}
