export default class Client{
    static obj = Object.freeze({
        daftar_jawaban : document.getElementById("answers"),
        lobby : document.getElementById("lobby"),
        quit: document.getElementById("quit"),
    });

    constructor(){

    }

    removeChildren(parent){
        while (parent.firstChild) {
           parent.removeChild(parent.firstChild);
        }
    }

    addPilihanjawaban(banyakJawaban, callback){
        const pilganda = ((banyakJawaban === 2 )? ["True","False"] : ["A","B","C","D"]);
        this.removeChildren(Client.obj.daftar_jawaban);

        for (let counter = 0; counter < banyakJawaban; counter++) {
            const elemen = document.createElement('button');
            elemen.value = counter;
            elemen.textContent = pilganda[counter];
            elemen.className = "button-jawaban";

            elemen.addEventListener('click', () => {
                if (typeof callback === 'function') {
                    callback(counter);
                    this.freezePilihan();
                }
            });

            Client.obj.daftar_jawaban.appendChild(elemen);
        }
    }

    freezePilihan(){
        Array.from(Client.obj.daftar_jawaban.children).forEach((node) => {
            node.disabled = true;
        });
    }

    displayLobby(message){
        Client.obj.lobby.textContent = message;
        Client.obj.lobby.style.display = '';
        Client.obj.daftar_jawaban.style.display = 'none';
    }

    displayKuis(){
        Client.obj.lobby.style.display = 'none';
        Client.obj.daftar_jawaban.style.display = '';
    }

    tambahDomEvent(node,event,callback){
        if(!node) return false;
        if(typeof callback !== 'function') return false;
        if(typeof event !== 'string') return false;

        node.addEventListener(event,callback);
        

        return true;
    }
}