import * as _ from 'lodash';

import Singleton from '../../../Utils/Singleton';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import PlayerData from '../../../Data/GamePlay/PlayerData';
import UserData from '../../../Data/UserData';

let gameRoomData = GameRoomData.getInstance();
let userData = UserData.getInstance();

class PlayerDataManger extends Singleton {

    getSelfPlayer(): PlayerData {
        let players: PlayerData[] = gameRoomData.getSitPlayerDatas();

        let selfPlayer: PlayerData = _.find(players, (player: PlayerData) => {
            return player.uid == userData.uid;
        });

        return selfPlayer;
    }

    getSitPlayerDatas(): PlayerData[] {
        return gameRoomData.getSitPlayerDatas();
    }

    setSitPlayerDatas(players: PlayerData[]) {
        let sitPlayers: PlayerData[] = gameRoomData.getSitPlayerDatas();

        sitPlayers = players;
    }
};

export default new PlayerDataManger();