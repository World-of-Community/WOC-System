import { EventEmitter } from 'node:events';

class VorschlagEmitter extends EventEmitter {}

const vorschlagEmitter = new VorschlagEmitter();

export default vorschlagEmitter;
