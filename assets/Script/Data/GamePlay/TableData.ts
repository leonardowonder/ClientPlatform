export default class TableData {
    redWinChips: number = 0;
    blackWinChips: number = 0;
    specialResultChips: number = 0;

    baseServerIdx: number = 0;

    reset() {
        this.redWinChips = 0;
        this.blackWinChips = 0;
        this.specialResultChips = 0;
        
        this.baseServerIdx = 0;
    }
}