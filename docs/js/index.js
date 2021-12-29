import { Program } from './Program.js';
import { Simulator } from './Simulator.js';
var simulator = new Simulator();
var program = new Program(simulator.simulate);
program.initialize();
