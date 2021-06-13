const socket=io();

window.onload=() => {

    const chatMsgBox=document.querySelector('.chat-messages')
    const chatName=document.querySelector('.name-input');
    const chatMsg=document.querySelector('.message-input');
    const send=document.querySelector('.send');

    // Dodanie wiadomości do dokumentu HTML
    function addMessages(message) {
        let heightDiff = chatMsgBox.scrollHeight - chatMsgBox.scrollTop;

        chatMsgBox.innerHTML+=`
        <div class="message-box">
        <h3 class="name">${message.name}</h3>
        <p class="message">${message.message}</p>
        </div>
        `;

        // Okno czatu ze strony innego użytkownika będzie przewijane, jeżeli zjedzie on na sam dół
        if (heightDiff < 300) {
            chatMsgBox.scrollTop=chatMsgBox.scrollHeight;
        }
    }

    // Funkcja pobierająca dane z adresu, która na końcu wywołuje funkcje addMessages
    function getMessages() {
        fetch('http://localhost:3000/messages')
            .then(function (data) {
                return data.json();
            })
            .then(function (messages) {
                // Wywołanie funkcji addMessages pętlą forEach tyle razy ile jest wiadomości
                messages.forEach(addMessages);
            })
    }

    // Funkcja wysyłająca żądanie POST do podanego adresu. Jako argument zostaje przesłana wiadomość
    function postMessage(message) {
        fetch('http://localhost:3000/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        }).then(res => {
            console.log('Request complete! response:', res);
        });
    }

    // Zdarzenie click dla przycisku send, który tworzy nową wiadomość z wartościami tekstowymi podanymi do inputów
    send.addEventListener('click', () => {
        let message={
            name: `${chatName.value}`,
            message: `${chatMsg.value}`
        };

        // Jeżeli inputy wiadomości są puste, zostanie dodany alert. Dalsze instrukcje nie zostaną wykonane
        if (message.name==='') {
            chatName.classList.add('input-alert');
            return chatName.placeholder='Wpisz nazwę!';
        } else if (message.message==='') {
            chatMsg.classList.add('input-alert');
            return chatMsg.placeholder='Wpisz treść wiadomości!';
        }

        // Wywołanie funkcji postMessage z przesłanym argumentem wiadomości
        postMessage(message);
        chatMsg.value='';
        chatName.placeholder='Nazwa';
        chatMsg.placeholder='Wiadomość';
        chatName.classList.remove('input-alert');
        chatMsg.classList.remove('input-alert');

        setTimeout(function(){ 
            chatMsgBox.scrollTop=chatMsgBox.scrollHeight;
         }, 100);    
    });

    // Pobranie wszystkich wiadomości
    getMessages();

    // Okno czatu zostanie przewinięte na sam dół po 1s
    setTimeout(function(){ 
        chatMsgBox.scrollTop=chatMsgBox.scrollHeight;
     }, 1000);

    socket.on('message', addMessages);
}