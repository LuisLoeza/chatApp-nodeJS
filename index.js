let socket = null;
let user = null;
let message = null;
let notification = null;
let uploadFile = null;
let webrtc = null;
const CHAT_GENERAL = 'chatGeneral';
const LENGTH_MIN_USERNAME = 3;
const EMPTY = 0;
let tipoUser = null;

const closeChat = selectorID => {
  document.querySelector(`.tabs ul li[data-content='${selectorID}']`).removeEventListener('click', selectedChat);
  document.querySelector(`.tabs ul li[data-content='${selectorID}']`).remove();
  document.querySelector(`.containerChats #${selectorID}`).remove();
  document.querySelector(`li[data-content='chatGeneral']`).click();
};

const chatTo = data => {
  const selectorID = data.idHTML || data.idOrigenHTML;
  const selectorIdUser = data.idUser || data.idOrigen;
  const selectorUser = data.user || data.userOrigen;
  const existChat = document.querySelectorAll(`#${selectorID}`).length;
  //  console.log("selector ID: " + selectorID+"\n"
  //  + "selectoridUser: " + selectorIdUser+"\n"
  //  + "selectorUser: " + selectorUser+"\n"
  //  + "existChat: " + existChat);
  
  console.log("USER DATA: " + user.dataset.idhtml)
  if (existChat === EMPTY) {
    if ((user.dataset.idhtml !== selectorID || data.idDestinoHTML !== data.idOrigenHTML) && user.dataset.idhtml !== data.idOrigenHTML) {
      document.querySelectorAll('.tabs ul li').forEach(item => {
        item.children[0].classList.remove('active');
      });
      document.querySelectorAll('.containerChats .chat').forEach(item => {
        item.classList.add('hide');
      });
      const chat = document.createElement('div');
      const li = document.createElement('li');
      const a = document.createElement('a');
      const span = document.createElement('span');
      const iNewChat = document.createElement('i');
      const iCloseChat = document.createElement('i');
      chat.setAttribute('id', selectorID);
      chat.classList.add('chat', 'textarea', 'contentTab');
      document.querySelector('.containerChats').prepend(chat);
      li.setAttribute('data-content', selectorID.toString());
      li.setAttribute('data-idUser', selectorIdUser.toString());
      a.classList.add('active');
      span.style.color = data.color;
      span.classList.add('has-text-white', 'chatUser');
      span.innerHTML = selectorUser;
      a.appendChild(span);
      iNewChat.classList.add('fas', 'fa-comment', 'newMessage', 'hide');
      a.appendChild(iNewChat);
      iCloseChat.classList.add('fas', 'fa-times-circle', 'closeChat');
      iCloseChat.onclick = () => { closeChat(selectorID.toString()); };
      a.appendChild(iCloseChat);
      li.appendChild(a);
      document.querySelector('.tabs ul').appendChild(li);
      document.querySelector(`.tabs ul li[data-content='${selectorID}']`).addEventListener('click', selectedChat);
    } else {
      alert('no puedes enviarte mensaje a ti mismo')
    }
  }
};

const selectedChat = evt => {
  // alert('aqui')
  document.querySelectorAll('.containerChats .chat').forEach(item => {
    item.classList.add('hide');
    //alert(item.getAttribute('id'))
    //alr
    // item.style="border: 1px red solid";
  });
  const showChat = evt.currentTarget.dataset['content'];
  const chatElement = document.querySelector(`#${showChat}`);
  if (chatElement) {
    chatElement.classList.remove('hide');
  }
  document.querySelectorAll('.tabs a').forEach(item => item.classList.remove('active'));
  evt.currentTarget.children[0].classList.add('active');
  if (!Array.from(evt.currentTarget.children[0].querySelector('i').classList).includes('hide')) {
    evt.currentTarget.children[0].querySelector('i').classList.add('hide')
  }
};

const sendMessage = (evt, status) => {
 // if (evt.key === 'Enter') {
    if (user.value.length >= LENGTH_MIN_USERNAME && message.value.trim().length > EMPTY) {
      const parent = document.querySelectorAll('.tabs a.active')[0].parentElement;
      const content = parent.dataset.content;
      const currentlyChat = document.querySelector(`#${content}`);
      const isChatGeneral = content === CHAT_GENERAL;
      const infoMensaje = {
        idOrigen: user.dataset.iduser,
        idOrigenHTML: user.dataset.idhtml,
        idDestino: isChatGeneral ? CHAT_GENERAL : parent.dataset.iduser,
        idDestinoHTML: content,
        userOrigen: user.value,
        userDestino: isChatGeneral ? CHAT_GENERAL : parent.innerText,
        message: message.value
      };
      if (content !== CHAT_GENERAL) {
        //  alert("Prueba")
        const color = document.querySelector(`#userConnected .chatUser[data-idhtml='${user.dataset.idhtml}']`).style.color;
        const messageSend = document.querySelector(`.containerChats #${content}`);
        const div = document.createElement('div');
        const p = document.createElement('p');
        const span = document.createElement('span');
          
        p.style.color = color;
        p.classList.add('chatUser');

        p.appendChild(document.createTextNode(`${infoMensaje.userOrigen}:`));
        p.appendChild(span);
        p.style = `
          color:${color};
          width: 80%;
          padding: 10px;
          border-radius: 25px;
          border: 2px ${color} solid;
          `
        div.appendChild(p);
        div.style = 'padding: 2px';
        span.innerHTML += ` ${infoMensaje.message}`;
        messageSend.appendChild(div);
      }
      socket.emit(`mensaje-${isChatGeneral ? 'general' : 'privado'}`, infoMensaje);
      currentlyChat.scrollTo(0, currentlyChat.scrollHeight);
    }
    user.classList[user.value.length >= LENGTH_MIN_USERNAME ? 'remove' : 'add']('has-background-danger');
 // } else {
  //  if (user.value.length >= LENGTH_MIN_USERNAME) {
   //   if (evt.key !== 'Tab') {
   //     socket.emit('write-client', { data: status ? user.value : '' });
   //   }else{
   //     
   //     status = '';
   //   }
   // }
 //}
};


const clientBeenWriting = payload => {
  document.querySelector('.u_conectados_contenedor .infoInput').innerHTML = payload;
};

const reciveMessage = data => {
  // alert("AQUI");
  const {
    color,
    idDestinoHTML,
    idOrigenHTML,
    userOrigen,
    message
  } = data;
  let activeChatID = document.querySelector(`#${idDestinoHTML}`) || document.querySelector(`#${idOrigenHTML}`);
  if (!activeChatID) {
    chatTo(data);
    activeChatID = document.querySelector(`#${idDestinoHTML}`) || document.querySelector(`#${idOrigenHTML}`);
  }
  const div = document.createElement('div');
  const p = document.createElement('p');
  const span = document.createElement('span');
  if (idDestinoHTML !== idOrigenHTML) {
    // p.style.color = color;
    p.classList.add('chatUser');
    let cursor = '';
    let lado = '';
    if (user.dataset.idhtml !== idOrigenHTML) {
      div.onclick = () => { chatTo(data); };
      cursor = 'pointer';
      lado = 'flex-end'
    } else {
      cursor = 'normal';
      lado = 'flex-start '
    }
    p.style = `
      color:${color};
      width: 80%;
      padding: 10px;
      border-radius: 25px;
      cursor: ${cursor}; 
      border: 2px ${color} solid;
      `;
    // console.log("Span: "+span.getAttribute('class'));
    // 
    p.appendChild(document.createTextNode(`${userOrigen}:`));
    p.appendChild(span);
    span.innerHTML += ` ${message}`;
    div.style = `
    display: flex;
    flex-direction: column;
    align-items: ${lado};
    padding:2px;
    `;
    div.appendChild(p);
    if(tipoUser.value === 'userResponse') {
      activeChatID.appendChild(div);
      activeChatID.scrollTo(0, activeChatID.scrollHeight);
    }
    if(tipoUser.value === 'userChat')
    {
      if(idOrigenHTML === user.dataset.idhtml || idDestinoHTML !== CHAT_GENERAL){
        activeChatID.appendChild(div);
        activeChatID.scrollTo(0, activeChatID.scrollHeight);
      }
    }
   
  } else {

  }
  const newMessage = document.querySelector('.tabs a.active').parentElement.dataset.content
  if (newMessage !== activeChatID.id && newMessage !== idDestinoHTML) {
    const destino = document.querySelector(`.tabs li[data-content='${idDestinoHTML}'] i`);
    const origen = document.querySelector(`.tabs li[data-content='${idOrigenHTML}'] i`);
    (destino || origen).classList.remove('hide');
  }
};


const registerUser = payload => {

  Array.from(usersPanel.children).forEach(item => item.remove())
  payload.forEach(item => {
    // alert(item);
    // const span = document.createElement('span')
    const div = document.createElement('div');
    div.style.color = item.color;
    div.classList.add('chatUser');
    div.onclick = () => {chatTo(item);};
    div.setAttribute('data-idUser', item.idUser);
    div.setAttribute('data-idHTML', item.idHTML);
    div.appendChild(document.createTextNode(item.user));
    usersPanel.appendChild(div);
    if (user.value === item.user) {
      user.setAttribute('data-idHTML', item.idHTML);
      user.setAttribute('data-idUser', item.idUser);
    }
  });
};

const errorRegisteredUser = (payload, evt) => {

  const noti = document.querySelector('#notification');
  if(payload.err === true){
    noti.classList.remove('hide');
    noti.innerHTML = payload.err;
    evt.target.classList.remove('disabled');
  }
  if(payload.err === false){
      noti.classList.add('hide');
      noti.innerHTML = payload.err;
      evt.target.classList.add('disabled');
  }
};


connectedToServer = evt => {
  const target = evt.target;
  if (target.value.length >= LENGTH_MIN_USERNAME) {
    target.classList.add('disabled'); 
    user.classList.remove('has-background-danger');
    socket = io.connect();
    socket.on('recibir-mensaje', reciveMessage);
    socket.on('registro-usuario', registerUser);
    socket.on('error-registro-usuario', payload => errorRegisteredUser(payload, evt));
    socket.on('escribiendo', clientBeenWriting);
    const idHTML = generateIDHtml();
    socket.emit('conectar', { user: target.value, idHTML });
  } else {
    alert("Usuario mayor a 3 caracteres")
  }
};

const cargar = () => {
  const tabGeneral = document.querySelector('#tabGeneral');
  tipoUser = document.querySelector('#tipoUser');
  user = document.querySelector('#user');
  message = document.querySelector('#message');
  usersPanel = document.querySelector('#userConnected');
  notification = document.querySelector('.notification');
  enviar = document.querySelector("#enviar");
  enviar.addEventListener('click', function(evt) {
    sendMessage(evt, true);
  });
  $(message).emojioneArea({
    events: {
        blur: function (editor, evt) {
          sendMessage(evt, true);
          this.setText('');
      }
   }
 });
  user.addEventListener('blur', connectedToServer);
  tabGeneral.addEventListener('click', selectedChat);
};
const generateIDHtml = () => new Date().getTime().toString().split('').map(i => String.fromCharCode(parseInt(i) + 65)).join('');

document.addEventListener("DOMContentLoaded", cargar);