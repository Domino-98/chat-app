// Przypisanie do zmiennej socket modułu Socket.io
const socket=io();

window.onload=() => {
    // Pobranie wszystkich potrzebnych elementów z dokumentu HTML
    const chatMsgBox=document.querySelector('.chat-messages')
    const msgBox=document.querySelector('.messages')
    const chatName=document.querySelector('.name-input');
    const chatMsg=document.querySelector('.message-input');
    const send=document.querySelector('.send');
    const feedback=document.querySelector('.feedback');
    
    // Dodanie wiadomości do dokumentu HTML
    function addMessage(message) {
        // Zmienna scrollDiff przechowuje różnicę scrollHeight (Wysokość całej zawartości okna)  i scrollTop (zwraca liczbę pikseli zawartości okna przewijanego pionowo).
        let scrollDiff = chatMsgBox.scrollHeight - chatMsgBox.scrollTop;

        msgBox.innerHTML+=`
        <div class="wrapper">
            <div class="message-box">
            <h3 class="name">${message.name}</h3>
            <p class="message">${message.message}</p>
            </div>
            <p class="date">${message.date}</p>
        </div>
        `;

        // Notyfikacja zostanie usunięta po wysłaniu wiadomości
        feedback.innerHTML = '';

        // Okno czatu ze strony innego użytkownika będzie przewijane, jeżeli zjedzie on na sam dół
        if (scrollDiff < 300) {
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

    // Wywołuje funkcje constrainInput po wciśnięciu entera
    document.querySelectorAll('textarea').forEach(el => {
        el.addEventListener('keyup', constrainInput)
    })

    // Możliwośc wysłania wiadomości po wciśnięciu enter. Metoda click jest wtedy wywoływana na przycisku
    chatMsg.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          send.click();
        }
    });

    // Zdarzenie click dla przycisku send, który tworzy nowy obiekt wiadomości z wartościami tekstowymi podanymi do inputów
    send.addEventListener('click', () => {
        let message={
            name: `${chatName.value}`,
            message: `${chatMsg.value}`
        };

        // Wszystkie znaki prócz ciągu białych znaków
        const regex = /\S+/;

        // Sprawdzenie za pomocą wyrażenia regularnego czy w inpucie są wpisane tylko spacje. Jeżeli tak, zostanie dodana klasa alert do pola tekstowego. Dalsze instrukcje nie zostaną wykonane
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

        // Jeżeli wiadomość zostanie przesłana pomyślnie, pole tekstowe wiadomości zostanie wyzerowane, zmieni się placeholder 
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

    // Zmienna timeout będzie przechowywać 2 argumenty. 1 funkcja zwrotna timeoutFunction, która zmienia wartość typing na false oraz emituje na serwer wartość false. 2 argument jest to czas po którym ma zostać wywołana w ms
    let timeout;

    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
    }

    // Dodanie nasłuchiwania na zdarzenie keyup (wciśnięcie klawisza) dla pola tekstowego message. Wartość typing zostaje zmieniona na true, na serwer zostaje emitowana wpisana nazwa użytkownika, a następnie funkcja clearTimeout usuwa timeout do którego przypisana jest funkcja setTimeout
    chatMsg.addEventListener('keyup', () => {
        typing = true;
        socket.emit('typing', chatName.value);
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });

    // Dodanie nasłuchiwania na zdarzenie typing (wpisywanie tekstu). Z serwera są przesyłane dane (w tym przypadku nazwa użytkownika), a następnie do elementu feedback dodawany jest paragraf informujący o pisanej wiadomości razem z nazwą użytkownika
    socket.on('typing', data => {
        let scrollDiff = chatMsgBox.scrollHeight - chatMsgBox.scrollTop;
        if (data) {
            feedback.innerHTML = `<p class="feedback-message"><em>${data} pisze wiadomość...</em></p>`;
            if (scrollDiff < 300) {
                chatMsgBox.scrollTop=chatMsgBox.scrollHeight;
            }
        } else {
            feedback.innerHTML = '';
        }
    });

    // Funkcja zostanie wywołana, kiedy socket połączony z serwerem emituje wiadomość
    socket.on('message', addMessage);
}