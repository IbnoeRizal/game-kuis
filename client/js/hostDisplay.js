import Host from "./class/Host.js";
import { EventHost } from "./class/Event.js";
let hasPlayed = false;
const target =
  location.hostname === 'localhost'
    ? 'ws://localhost:3000'
    : `ws://${location.hostname}:${location.port}`;

const ws = new WebSocket(target);
const host = new Host();

function sendData(event, data){
    return JSON.stringify({
        event: event,
        data: data
    });
}

function receiveData(data){
    return JSON.parse(data);
}

function buttonSpecial(event){
    switch(event){
        case EventHost.game_start:
            ws.send(sendData(EventHost.game_start,null));
        break;
        case EventHost.game_restart:
            ws.send(sendData(EventHost.game_restart,null));
        break;
    }
    host.toggleDisplay(Host.obj.tombol);
}


const buttonEventstart = () => {buttonSpecial(EventHost.game_start)};
const buttonEventRestart = () => {buttonSpecial(EventHost.game_restart)};
const audios = {
    countDownAudios:null,
    countDown_countSecond:null,
}

function routerPaket(data){
    switch(data.event){
        case EventHost.game_lobby: //server send lobby source
            host.addMedia(Host.Video, data.message.source,{ forceFullscreen:true }); // need the source
            host.makeitlobby(); // need to make it lobby
            if(!hasPlayed){
                host.toggleDisplay(Host.obj.tombol,{forceDisplay: true});
                host.addEventButton(buttonEventstart,{text: "Start !", removefunct: buttonEventRestart});
                hasPlayed = true;
            }else{
                host.toggleDisplay(Host.obj.tombol,{forceDisplay: true});
                host.addEventButton(buttonEventRestart,{text: "Restart ?", removefunct: buttonEventstart});
                hasPlayed = false;
            }
            break;
        case EventHost.player_joined_before: //server send array of object player
            host.displayPlayer(data.message,{kontainer: true});
            break;
        case EventHost.player_joined_after://server send one name
            host.displayPlayer(data.message);
            break;
        case EventHost.player_quit: //server send one name
            host.removeAllPlayersContaining(data.message);//need to remove dc player from lobby
            break;
        case EventHost.game_end: // server notif, no question anymore
            ws.send(sendData(EventHost.game_lobby)); // request for lobby resource
            ws.send(sendData(EventHost.game_rank)); // request for leaderboard
            break;
        case EventHost.game_rank:// server sends the array of player sorted 
            host.displayPlayer(data.message,{score: true, kontainer: true}); // display the leaderboard
            break;
        case EventHost.game_send_question: //receive question pack from server
            _handleSendQuestion(data);
            break;
        case EventHost.game_audios:
            audios.countDownAudios = host.addSound(data.message.level_countdown.source);
            audios.countDown_countSecond = data.message.level_countdown.countSecond;

    }
}

function _handleSendQuestion(data){

    const mediaType = data.message.media_type;
    const mediaSource = data.message.media_source;

    if(typeof mediaSource === 'string' && typeof mediaType === 'string'){
        if(mediaType === Host.Image)
            host.addMedia(mediaType,mediaSource);
        else
        if(mediaType === Host.Video)
            host.addMedia(mediaType,mediaSource);
    }

    host.makeitKuis(); //display the kuis section

    host.addSoal(data.message.soal,data.message.pilihan); //display the question and options

    const waktu_soal = data.message.waktu;
    const waktu_audio = (audios.countDown_countSecond - waktu_soal) < 0 ?
        0 : audios.countDown_countSecond - waktu_soal;
    
    countDownWithAudio(waktu_soal,waktu_audio);
}

function countDownWithAudio(setTime,setAudioTime){
    const timeEnd = Date.now() + setTime*1000;

    if(setAudioTime !== 0){
        audios.countDownAudios.currentTime = setAudioTime;
        audios.countDownAudios.play()
    }

    function tick(){
        let remaining = Math.max(0,Math.ceil((timeEnd - Date.now())/1000));
        
        if(remaining > 0){
            setTimeout(tick,250);

            if(setAudioTime === 0 &&remaining <= audios.countDown_countSecond){
                audios.countDownAudios.play();
            }
        }
        else{
            audios.countDownAudios.pause();
            audios.countDownAudios.currentTime = 0;
            ws.send(sendData(EventHost.game_next,null));
        }
    }

    tick();

}


ws.onopen = () => {
};

ws.onmessage = (message) => {
    routerPaket(receiveData(message.data));
};

ws.onclose = () => {

};

ws.onerror = () => {

};
