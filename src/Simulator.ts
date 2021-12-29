export class Simulator {
  constructor(){

  }

  simulate(cmds){
    console.log("count => ",cmds.length)
    cmds.forEach((cmd) => console.log(cmd));
  }
}