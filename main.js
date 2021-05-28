window.config  = require('./config.js');

import * as io from 'socket.io-client';
window.socket =  io({transports:['websocket']});
//window.socket =  io(config.ip + ':' + config.port, {transports:['websocket']});

import Vue from 'vue'
let files = require.context('/components', false, /\.vue$/i);
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default));

window.vm = new Vue({
	el: '#vue',
})