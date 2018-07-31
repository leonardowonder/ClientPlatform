import * as _ from 'lodash';

import Singleton from '../../../Utils/Singleton';

import { Game_Room_Players_Max_Count } from '../../../Define/GamePlayDefine';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import GamePlayerData from '../../../Data/GamePlay/GamePlayerData';
import UserData from '../../../Data/UserData';

import TableDataManager from './TableDataManager';

let gameRoomData = GameRoomData.getInstance();
let userData = UserData.getInstance().getUserData();

class GamePlayerDataManager extends Singleton {

    getSelfPlayer(): GamePlayerData {
        let players: GamePlayerData[] = gameRoomData.getGamePlayerDatas();

        let selfPlayer: GamePlayerData = _.find(players, (player: GamePlayerData) => {
            return player.uid == userData.uid;
        });

        return selfPlayer;
    }

    getGamePlayerDatas(): GamePlayerData[] {
        return gameRoomData.getGamePlayerDatas();
    }

    setPlayerDatas(players: GamePlayerData[]) {
        gameRoomData.setGamePlayerDatas(players);
    }

    updatePlayerInfo(jsMsg) {
        let playerDatas: GamePlayerData[] = this.getGamePlayerDatas();

        if (jsMsg.players && jsMsg.players.length) {
            for (let idx = 0; idx < jsMsg.players.length; idx++) {
                if (jsMsg.players[idx].idx < Game_Room_Players_Max_Count) {
                    let serverIDx = jsMsg.players[idx].idx;
                    let playerData: GamePlayerData = playerDatas[serverIDx];
                    if (playerData) {
                        playerData.setPlayerData(jsMsg.players[idx]);
                        if (playerData.uid == UserData.getInstance().getUserData().uid) {
                            TableDataManager.getInstance().setBaseServerIdx(serverIDx);
                        }
                    }
                }
            }
        }
    }

    getPlayerDataByServerIdx(idx): GamePlayerData {
        let playerDatas: GamePlayerData[] = this.getGamePlayerDatas();

        let data: GamePlayerData = null;

        if (idx > 0 && idx < playerDatas.length) {
            data = playerDatas[idx];
        }

        return data;
    }

    onPlayerSitDown(jsMsg) {
        let playerDatas: GamePlayerData[] = this.getGamePlayerDatas();
        let playerData = playerDatas[jsMsg.idx];
        playerData.setPlayerData(jsMsg);

        if (playerData.uid == userData.uid) {
            TableDataManager.getInstance().setBaseServerIdx(jsMsg.idx);
        }
    }

    onPlayerStandUp(jsMsg) {
        let playerDatas: GamePlayerData[] = this.getGamePlayerDatas();
        let playerData = playerDatas[jsMsg.idx];

        playerData.reset();
    }
};

export default new GamePlayerDataManager();