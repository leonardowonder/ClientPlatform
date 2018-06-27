const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import clientDefine from '../clientDefine';

@ccclass
export default class TokenInRecordManager {
    private static s_pInstance: TokenInRecordManager = null;

    private m_allRecords: any[] = [];

    getInstance() {
        if (TokenInRecordManager.s_pInstance == null) {
            TokenInRecordManager.s_pInstance = new TokenInRecordManager();
            TokenInRecordManager.s_pInstance._init();
        }
        return TokenInRecordManager.s_pInstance;
    }

    clearAll() {
        this.m_allRecords.length = 0;
    }

    updateRecords(recordList) {
        this.m_allRecords = _.concat(this.m_allRecords, recordList);
    }

    clearRecordByGameType(gameType) {
        _.remove(this.m_allRecords, function(record) {
            let ret = false;
            if (gameType == clientDefine.clublayerToggleType.normal) {
                ret = (record.detail.mtt == null);
            }
            else if (gameType == clientDefine.clublayerToggleType.normal) {
                ret = (record.detail.mtt == 1);
            }
            else {
                cc.warn('TokenInRecordManager clearRecordByGameType gameType err, gameType =', gameType);
            }

            return ret;
        })
    }

    getRecordListByGameType(gameType) {
        let list = [];
        if (this.m_allRecords.length > 0) {
            list = _.filter(this.m_allRecords, function (record) {
                let ret = false;
                if (gameType == clientDefine.clublayerToggleType.normal) {
                    ret = (record.detail.mtt != 1);
                }
                else if (gameType == clientDefine.clublayerToggleType.mtt) {
                    ret = (record.detail.mtt == 1);
                }
                else {
                    cc.warn('TokenInRecordManager getRecordListByGameType gameType err, gameType =', gameType);
                }

                return ret;
            })
        }
        return list;
    }

    _init() {
        this._loadFile();
    }

    _loadFile() {

    }

    _saveRecordToFile() {

    }
}