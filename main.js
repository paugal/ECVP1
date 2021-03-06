
//Pau Galan Gutierrez - 204993 - ECV - P1 - 2022

//VARIABLES GLOBALES
var server = null;
var location_server = "wss://ecv-etic.upf.edu/node/9000/ws";
var room_name = "_PauGGRoom2/";
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

var msg = {
	type: "history",
	content: []
};

//INICIO DE CONECXION
server = new SillyClient();

server.on_ready = function( my_id ){
	userId = my_id;
	console.log('Tu id es: ', my_id);
	usersOnline.content[0] = {userid: userId, username: userName, avatar: avatarImg}
	enterChatMsg();
}

server.on_connect = function( server ){
	setNameTitle();
};

function enterChat(){
	const validation = document.getElementById("useridInput");
	if (validation.checkValidity()) {
		var loginBox = document.getElementById("loginBox");
		var chatBox = document.getElementById("allApp");

		loginBox.style.display = 'none';
		chatBox.style.display = 'inline';
		selectedRoom = document.querySelector('input[name="roomselector"]:checked').value;
		avatarImg = document.querySelector('input[name="avatar"]:checked').value;
		server.connect( location_server , room_name + selectedRoom);
		console.log('Entrando al chat...');
	}
}

function getUserName(){	
	userName =  document.getElementById("useridInput").value;
}

function setNameTitle(){
	console.log('Room: ', selectedRoom)
	document.getElementById("nameTitle").innerHTML = selectedRoom;
}



//RECEPCION DE MENSAJES
server.on_message = onMessageReceived;

function onMessageReceived( authorId, data ){
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

function newUserChat(msgData, authorId){
	//Creamos un mensaje diferente ara indicar que alguien se ha conectado
	var div = document.createElement("div");
	div.classList.add('chattext');
	div.classList.add('enter');
	div.textContent = "El usuario " + msgData.username + " acaba de conertarse.";
	document.getElementById("chat").appendChild(div);

	sendHistory(authorId);
	sendUsersOnline(authorId);
	
	//A??adimos el nuevo usuario a la lista de conectados
	usersOnline.content.push({userid:authorId, username: msgData.username, avatar: msgData.avatar})
	displayActiveUsers();
}


function pushReceiveMsg(msgType, msgUser, msgContent){
	msg.content.push({type:msgType, username: msgUser, content: msgContent});
}

//ENVIO DE MENSAJES
function enterChatMsg(){
	var enterMsg = {type: 'enter', userid: userId, username: userName, avatar: avatarImg}
	displayActiveUsers();
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

//Desconectamos al usuario si recarga o cierra la pagina.
window.onbeforeunload = function(event){ leaveChat(); };


function sendHistory(authorId){
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

//ALMACENAMIENTO DE DATOS
function pushMsg(){
	var msgtext = document.getElementById("inputMsg").value;
	var msgAux = {type:'text', username: userName, content: msgtext};
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
		console.log('Historial recivido');
		var chatHistory = msgData.content;
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
			console.log('Cargando usuarios activos');
			usersOnline.content.push(index);
		}
	}
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
}

//DISPLAY
function displayMsg(userNameMsg, msgtext)
{
	var div = document.createElement("div");
	div.classList.add('chattext');
	//modificamos el stilo dependiendo si enviamos o recivimos el mensaje
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
		//comprovamos que el usuario no este ya creado
		if(document.getElementById(index.userid) == null){
			var div = document.createElement("div");
			//usamos el userid como id para que no ocurran errores si 
			//hay dos usuarios con el mismo nombre de usuario
			div.id = index.userid;
			div.classList.add('activeUsers');
			div.textContent = index.username;
			var img = document.createElement('img'); 
			img.src = index.avatar;
			//a??adimos la imagen al div y luego a??adimos el div al contenedor de usuarios activos.
			div.appendChild(img);
			document.getElementById("activeUsers").appendChild(div);
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


