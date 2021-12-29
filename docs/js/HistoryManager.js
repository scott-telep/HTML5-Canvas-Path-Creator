import { deepClone } from "./deepClone.js";
var HistoryManager = /** @class */ (function () {
    function HistoryManager(maxHistorySize) {
        if (maxHistorySize === void 0) { maxHistorySize = 30; }
        this.history = [];
        this.historyPtr = undefined;
        this.historyForeward = [];
        this.maxHistorySize = maxHistorySize;
    }
    HistoryManager.prototype.storeInHistory = function (value) {
        this.historyForeward = [];
        if (this.historyPtr) {
            this.history.push(this.historyPtr);
        }
        this.historyPtr = deepClone(value);
        while (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    };
    HistoryManager.prototype.backInHistory = function () {
        if (this.history.length > 0) {
            this.historyForeward.push(this.historyPtr);
            var result = this.history.pop();
            this.historyPtr = deepClone(result);
            return result;
        }
    };
    HistoryManager.prototype.forewardInHistory = function () {
        if (this.historyForeward.length > 0) {
            this.history.push(this.historyPtr);
            var result = this.historyForeward.pop();
            this.historyPtr = deepClone(result);
            return result;
        }
    };
    return HistoryManager;
}());
export { HistoryManager };
