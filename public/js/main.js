const socket=io();

window.onload=() => {

    const chatMsgBox=document.querySelector('.chat-messages')
    const chatName=document.querySelector('.name-input');
    const chatMsg=document.querySelector('.message-input');
    const send=document.querySelector('.send');

    // Dodanie wiadomości do dokumentu HTML
    function addMessage(message) {
        let heightDiff = chatMsgBox.scrollHeight - chatMsgBox.scrollTop;

        chatMsgBox.innerHTML+=`
        <div class="wrapper">
            <div class="message-box">
            <h3 class="name">${message.name}</h3>
            <p class="message">${message.message}</p>
            </div>
            <p class="date">${message.date}</p>
        </div>
        `;

        // Okno czatu ze strony innego użytkownika będzie przewijane, jeżeli zjedzie on na sam dół
        if (heightDiff < 300) {
            chatMsgBox.scrollTop=chatMsgBox.scrollHeight;
        }
    }

    // Funkcja pobierająca dane z adresu, która na końcu wywołuje funkcje addMessage
    function getMessages() {
        fetch('http://localhost:3000/messages')
            .then(function (data) {
                return data.json();
            })
            .then(function (messages) {
                // Wywołanie funkcji addMessage pętlą forEach tyle razy ile jest wiadomości
                messages.forEach(addMessage);
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

    // Zamienia nowe linie dla każdego pola textarea na pusty string
    constrainInput = event => { 
        event.target.value = event.target.value.replace(/[\r\n\v]+/g, '')
    }
      
    document.querySelectorAll('textarea').forEach(el => {
        el.addEventListener('keyup', constrainInput)
    })

    // Możliwośc wysłania wiadomości po wciśnięciu enter
    chatMsg.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          send.click();
        }
    });

    // Zdarzenie click dla przycisku send, który tworzy nową wiadomość z wartościami tekstowymi podanymi do inputów
    send.addEventListener('click', () => {
        let message={
            name: `${chatName.value}`,
            message: `${chatMsg.value}`
        };

        // Wszystkie znaki prócz ciągu białych znaków
        const regex = /\S+/;

        // Sprawdzenie za pomocą wyrażenia regularnego czy w inpucie są wpisane tylko spacje. Jeżeli tak, zostanie dodany alert. Dalsze instrukcje nie zostaną wykonane
        if (!message.name.match(regex)) {
            chatName.classList.add('input-alert');
            chatName.value = '';
            return chatName.placeholder='Wpisz nazwę!';
        } else if (!message.message.match(regex)) {
            chatMsg.classList.add('input-alert');
            chatMsg.value = '';
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

    socket.on('message', addMessage);
}