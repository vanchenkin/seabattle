var config = {
    ip: 'localhost',
    port: process.env.PORT || 3000,
    state: {
		EMPTY: 0,
		SHIP: 1,
		SHOT: 2,
		KILLED: 3,
        BLOWN: 4,
	},
	width: 10,
	height: 10,
    ships: [[1,4], [2,3], [3,2], [4,1]],
    shipCellCount: () => {
        let cnt = 0;
        for(let i of config.ships)
            cnt+=i[0]*i[1];
        return cnt;
    },
	makeEmptyArray: () =>{
		let t = [];
        for(i = 0; i < 10; i++){
            let tmp = [];
            for(j = 0; j < 10; j++)
                tmp.push(config.state.EMPTY);
            t.push(tmp);
        }
        return t;
	},
}

module.exports = config;