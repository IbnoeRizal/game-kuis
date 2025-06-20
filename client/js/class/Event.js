export class EventClient{
    //hanya terima
    static host_quit = "host-quit-the-game";
    static game_send_question = "game-send-question";
    static game_rank = "game-rank";
    
    //kirim
    static player_quit = "player-quit-the-game";
    static game_answered = "game-answered";

}

export class EventHost{
    //hanya terima
    static game_lobby = "game-lobby";
    static player_joined_before = "player-joined-before";
    static player_joined_after = "player-joined-after";
    static player_quit = "player-quit-the-game";
    static game_send_question = "game-send-question";
    

    //kirim
    static game_start = "game-start";
    static game_next = "game-next";
    static game_rank = "game-rank";
    static game_end = "game-end";
    static game_restart = "game-restart";
    
}