var Simulator = /** @class */ (function () {
    function Simulator() {
    }
    Simulator.prototype.simulate = function (cmds) {
        console.log("count => ", cmds.length);
        cmds.forEach(function (cmd) { return console.log(cmd); });
    };
    return Simulator;
}());
export { Simulator };
