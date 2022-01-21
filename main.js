   
//VARIABLES GLOBALES


var server = null;
var location_server = "wss://ecv-etic.upf.edu/node/9000/ws";
var room_name = "PauGGRoom/";
var selectedRoom = "Principal";
var userId = '';
var userName = '';
var avatarImg = '';

var usersOnline = {
	type: 'activeUsers',
	content:
	[{
		userid: '',
		username: '',
		avatar: ''
	}]
};

var msgs =[
	{
		type: 'text',
		username: 'paugal',
		content: 'Holaa'
	}
];

var msg = {
	type: "history",
	content: []
};



//INICIO DE CONECXION
server = new SillyClient();

server.on_ready = function( my_id )
{
	userId = my_id;
	usersOnline.content[0] = {userid: userId, username: userName, avatar: avatarImg}
}

server.on_connect = function( server )
{
	setNameTitle();
	enterChatMsg();
};


function enterChat()
{
	const validation = document.getElementById("useridInput");
	if (validation.checkValidity()) {
		var loginBox = document.getElementById("loginBox");
		var chatBox = document.getElementById("allApp");

		loginBox.style.display = 'none';
		chatBox.style.display = 'inline';
		selectedRoom = document.querySelector('input[name="roomselector"]:checked').value;
		avatarImg = document.querySelector('input[name="avatar"]:checked').value;
		server.connect( location_server , room_name + selectedRoom);
	}
}

function getUserName()
{	
	userName =  document.getElementById("useridInput").value;
}

function setNameTitle()
{
	console.log(selectedRoom)
	document.getElementById("nameTitle").innerHTML = selectedRoom;
}

function enterChatMsg()
{
	var enterMsg = {type: 'enter', userid: userId, username: userName, avatar: avatarImg}
	var msg_str = JSON.stringify( enterMsg );
	server.sendMessage(msg_str);
}

function leaveChat(){
	var enterMsg = {type: 'leave', userid: userId, username: userName, avatar: avatarImg}
	var msg_str = JSON.stringify( enterMsg );
	server.sendMessage(msg_str);
	var loginBox = document.getElementById("loginBox");
	var chatBox = document.getElementById("allApp");
	loginBox.style.display = 'block';
	chatBox.style.display = 'none';
}

//RECEPCION DE MENSAJES
server.on_message = onMessageReceived;

function onMessageReceived( authorId, data )
{
	var msgData = JSON.parse(data);
	if(msgData.type == 'text'){
		receiveTextMsg(msgData);
	}else if(msgData.type == 'enter'){
		newUserChat(msgData, authorId);
	}else if(msgData.type == 'history'){
		loadHistory(msgData);
	}else if(msgData.type == 'activeUsers'){
		loadActiveUsers(msgData);
	}else if((msgData.type == 'leave')){
		userOffline(msgData);
	}
	
}



function receiveTextMsg(msgData){
	displayMsg(msgData.username, msgData.content);
	pushReceiveMsg(msgData.type, msgData.username, msgData.content )
}

function newUserChat(msgData, authorId)
{
	//Creamos un mensaje diferente ara indicar que alguien se ha conectado
	var div = document.createElement("div");
	div.classList.add('chattext');
	div.classList.add('enter');
	div.textContent = "El usuario " + msgData.username + " acaba de conertarse.";
	document.getElementById("chat").appendChild(div);

	sendHistory(authorId);
	sendUsersOnline(authorId);
	
	//Añadimos el nuevo usuario a la lista de conectados
	usersOnline.content.push({userid:authorId, username: msgData.username, avatar: msgData.avatar})
	displayActiveUsers();
}
function userOffline(userData){
	var div = document.createElement("div");
	div.classList.add('chattext');
	div.classList.add('leave');
	div.textContent = "El usuario " + userData.username + " acaba de desconertarse.";
	document.getElementById("chat").appendChild(div);
	
	//Eliminamos al usuario de la lista
	var index = usersOnline.content.findIndex(i => i.userid === userData.userid)
	if (index > -1) {
		usersOnline.content.splice(index, 1);
		document.getElementById(userData.userid).remove();
	}

	

	//Añadimos el nuevo usuario a la lista de conectados
	//usersOnline.content.push({userid:authorId, username: userData.username, avatar: userData.avatar})
	//displayActiveUsers();
}

function pushReceiveMsg(msgType, msgUser, msgContent)
{
	msg.content.push({type:msgType, username: msgUser, content: msgContent});
}

//ENVIO DE MENSAJES
function sendHistory(authorId)
{
	//Enviamos todos los mensajes anteriores
	var msg_str = JSON.stringify(msg);
	
	//Reutilizamos la array de mensajes para enviar el id en el apartado de contenido
	console.log('Nuevo usuaro: ' + authorId);
	server.sendMessage(msg_str, [authorId]);
}

function sendUsersOnline(authorId){
	var msg_str = JSON.stringify(usersOnline);
	server.sendMessage(msg_str, [authorId]);
}

function pushMsg()
{
	var msgtext = document.getElementById("inputMsg").value;
	var msgAux = {type:'text', username: userName, content: msgtext};
	msgs.push(msgAux);
	msg.content.push(msgAux);
	document.getElementById("inputMsg").value = '';

	//mostramos nuestro mensaje
	displayMsg(userName, msgtext);

	//Convertimos el objeto en string
	var msg_str = JSON.stringify( msgAux );
	server.sendMessage(msg_str);
}

function loadHistory(msgData)
{
	if(msg.content.length == 0){
		console.log('History receved');
		var chatHistory = msgData.content;
		console.log(chatHistory)
		for(let index of chatHistory){
			displayMsg(index.username, index.content);
		}
	}
	displayActiveUsers();
}

function loadActiveUsers(usersData)
{
	if(usersOnline.content.length == 1){
		var actives = usersData.content;
		for(let index of actives){
			console.log(usersData)
			usersOnline.content.push(index)
		}
	}
}

//DISPLAY
function displayMsg(userNameMsg, msgtext)
{
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

function displayActiveUsers(){
	for(let index of usersOnline.content){
		var div = document.createElement("div");
		div.id = index.userid;
		if(document.getElementById(index.username) == null){
			div.classList.add('activeUsers');
			div.textContent = index.username;
			document.getElementById("activeUsers").appendChild(div);
			var img = document.createElement('img'); 
			img.src = index.avatar;
			div.appendChild(img);
		}
	}
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
