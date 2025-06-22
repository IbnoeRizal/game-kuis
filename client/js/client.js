import Client from "./class/Client.js";
import { EventClient } from "./class/Event.js";

 
const target =
  location.hostname === 'localhost'
    ? 'ws://localhost:3000'
    : `ws://${location.hostname}:${location.port}`;

const ws = new WebSocket(target);
const client = new Client();
let close = false;


function messageTranslator(message){
  return JSON.parse(message);
}

function send(event, data){
  client.freezePilihan();

  const paket = JSON.stringify({
    event: event,
    data: data
  });

  ws.send(paket);
}

function displayPilihan(length){
  client.displayKuis();
  client.addPilihanjawaban(length,
    (jawaban) => send(EventClient.game_answered,jawaban));
}

function routerPaket(paket){
  switch(paket.event){
    case EventClient.game_send_question:
      displayPilihan(paket.message);
    break;
    case EventClient.host_quit:
      alert("host has left the game");
      location.replace('/login');
    break;
    case EventClient.game_rank:
      client.displayLobby(`Ranking: ${paket.message}`);
    break;
  }
}


ws.onopen = () => {
  client.displayLobby("Berhasil terkoneksi, menunggu host . . .");
  
  client.tambahDomEvent(Client.obj.quit,"click",
    () => {send(EventClient.player_quit,null)
      close = true;
      location.replace('/login');
    });
};

ws.onmessage = (message)=>{
  const paket = messageTranslator(message.data);
  routerPaket(paket);
};

ws.onclose = ()=>{
  client.displayLobby("Koneksi terputus, Refresh halaman !");

  if(!close){
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
};
