import Express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import session from 'express-session';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default class Routing {
    static roles = Object.freeze({
        Host: "host",
        Client: "client",
    });
    
    #theHost;
    #thePassword;
    #app;
    #port;
    #listenOn;
    #server;
    #sessionmMiddleware;

    constructor(theHost, ThePassword, port, listenOn,folderPath, mediaPath) {
        this.#theHost = theHost;
        this.#thePassword = ThePassword;
        this.#app = Express();
        this.#port = port;
        this.#listenOn = listenOn;
        
        this.#useMiddleware();
        this.#watchFolder(folderPath,mediaPath);
        this.#route();

        this.#server = http.createServer(this.#app);
    }

    #useMiddleware(){
        this.#sessionmMiddleware = session({
            secret: process.env.SESSION_SECRET_TOKEN,
            resave: false,
            saveUninitialized: false,
            cookie:{
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: true
            }
        });

        this.#app.use(bodyParser.urlencoded({ extended: true }));
        this.#app.use(bodyParser.json());
        this.#app.use(this.#sessionmMiddleware);
    }

    #watchFolder(folderPath, mediaPath){
        this.#app.use(Express.static(path.join(__dirname, folderPath)));
        this.#app.use('/media', Express.static(path.join(__dirname, mediaPath)));
    }

    #route(){
        this.#app.post('/login',this.#validator.bind(this));

        this.#app.get('/login', (req, res) => {res.redirect('/index.html')});
        this.#app.get('/host',this.#guardAccess.bind(this), (req, res) => {res.redirect('/host.html')});
        this.#app.get('/client',this.#guardAccess.bind(this), (req,res) => {res.redirect('/client.html')});
    }

    #validator(req, res) {
        const { name, password } = req.body;

        if (name === this.#theHost && password === this.#thePassword) {
            req.session.user = Routing.roles.Host;
            req.session.name = name;
            req.session.pass = password;

            res.json({ status: Routing.roles.Host, message:"berhasil Login", redirect: '/host' });

        } else if (name && password) {
            req.session.user = Routing.roles.Client;
            req.session.name = name;
            req.session.pass = password;
            
            res.json({ status: Routing.roles.Client, message:"berhasil", redirect: '/client' });

        } else {
            res.status(401).json({ status: 'error', message: 'Login gagal', redirect: '/login' });
        }
    }

    #guardAccess(req, res, next){
        if(!req.session.user){
            return res.redirect('/login');
        }
        next();
    }

    getServer(){
        return this.#server;
    }

    getSessionMiddleware(){
        return this.#sessionmMiddleware;
    }

    listen() {
        this.#server.listen(this.#port, this.#listenOn, () => {
            console.log(`Server berjalan di http://localhost:${this.#port}`);
        });
    }

}