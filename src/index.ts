import {Program} from './Program.js';
import {Simulator} from './Simulator.js'
const simulator = new Simulator();
const program = new Program(simulator.simulate);

program.initialize();
