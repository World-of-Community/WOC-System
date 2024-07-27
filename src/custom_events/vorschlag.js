const EventEmitter = require('events');

class VorschlagEmitter extends EventEmitter {}

const vorschlagEmitter = new VorschlagEmitter();

module.exports = vorschlagEmitter;
