// daftar elemen yang dimanipulasi 
export default class Host{
    static Video = "video";
    static Image = "image";


    static obj = Object.freeze({
        tombol : document.getElementById("tombol"),
        kontainer_konten : document.getElementById('content'),
        kontainer_kuis : document.getElementById("container-soal"),
        kontainer_soal : document.getElementById('soal'),
        kontainer_pilihan : document.getElementById('pilihan'),
    });

    constructor(){
    }
    
    addMedia(jenis,source, {forceFullscreen = false} = {}){
        const container = Host.obj.kontainer_konten;
        let media;

        switch(jenis){
            case Host.Video:
                media = document.createElement('video');
                media.src = source;
                media.preload = 'auto';
                media.autoplay = true;
                media.loop = true;
                media.muted = true;
            break;
            case Host.Image:
                media = document.createElement('img');
                media.src = source;
            break;
        }
        if(forceFullscreen){
            media.style.height = "100%";
            media.style.width = "100%";
        }else{
            media.style.height = "30vh";
            media.style.width = "auto";
        }
        if(container.firstChild)
            this.#removeAllChildNodes(container);

        container.appendChild(media);
    }

    addSoal(soal,daftarjawaban){
        const cs = Host.obj.kontainer_soal;
        const cj = Host.obj.kontainer_pilihan;

        cs.textContent = soal;
        this.#removeAllChildNodes(cj);

        if(!(daftarjawaban instanceof Array))
            return false;
        
        daftarjawaban.forEach((dj) => {
            const div = document.createElement('div');
            div.className = "jawaban";

            if(typeof dj === 'object' && !Array.isArray(dj) && dj !== null){
                const image = document.createElement('img');
                const text = document.createElement('div');

                image.className = "jawabanImg";
                image.src = dj.source;
                
                text.textContent = dj.alt;
                                
                div.appendChild(image);
                div.appendChild(text);
            }else{
                div.textContent = dj;
            }

            cj.appendChild(div);
        });
        return true;
    }

    #removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    } 

    makeitlobby(){
        this.toggleDisplay(Host.obj.kontainer_kuis,{forceNone:true});
       
        setTimeout(()=>{
            document.querySelector(`#${Host.obj.kontainer_konten.id}>video`).muted = false;
        },10)
    }

    makeitKuis(){
        this.toggleDisplay(Host.obj.kontainer_kuis,{forceDisplay:true});
        
        if(Host.obj.kontainer_konten.firstChild)        
            this.#removeAllChildNodes(Host.obj.kontainer_konten);
    }

    displayPlayer(player,{score = false, kontainer = false}={}){
        if(kontainer){
            const container_pemain = document.createElement('div');
            container_pemain.id = "container-pemain";
            
            Host.obj.kontainer_konten.appendChild(container_pemain);
        }

        const container = document.getElementById("container-pemain");
        if (player instanceof Array) {
            player.forEach((pl)=>{
                const pemain = document.createElement('div');
                pemain.textContent = pl.nama;
                pemain.className = "pemain";
                
                if (score) {
                    const poin = document.createElement('div');
                    poin.textContent = pl.score;
                    poin.className = "Skor";
                    pemain.appendChild(poin);
                }

                container.appendChild(pemain);
            });
        
        }else{
            const pemain = document.createElement('div');
            pemain.textContent = player;
            pemain.className = "pemain";
            container.appendChild(pemain);
        }
    }

    removeAllPlayersContaining(text, {caseSensitive = false} = {}) {
        if(!text){
            document.querySelectorAll('.pemain').forEach(node =>{
                node.remove();
            });
        }else{
            const matcher = caseSensitive
                ? (t) => t.includes(text)
                : (t) => t.toLowerCase().includes(text.toLowerCase());
    
            document.querySelectorAll('.pemain').forEach(node => {
            if (matcher(node.textContent)) node.remove();
            });
        }
    }

    addEventButton(callback,{text = "" ,removefunct = null} = {}){
        if (typeof callback === 'function')
            Host.obj.tombol.addEventListener('click',callback);
        if(removefunct && typeof removefunct === 'function'){
            Host.obj.tombol.removeEventListener('click', removefunct);
        }
        Host.obj.tombol.textContent = text;
    }

    toggleDisplay(node,{forceNone = false, forceDisplay = false} ={}){
        if(forceNone){
            node.style.display = 'none';
            return;
        }
        if(getComputedStyle(node).display === 'none'|| forceDisplay){
            node.style.display = '';
        }else{
            node.style.display = 'none';
        }
    }
}