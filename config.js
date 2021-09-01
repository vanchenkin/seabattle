var config = {
    ip: 'localhost',
    port: process.env.PORT || 3000,
	width: 10,
	height: 10,
    ships: [[1,4], [2,3], [3,2], [4,1]],
    state: {
		EMPTY: 0,
		SHIP: 1,
		SHOT: 2,
		KILLED: 3,
        BLOWN: 4,
	},
}

module.exports = config;