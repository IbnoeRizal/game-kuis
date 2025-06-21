# game-kuis

> [!IMPORTANT]
> add the media source to

* media
    * videos
    * photos


add the media file and provide it's path in ```multimed.json```

```jsonc
\\ example

"source": "/media/videos/17-agustus-45.mp4"

```

run ```npm install``` to install the dependency


 ```shell
 node server/js/game.js
 ```

 you can change it's content in ```multimed.jsonc``` plan and kuis property.

```jsonc
"plan" : {
    "level": 3,
    "soal per level": 5,
}
"kuis": {
    "GM":{
      "host" : "admin", //the host name
      "password": "1234", //the host password
      "listen_on": "0.0.0.0", // or localhost
      "port": 3000,
    },
    "lobby masuk": {
      "background music video": "",
      "source": "/media/videos/"
    },
    "level 1": [
      {
        "soal": "question",
        "index jawaban": 0, //0 for A, 1 for B, etc..
        "pilihan": [
          "Option A",
          "Option B",
          "...",
          "..."
        ],
        "waktu": 20 //second
      },
    ],
    "level 2":[
        {},
        {},
        {},
    ],
    "lobby keluar": {
      "background music video": "",
      "source": "/media/videos/"
    }

}
```
any other property are still on building features plan.