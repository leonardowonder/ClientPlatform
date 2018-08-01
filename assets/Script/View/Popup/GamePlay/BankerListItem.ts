const { ccclass, property } = cc._decorator

import ViewCell from '../../../Component/ViewCell';

import { loadHead } from '../../../Utils/MyUtils';

@ccclass
export default class BankerListItem extends ViewCell {
    @property(cc.Label)
    m_indexLabel: cc.Label = null;

    @property(cc.Label)
    m_nameLabel: cc.Label = null;

    @property(cc.Sprite)
    m_headIcon: cc.Sprite = null;

    @property(cc.Label)
    m_coinLabel: cc.Label = null;


    init(index: number, data: any) {
        let _data = data[index];
        if (_data) {
            this.reset();
            
            this.m_indexLabel.string = (index + 1).toString();

            if (_data.headIcon && _data.headIcon.length > 0) {
                loadHead(this.m_headIcon, _data.headIcon);
            }

            if (_data.name && _data.name.length > 0) {
                this.m_nameLabel.string = _data.name;
            }

            this.m_coinLabel.string = _data.coin.toString();
        }
    }

    reset() {
        this.m_coinLabel.string = '';
        this.m_headIcon.spriteFrame = null;
        this.m_nameLabel.string = '';
        this.m_indexLabel.string = '';
    }
}