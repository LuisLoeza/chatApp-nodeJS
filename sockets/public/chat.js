let socket = null;
let user =  null;
const connectedToServer = evt => {
    const target = evt.target;
    socket = io.connect();
    socket.on('registered-user', registerUser);
    // socket.on('recive-message', reciveMessage);
    const idHTML = generateIDHtml();
    socket.emit('connected-to-server', { user: target.value, idHTML });
};

const registerUser = payload => {

    Array.from(usersPanel.children).forEach(item => item.remove())
    payload.forEach(item => {
      // alert(item);
      // const span = document.createElement('spa
      const div = document.createElement('div');
      div.style.color = item.color;
      div.classList.add('chatUser');
      div.onclick = () => { chatTo(item); };
      // alert("AQUI ")
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

const sendMessage = (evt, status) => {
    // alert("AQUI")
    if (evt.key === 'Enter') {
    //   if (user.value.length >= LENGTH_MIN_USERNAME && message.value.trim().length > EMPTY) {
        // const parent = document.querySelectorAll('.tabs a.active')[0].parentElement;
        // const content = parent.dataset.content;
        // const currentlyChat = document.querySelector(`#${content}`);
        // const isChatGeneral = content === CHAT_GENERAL;
        const infoMensaje = {
          idOrigen: user.dataset.iduser,
          idOrigenHTML: user.dataset.idhtml,
          idDestino: 'CHAT_GENERAL',
          idDestinoHTML: 'content',
          userOrigen: user.value,
          userDestino: 'CHAT_GENERAL',
          message: message.value
        };
        // if (content !== CHAT_GENERAL) {
        //   // alert("Prueba");
        //   const color = document.querySelector(`#userConnected .chatUser[data-idhtml='${user.dataset.idhtml}']`).style.color;
        //   const messageSend = document.querySelector(`.containerChats #${content}`);
        //   const div = document.createElement('div');
        //   const p = document.createElement('p');
        //   const span = document.createElement('span');
        //   p.style.color = color;
        //   p.classList.add('chatUser');
  
        //   p.appendChild(document.createTextNode(`${infoMensaje.userOrigen}:`));
        //   p.appendChild(span);
        //   p.style = `
        //     color:${color};
        //     width: 80%;
        //     padding: 10px;
        //     border-radius: 25px;
        //     border: 2px ${color} solid;
        //     `
        //   div.appendChild(p);
        //   div.style = 'padding: 2px';
        //   span.innerHTML += ` ${infoMensaje.message}`;
        //   messageSend.appendChild(div);
        // }
        socket.emit('message-chat-general', infoMensaje);
        message.value = '';
        // currentlyChat.scrollTo(0, currentlyChat.scrollHeight);
      }
    //   user.classList[user.value.length >= LENGTH_MIN_USERNAME ? 'remove' : 'add']('has-background-danger');
    // }
    //  else {
    //   if (user.value.length >= LENGTH_MIN_USERNAME) {
    //     if (evt.key !== 'Tab') {
    //       socket.emit('write-client', { data: status ? user.value : '' });
    //     }
    //   }
    // }
  };

const cargar = () => {
    user = document.querySelector('#user');
    message = document.querySelector('#message');
    message.addEventListener('keydown', evt => sendMessage(evt, true));
    message.addEventListener('keyup', evt => sendMessage(evt, false));
    user.addEventListener('blur', connectedToServer);
};
const generateIDHtml = () => new Date().getTime().toString().split('').map(i => String.fromCharCode(parseInt(i) + 65)).join('');

document.addEventListener("DOMContentLoaded", cargar);