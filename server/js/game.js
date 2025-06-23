const Routing = require('./class/Routing');
const WebSocketServer = require('./class/WebSocketServer');
const Kuis = require('./class/Kuis');
const { OPEN } = require('ws');


class Game extends Kuis{

    #routing;
    #websocketServer;
    #host;
    #gameIsStarted;
    #gameLevel;
    #gameSoalKe;
    #indexJawaban;

    static EVENT = Object.freeze({
        //the client event
        host_quit: 'host-quit-the-game',
        game_answered: "game-answered",
        
        //both
        player_quit: 'player-quit-the-game',
        game_send_question: "game-send-question",
        game_rank: 'game-rank',


       //the host event
        game_lobby: 'game-lobby',
        game_audios: 'game-audios',
        player_joined_before: 'player-joined-before',
        player_joined_after: 'player-joined-after',
        
        game_start: 'game-start',
        game_next: 'game-next',
        game_end: "game-end",
        game_restart: "game-restart",



    });

    constructor(){
        super();
        this.#gameIsStarted = false; 
        
        const GM = Game.multimediaObject.kuis.GM;

        this.#routing = new Routing(GM.host, GM.password, GM.port, GM.listen_on, GM.folderPath, GM.mediaPath);
        this.#websocketServer = new WebSocketServer(GM.port, this.#routing.getServer(),this.#routing.getSessionMiddleware());  
        this.#mulaiServer();
        this.#wsHandler();

    }

    static sendMessage (event, message){
        return JSON.stringify({
            event,
            message
        });
    }
    
    #mulaiServer(){
        this.#routing.listen();
    }

    #wsHandler(){
        this.#websocketServer.on(WebSocketServer.EVENT.player_joined, 
            (identity) => this.#joinHandler(identity));

        this.#websocketServer.on(WebSocketServer.EVENT.incoming_message, 
            (identity, message) => this.#messageHandler(identity, message));

        this.#websocketServer.on(WebSocketServer.EVENT.player_disconected, 
            (identity) => this.#quitHandler(identity));
    }

    #joinHandler(identity){
        if (identity.role == 'host') {
            this.#host = identity;
            this.#gameLobbystart();
            this.#websocketServer.sendMessage(this.#host,
                Game.sendMessage(Game.EVENT.game_audios, Game.multimediaObject.kuis.sounds));

        }else{
            if (this.#host?.role) {
                
                this.#websocketServer.sendMessage(this.#host,
                    Game.sendMessage(Game.EVENT.player_joined_after, identity.nama)
                );
            }
            this.assignPlayer(identity.nama, identity.ws, identity.pass);
            if (this.#gameIsStarted && this.getPlayer(identity.nama, identity.pass).length === 1 ) {
                this.#kirimKuis(identity);
            }else if(this.#gameIsStarted){
                identity.ws.close(4003,"game has already started, comeback later");
            }
        }

    }

    #quitHandler(identity){
        if (this.#host?.role && identity.role === this.#host.role) {
            this.#websocketServer.broadCast(this.#host,
                Game.sendMessage(Game.EVENT.host_quit,this.#host.role));

            this.getPlayer().forEach(obj => {
                if(identity.ws !== obj.ws)
                    obj?.ws?.close?.(4001,"host quit the game");
                this.playerQuit(obj.name);
            });

        }else{
            if (this.#host?.role) {
                this.#websocketServer.sendMessage(this.#host,
                    Game.sendMessage(Game.EVENT.player_quit,identity.nama));
            }

            setTimeout(
                () => 
                {
                    console.log(`${identity.nama}${identity.ws}${identity.pass}${identity.role}`);
                    const player = this.getPlayer(identity.nama, identity.pass)[0];
                    
                    if (player?.ws && player.ws.readyState !== OPEN ){
                        this.playerQuit(identity.nama);
                    }
                }
            ,8000);
        }
    }

    #messageHandler(identity, message){
        const paket = JSON.parse(message);

        if(this.#host?.role && identity.role === this.#host.role){

            switch (paket.event) {
                case Game.EVENT.game_start:
                    this.#gameStart();
                break;

                case Game.EVENT.game_restart:
                    this.#gameLobbystart();
                break;

                case Game.EVENT.game_next:
                    this.#gameContinue();
                break;
                    
                case Game.EVENT.game_rank:
                    this.#gameRank();
                break;

                case Game.EVENT.game_lobby:
                    this.#gameLobbyend();
                break;
            }

        }else{

            switch(paket.event){
                case Game.EVENT.game_answered:
                    this.#gameAnswered(identity, paket.data);
                break;
                case Game.EVENT.player_quit:
                    if(this.#host?.role)
                        this.#websocketServer.sendMessage(this.#host,
                            Game.sendMessage(Game.EVENT.player_quit, identity.nama)
                        );
                    this.playerQuit(identity.nama);
                break;
            }

        }
    }

    #kirimKuis(onePerson){

        const kuis = this.paketKuis(this.#gameLevel,this.#gameSoalKe);
        kuis.levelke = this.#gameLevel;
        kuis.soalke = this.#gameSoalKe;

        if(onePerson){
            this.#websocketServer.sendMessage(onePerson,
            Game.sendMessage(Game.EVENT.game_send_question,kuis["index jawaban"].length));

            return;
        }

        this.#indexJawaban = kuis["index jawaban"];

        Kuis.perfectScore += this.juriPenilai(this.#indexJawaban,this.#indexJawaban,this.#gameLevel,this.#gameSoalKe);

        this.#websocketServer.sendMessage(this.#host,
            Game.sendMessage(Game.EVENT.game_send_question,kuis));

        this.#websocketServer.broadCast(this.#host,
            Game.sendMessage(Game.EVENT.game_send_question,kuis.pilihan.length));

    }

    #gameStart(){
        this.#gameIsStarted = true;
        this.#gameLevel = 1;
        this.#gameSoalKe = 1;
        this.#kirimKuis();
    }

    #gameContinue(){
        const thePlan = Game.multimediaObject.plan;
        const counterSoal = (this.#gameLevel - 1 ) * thePlan["soal per level"] + this.#gameSoalKe ;

        this.raiseCountjawabanforOFFline(counterSoal);

        if(this.#gameLevel < thePlan.level && this.#gameSoalKe < thePlan["soal per level"]){
            this.#gameSoalKe++;
        }else 
        if( this.#gameLevel < thePlan.level && this.#gameSoalKe === thePlan["soal per level"]){
            this.#gameSoalKe = 1;
            this.#gameLevel ++ ;
        }else
        if( this.#gameLevel === thePlan.level && this.#gameSoalKe < thePlan["soal per level"]){
            this.#gameSoalKe++;
        }else{
            return this.#websocketServer.sendMessage(this.#host, Game.sendMessage(Game.EVENT.game_end,"level dan soal habis"))
        }
        
        this.#kirimKuis();
    }

    #gameRank(){
        //mengirim daftar ranking ke host
        const ranker = this.getPlayer().sort((a,b) => b.score - a.score );
        this.#websocketServer.sendMessage(this.#host,
            Game.sendMessage(Game.EVENT.game_rank, ranker));

        //mengirim ranking ke client
        ranker.forEach(({nama},index) =>{
           const identity = this.#websocketServer.getClientsidtty(nama,Routing.roles.Client)?.[0];

           if (identity) {
               this.#websocketServer.sendMessage(identity,
                    Game.sendMessage(Game.EVENT.game_rank, index + 1)
               );
           }

        });
    }

    #gameAnswered(identity, answer){
        const counterJawab = this.getPlayer(identity.nama, identity.pass)[0].countjawaban;
        const banyakSoal = (this.#gameLevel-1) * Game.multimediaObject.plan["soal per level"] + this.#gameSoalKe;

        if( counterJawab === banyakSoal) return;

        this.setScore(identity.nama,
            this.juriPenilai(
                answer,
                this.#indexJawaban,
                this.#gameLevel,
                this.#gameSoalKe 
            ));
    }

    #gameLobbystart(){
        this.#gameIsStarted = false;
        this.#websocketServer.sendMessage(this.#host,
                Game.sendMessage(Game.EVENT.game_lobby,Game.multimediaObject.kuis["lobby masuk"])
            );

        this.#websocketServer.sendMessage(this.#host,
            Game.sendMessage(Game.EVENT.player_joined_before, this.getPlayer())
        );
    }

    #gameLobbyend(){
        this.#websocketServer.sendMessage(this.#host,
            Game.sendMessage(Game.EVENT.game_lobby,Game.multimediaObject.kuis["lobby keluar"])
        );
        this.#gameIsStarted = false;
    }

}

const game = new Game();