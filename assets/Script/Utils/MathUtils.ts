import Singleton from './Singleton';

class MatchUtils extends Singleton {

    getRandomBetween(x: number, y: number) {
        let min = Math.min(x, y);
        
        let num = Math.random() * Math.abs(x - y) + min;
        return num;
    }

}

export default new MatchUtils();