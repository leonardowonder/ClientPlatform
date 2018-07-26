import * as _ from 'lodash';

import Singleton from '../../../Utils/Singleton';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import PlayerData from '../../../Data/GamePlay/PlayerData';
import UserData from '../../../Data/UserData';

let gameRoomData = GameRoomData.getInstance();
let userData = UserData.getInstance().getUserData();

class PlayerDataManger extends Singleton {

    getSelfPlayer(): PlayerData {
        let players: PlayerData[] = gameRoomData.getPlayerDatas();

        let selfPlayer: PlayerData = _.find(players, (player: PlayerData) => {
            return player.uid == userData.uid;
        });

        return selfPlayer;
    }

    getPlayerDatas(): PlayerData[] {
        return gameRoomData.getPlayerDatas();
    }

    setPlayerDatas(players: PlayerData[]) {
        let sitPlayers: PlayerData[] = gameRoomData.getPlayerDatas();

        sitPlayers = players;
    }
};

export default new PlayerDataManger();