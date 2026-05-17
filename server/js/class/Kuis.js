import fs from 'fs';
import {parse} from 'jsonc-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import _ from 'lodash';
 

const __filename = fileURLToPath(import.meta.url);

const jsoncFile = fs.readFileSync(path.join(path.dirname(__filename), '../../../multimed.jsonc'), 'utf-8');
const multimediaObject = parse(jsoncFile);


export default class Kuis {

    static multimediaObject = Object.freeze(multimediaObject);
    static perfectScore = 0;

    #playerscore;
    constructor() {
    this.#playerscore = new Map();
    }

    #validateAssignName(name){
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Nama pemain harus berupa string yang tidak kosong.');
        }
        if (!this.#playerscore.has(name)) {
            return true;
        }
        return false;
    }

    getPlayer(nama,pass){
        const players = [];
        if (!(nama && pass)){
            for(const [name,value] of this.#playerscore){
                if(Kuis.perfectScore === 0)
                    players.push({nama: name, score: value.score, pass: null, ws: null, countjawaban: value.countjawaban});
                else
                    players.push({nama: name, score: parseFloat((value.score*100/Kuis.perfectScore).toFixed(1)), pass: null, ws: null, countjawaban: value.countjawaban});
            }
        }else{
            for(const [name, value] of this.#playerscore)
                if(nama === name && pass === value.pass)
                    players.push({nama: name, score:value.pass, pass: value.pass , ws: value.ws, countjawaban: value.countjawaban});
        }
        return players;
    }

    playerQuit(name){
        if(this.#playerscore.delete(name)){
            return true;
        }
        return false;
    }

    assignPlayer (name, ws, pass){
        if (this.#validateAssignName(name)) {
            const id = {
                score: 0,
                pass: pass,
                ws: ws,
                countjawaban: 0
            };
            this.#playerscore.set(name, id);
        }else{
            const obj = this.getPlayer(name, pass);
            if(name === obj.nama && pass === obj.pass)
                this.#playerscore.get(name).ws = ws;

            console.log("mengganti ws");
        }
    }
    
    paketKuis (level, nomor){
        const paket = _.cloneDeep(multimediaObject.kuis[`level ${level}`][nomor - 1]);
        return paket;
    }
    
    setScore (name, score){
        const player = this.#playerscore.get(name);
        
        if(!player) return;
        if (typeof score !== 'number' || isNaN(score)) return;

        player.score += score;
        player.countjawaban ++;
    }

    juriPenilai (jawaban, indexjawaban, level, nomor){
        const nomorSoalMudah = multimediaObject.plan.kesulitan[`level ${level}`]["soal mudah"];

        let nilai = 0;
        if (!jawaban || jawaban !== indexjawaban) return nilai;

        let sulit = nomor > nomorSoalMudah ;
        nilai = level;

        return (sulit)? nilai*2 : nilai;
    }

    raiseCountjawabanforOFFline(newCount){
        this.#playerscore.forEach(({countjawaban},key) => {
           if(countjawaban < newCount)
                countjawaban = newCount;
        });
    }

}