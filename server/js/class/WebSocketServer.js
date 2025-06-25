const WebSocket = require('ws');
const EventEmitter = require('events');
const {roles} = require('./Routing');

class WebSocketServer extends EventEmitter {

  static EVENT = Object.freeze({
    player_joined: 'player-joined',
    incoming_message: 'incoming-message',
    player_disconected: 'player-disconected'
  });

  #port;
  #clients;
  #wss;

  constructor(port,server,sessionMiddleware) {
    super();
    this.#port = port;
    this.#clients = new Map();
    this.#wss = new WebSocket.Server({noServer: true});
    this.#getSessionUser(server,sessionMiddleware);
    this.#initialize();
  }

  #initialize() {
    this.#wss.on('connection', (ws, req) => this.#handleConnection(ws,req));
    console.log(`WebSocket server running on ws://localhost:${this.#port}`);
  }
  
  #getSessionUser(server,sessionMiddleware){
    server.on('upgrade',(request, socket, head) => {
      sessionMiddleware(request, {}, () => {
        this.#wss.handleUpgrade(request, socket, head, (ws) => {
          this.#wss.emit('connection', ws, request);
        });
      });
    });
  }


  #handleConnection(ws, req) {
    const identity = {
     role: req.session.user || 'anonymous',
     nama: req.session.name || 'anonymous',
     pass: req.session.pass || '',
     ws: ws
    };

    this.#handleIllegalConnection(identity);

    identity.nama = this.#makeNameUnique(identity.nama,identity.role);
    this.#clients.set(ws,identity);
//    sessionStorage.setItem('item', JSON.stringify({name: identity.nama, password: identity.pass}));

    console.log(`New ${identity.role} connected`);
    if(ws.readyState === WebSocket.OPEN)
      this.emit(WebSocketServer.EVENT.player_joined, identity);
    
    ws.on('message', (message) => this.#handleMessage(identity, message));
    ws.on('close', () => this.#handleClose(identity));
  }
  
  #handleMessage(identity, message) {
    console.log('Received:', JSON.parse(message));
    this.emit(WebSocketServer.EVENT.incoming_message, identity, message);
  }
  
  broadCast(identity,message) {
    // Broadcast message to all clients except the sender
    this.#clients.forEach((value , client) => {
      if (client !== identity.ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }else if(client !== identity.ws ){
        console.warn("⚠️ Failed to send to:", identity.nama);
      }
    });
  }
  
  sendMessage(identity, message) {
    // const ws = identity.ws;
    // console.log("⏩ Trying to send to:", identity.nama, "state:", ws.readyState);

    // Send a message to a specific client
    if (identity.ws.readyState === WebSocket.OPEN) {
      identity.ws.send(message);
      console.log("send message✅ Sent to:", identity.nama);
    } else {
      console.warn("⚠️ Failed to send to:", identity.nama);
    }
  }

  #handleClose(identity) {
    this.#clients.delete(identity.ws);
    console.log(`${identity.nama} disconnected`);
    this.emit(WebSocketServer.EVENT.player_disconected, identity);
  }

  getClientsidtty(name,role){
    let ids = [];
    this.#clients.forEach((id,_) => {
      if(name === id.nama && role === id.role){
        ids.push(id);
      }
    });
    return ids;
  }

  #makeNameUnique(name,role){

    if (this.getClientsidtty(name,role).length === 0 ){
      return name;
    }

    const arrName = name.split(" ");
    let akhir = arrName[arrName.length - 1];

    if (!isNaN(akhir)){
      arrName[arrName.length -1] = String(Number(akhir) + 1);
    }else{
      arrName.push('1');
    }

    const newName = arrName.join(" ");

    return this.#makeNameUnique(newName,role);
  }

  #handleIllegalConnection(identity){

    if(identity.role === 'anonymous'||identity.nama === 'anonymous'){
      identity.ws.close(4001,"you must logged in first");
    }else if(identity.role === roles.Host){
      for (const [key, value] of this.#clients) {
        if (value.role === roles.Host)
        identity.ws.close(4002,"impersonating host");
      }
    }
  }

}
module.exports = WebSocketServer;