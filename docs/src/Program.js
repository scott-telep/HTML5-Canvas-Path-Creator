import { PointType } from "./PointType.js";
import { HistoryManager } from "./HistoryManager.js";
import { Options } from "./Options.js";
import { ClickType } from "./ClickType.js";
var Program = /** @class */ (function () {
    function Program(simulator) {
        this.simulator = undefined;
        this.points = [];
        this.bgImg = undefined;
        this.options = new Options();
        this.movingPt = undefined;
        this.currentType = PointType.MOVE;
        this.clickType = ClickType.ADD;
        this.lastClickedPoint = undefined;
        this.historyManager = new HistoryManager(30);
        this.simulator = simulator;
    }
    Program.prototype.getPrecision = function () {
        return parseInt($('#precision').val().toString());
    };
    Program.prototype.initialize = function () {
        var _this = this;
        $('[data-toggle="popover"]').popover({
            trigger: 'hover',
            placement: 'bottom'
        });
        this.$canvas = $('#canvas');
        this.canvas = this.$canvas[0];
        this.ctx = this.canvas.getContext('2d');
        var bindCheckbox = function (query, propertyName) {
            $(query).on('change paste keyup', function () {
                _this.options[propertyName] = $(query + ":checked").length > 0;
                _this.redraw();
            });
            $(query).prop('checked', _this.options[propertyName]);
        };
        bindCheckbox('#autoCloseShape', 'autoCloseShape');
        bindCheckbox('#showDots', 'showDots');
        bindCheckbox('#fillShape', 'fillShape');
        bindCheckbox('#wrapJS', 'wrapJS');
        bindCheckbox('#keepBezierCursorsAligned', 'keepBezierCursorsAligned');
        bindCheckbox('#hideBackgroundImage', 'hideBackgroundImage');
        bindCheckbox('#showConstructionDotsOnLastClickedPointOnly', 'showConstructionDotsOnLastClickedPointOnly');
        bindCheckbox('#reverseX', 'reverseX');
        bindCheckbox('#reverseY', 'reverseY');
        $('#clear').on('click', function () {
            _this.points = [];
            _this.storeInHistory();
            _this.redraw();
        });
        $('#backInHistory').on('click', function () {
            _this.points = _this.historyManager.backInHistory();
            _this.redraw();
        });
        $('#forewardInHistory').on('click', function () {
            _this.points = _this.historyManager.forewardInHistory();
            _this.redraw();
        });
        $('#precision').on('change paste keyup', function () {
            _this.redraw();
        });
        $('#clickType').on('change', function () {
            _this.clickType = parseInt($('#clickType').val().toString());
        });
        $('#clickType').val(this.clickType);
        $('#currentType').on('change', function () {
            _this.currentType = parseInt($('#currentType').val().toString());
        });
        $('#currentType').val(this.currentType);
        $('#load-image').on('click', function () {
            var url = $('#url').val().toString();
            var load = function (img) {
                img.onload = function () {
                    _this.bgImg = img;
                    _this.redraw();
                };
            };
            if (url) {
                var img = new Image();
                load(img);
                img.src = url;
            }
            else {
                var $urlFile = $('#url-file');
                var files = $urlFile[0].files;
                if (files && files[0]) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var img = new Image();
                        load(img);
                        img.src = event.target.result;
                    };
                    fileReader.readAsDataURL(files[0]);
                }
            }
        });
        this.$canvas.on('dblclick', function (event) {
            var point = {
                x: event.offsetX,
                y: event.offsetY
            };
            var selectedPt = _this.selectedPoint(point);
            if (Program.alignBezierCursor(selectedPt)) {
                _this.redraw();
            }
        });
        this.$canvas.on('mousedown', function (event) {
            var point = {
                x: event.offsetX,
                y: event.offsetY,
                type: _this.currentType
            };
            var isShiftPressed = event.shiftKey;
            var isCtrlPressed = event.ctrlKey;
            var mouseClick = event.which === 1 ? 'left' : 'right';
            var selectedPt = _this.selectedPoint(point);
            _this.lastClickedPoint = selectedPt;
            while (_this.lastClickedPoint && _this.lastClickedPoint.relativeTo) {
                _this.lastClickedPoint = _this.lastClickedPoint.relativeTo;
            }
            if (selectedPt) {
                var pt = selectedPt;
                if (pt.relativeTo) {
                    pt = _this.addPointsTogether(pt, pt.relativeTo);
                }
                $('#last-location').text("(" + pt.x + ", " + pt.y + ")");
            }
            else {
                $('#last-location').text("(" + point.x + ", " + point.y + ")");
            }
            if (mouseClick === 'left') {
                if (selectedPt) {
                    if (_this.clickType === ClickType.REMOVE) {
                        _this.removePoint(selectedPt, true);
                        _this.storeInHistory();
                    }
                    else if (!isCtrlPressed) {
                        _this.movingPt = selectedPt;
                    }
                }
                else if (!isShiftPressed) {
                    if (_this.clickType === ClickType.ADD) {
                        _this.movingPt = undefined;
                        if (_this.currentType === PointType.QUADRATIC_CURVE) {
                            point.c3 = {
                                x: 20,
                                y: 0,
                                relativeTo: point
                            };
                        }
                        if (_this.currentType === PointType.BEZIER_CURVE) {
                            point.c1 = {
                                x: 20,
                                y: 0,
                                relativeTo: point
                            };
                            if (_this.points.length > 0) {
                                var lastPoint = _this.points[_this.points.length - 1];
                                lastPoint.c2 = {
                                    x: 20,
                                    y: 0,
                                    relativeTo: lastPoint
                                };
                                Program.alignBezierCursor(lastPoint.c1 || lastPoint.c3);
                            }
                        }
                        _this.lastClickedPoint = point;
                        _this.points.push(point);
                        _this.storeInHistory();
                        /////// TO REMOVE? //
                        if (_this.currentType === PointType.MOVE) {
                            _this.setCurrentType(PointType.BEZIER_CURVE);
                        }
                        ////////TO REMOVE? //
                    }
                }
                _this.redraw();
            }
        });
        var moveMovingPt = function (point, isShiftPressed) {
            if (_this.movingPt.relativeTo) {
                var r = _this.movingPt.relativeTo;
                var newPt = {
                    x: point.x - r.x,
                    y: point.y - r.y
                };
                if (isShiftPressed) {
                    //const mouseAngle = Math.atan2(point.y - r.y, -point.x + r.y) + Math.PI;
                    var angle = Math.atan2(_this.movingPt.y, -_this.movingPt.x) + Math.PI;
                    var otherAngle = angle - Math.PI / 2 + Math.PI;
                    /*const angleDiff = Math.abs(((mouseAngle + 2 * Math.PI) % (2 * Math.PI)) - ((angle + 2 * Math.PI) % (2 * Math.PI)));
                    const oppositeMouse = angleDiff > Math.PI / 2 && angleDiff < Math.PI * 3 / 2;*/
                    var otherDistance = Math.sqrt(newPt.x * newPt.x + newPt.y * newPt.y);
                    /*if(oppositeMouse) {
                        otherDistance *= -1;
                    }*/
                    _this.movingPt.x = Math.sin(otherAngle) * otherDistance;
                    _this.movingPt.y = Math.cos(otherAngle) * otherDistance;
                }
                else {
                    _this.movingPt.x = newPt.x;
                    _this.movingPt.y = newPt.y;
                    if (_this.options.keepBezierCursorsAligned) {
                        Program.alignBezierCursor(_this.movingPt);
                    }
                }
            }
            else {
                _this.movingPt.x = point.x;
                _this.movingPt.y = point.y;
            }
        };
        this.$canvas.on('mouseup', function (event) {
            var point = {
                x: event.offsetX,
                y: event.offsetY
            };
            var isShiftPressed = event.shiftKey;
            if (_this.movingPt) {
                moveMovingPt(point, isShiftPressed);
                _this.movingPt = undefined;
                _this.storeInHistory();
            }
            _this.redraw();
        });
        this.$canvas.on('mousemove', function (event) {
            var point = {
                x: event.offsetX,
                y: event.offsetY
            };
            var isShiftPressed = event.shiftKey;
            $('#current-location').text("(" + point.x + ", " + point.y + ")");
            if (_this.movingPt) {
                moveMovingPt(point, isShiftPressed);
            }
            _this.redraw();
        });
        this.storeInHistory();
    };
    Program.prototype.storeInHistory = function () {
        this.historyManager.storeInHistory(this.points);
    };
    Program.prototype.setCurrentType = function (type) {
        this.currentType = type;
        if ($('#currentType').val() != this.currentType) {
            $('#currentType').val(this.currentType);
        }
    };
    Program.prototype.setClickType = function (type) {
        this.clickType = type;
        if ($('#clickType').val() != this.clickType) {
            $('#clickType').val(this.clickType);
        }
    };
    Program.prototype.produceJS = function () {
        var _this = this;
        var js = '';
        var cmds = [];
        var addLine = function (line) {
            js = (js + "\n" + (_this.options.wrapJS ? '    ' : '') + line).trim();
        };
        var xCoord = function (c) {
            if (_this.options.reverseX) {
                c = -c;
            }
            return _this.options.wrapJS ? c + " * xmul + xoff" : c;
        };
        var yCoord = function (c) {
            if (_this.options.reverseY) {
                c = -c;
            }
            return _this.options.wrapJS ? c + " * ymul + yoff" : c;
        };
        addLine("ctx.beginPath()");
        cmds.push({ cmd: "beginFill", color: "#FF0000" });
        var lastPoint = undefined;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            switch (point.type) {
                case PointType.LINE:
                    addLine("ctx.lineTo(" + xCoord(point.x) + ", " + yCoord(point.y) + ");");
                    cmds.push({ cmd: "lineTo", x: point.x, y: point.y });
                    break;
                case PointType.MOVE:
                    addLine("ctx.moveTo(" + xCoord(point.x) + ", " + yCoord(point.y) + ");");
                    cmds.push({ cmd: "moveTo", x: point.x, y: point.y });
                    break;
                case PointType.BEZIER_CURVE:
                    if (lastPoint) {
                        var absoluteC2 = this.addPointsTogether(lastPoint, lastPoint.c2);
                        var absoluteC1 = this.addPointsTogether(point, point.c1);
                        addLine("ctx.bezierCurveTo(" + xCoord(absoluteC2.x) + ", " + yCoord(absoluteC2.y) + ", " + xCoord(absoluteC1.x) + ", " + yCoord(absoluteC1.y) + ", " + xCoord(point.x) + ", " + yCoord(point.y) + ")");
                        cmds.push({ cmd: "bezierCurveTo", cp1x: absoluteC2.x, cp1y: absoluteC2.y, cp2x: absoluteC1.x, cp2y: absoluteC1.y, x: point.x, y: point.y });
                    }
                    else {
                        addLine("ctx.moveTo(" + xCoord(point.x) + ", " + yCoord(point.y) + ");");
                        cmds.push({ cmd: "moveTo", x: point.x, y: point.y });
                    }
                    break;
                case PointType.QUADRATIC_CURVE:
                    var absoluteC3 = this.addPointsTogether(point, point.c3);
                    addLine("ctx.quadraticCurveTo(" + xCoord(absoluteC3.x) + ", " + yCoord(absoluteC3.y) + ", " + xCoord(point.x) + ", " + yCoord(point.y) + ");");
                    cmds.push({ cmd: "quadraticCurveTo", cpx: absoluteC3.x, cpy: absoluteC3.y, x: point.x, y: point.y });
                    break;
            }
            lastPoint = point;
        }
        cmds.push({ cmd: "endFill" });
        if (this.options.autoCloseShape) {
            addLine("ctx.closePath();");
        }
        if (this.options.fillShape) {
            addLine("ctx.fill();");
        }
        addLine("ctx.stroke();");
        if (this.options.wrapJS) {
            js = "function draw(xoff, yoff, xmul, ymul) {\n    " + js + "\n}";
        }
        this.simulator.simulate(cmds);
        return JSON.stringify(cmds);
    };
    Program.prototype.updateJS = function () {
        var js = this.produceJS();
        $('#js').val(js);
    };
    Program.prototype.redraw = function () {
        var _this = this;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.bgImg && !this.options.hideBackgroundImage) {
            this.ctx.drawImage(this.bgImg, 0, 0);
        }
        var setColor = function (color) {
            _this.ctx.fillStyle = color;
            _this.ctx.strokeStyle = color;
        };
        var p = this.getPrecision();
        setColor(this.options.drawingColor);
        this.ctx.beginPath();
        var lastPoint = undefined;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            switch (point.type) {
                case PointType.LINE:
                    this.ctx.lineTo(point.x, point.y);
                    break;
                case PointType.MOVE:
                    this.ctx.moveTo(point.x, point.y);
                    break;
                case PointType.BEZIER_CURVE:
                    if (lastPoint) {
                        var absoluteC2 = this.addPointsTogether(lastPoint, lastPoint.c2);
                        var absoluteC1 = this.addPointsTogether(point, point.c1);
                        this.ctx.bezierCurveTo(absoluteC2.x, absoluteC2.y, absoluteC1.x, absoluteC1.y, point.x, point.y);
                    }
                    else {
                        this.ctx.moveTo(point.x, point.y);
                    }
                    break;
                case PointType.QUADRATIC_CURVE:
                    var absoluteC3 = this.addPointsTogether(point, point.c3);
                    this.ctx.quadraticCurveTo(absoluteC3.x, absoluteC3.y, point.x, point.y);
                    break;
            }
            lastPoint = point;
        }
        if (this.options.autoCloseShape) {
            this.ctx.closePath();
        }
        if (this.options.fillShape) {
            this.ctx.fill();
        }
        this.ctx.stroke();
        if (this.options.showDots) {
            var drawDot_1 = function (point) {
                _this.ctx.fillRect(point.x - p / 2, point.y - p / 2, p, p);
            };
            var _loop_1 = function (point) {
                drawDot_1(point);
                var subPoints = function (pt) {
                    if (pt) {
                        var absolute = _this.addPointsTogether(point, pt);
                        drawDot_1(absolute);
                        _this.ctx.beginPath();
                        _this.ctx.moveTo(point.x, point.y);
                        _this.ctx.lineTo(absolute.x, absolute.y);
                        _this.ctx.stroke();
                    }
                };
                if (!this_1.options.showConstructionDotsOnLastClickedPointOnly || this_1.lastClickedPoint === point) {
                    setColor(this_1.options.subDrawingColor);
                    subPoints(point.c1);
                    subPoints(point.c2);
                    subPoints(point.c3);
                    setColor(this_1.options.drawingColor);
                }
            };
            var this_1 = this;
            for (var _b = 0, _c = this.points; _b < _c.length; _b++) {
                var point = _c[_b];
                _loop_1(point);
            }
        }
        this.updateJS();
    };
    Program.prototype.addPointsTogether = function (pt1, pt2) {
        return {
            x: pt1.x + pt2.x,
            y: pt1.y + pt2.y
        };
    };
    Program.prototype.interesct = function (point, location, pointPrecision) {
        if (pointPrecision === undefined) {
            pointPrecision = this.getPrecision();
        }
        return point.x - pointPrecision / 2 <= location.x
            && point.x + pointPrecision / 2 >= location.x
            && point.y - pointPrecision / 2 <= location.y
            && point.y + pointPrecision / 2 >= location.y;
    };
    Program.prototype.selectedPoints = function (location, precision) {
        var _this = this;
        var selectedPts = [];
        var addIfValid = function (point) {
            if (!_this.options.showDots || _this.options.showConstructionDotsOnLastClickedPointOnly && point.relativeTo && point.relativeTo !== _this.lastClickedPoint) {
                return;
            }
            var absolutePoint = point;
            if (point.relativeTo) {
                absolutePoint = _this.addPointsTogether(point, point.relativeTo);
            }
            if (_this.interesct(absolutePoint, location, precision)) {
                selectedPts.push(point);
            }
        };
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            addIfValid(point);
            if (point.c1) {
                addIfValid(point.c1);
            }
            if (point.c2) {
                addIfValid(point.c2);
            }
            if (point.c3) {
                addIfValid(point.c3);
            }
        }
        return selectedPts;
    };
    Program.prototype.selectedPoint = function (location, precision) {
        var pts = this.selectedPoints(location, precision);
        return pts[0];
    };
    Program.prototype.removePoint = function (point, useInstance) {
        for (var i = 0; i < this.points.length; ++i) {
            var pt = this.points[i];
            if (!useInstance && pt.x === point.x && pt.y === point.y || useInstance && pt === point) {
                this.points.splice(i, 1);
                return pt;
            }
        }
        return undefined;
    };
    Program.alignBezierCursor = function (cursorPoint) {
        if (cursorPoint && cursorPoint.relativeTo) {
            var parentPoint = cursorPoint.relativeTo;
            var adjustPoint = void 0;
            if (parentPoint.c1 === cursorPoint) {
                adjustPoint = parentPoint.c2 || parentPoint.c3;
            }
            else if (parentPoint.c2 === cursorPoint) {
                adjustPoint = parentPoint.c1 || parentPoint.c3;
            }
            else if (parentPoint.c3 === cursorPoint) {
                adjustPoint = parentPoint.c1 || parentPoint.c2;
            }
            if (adjustPoint) {
                var angle = Math.atan2(cursorPoint.y, -cursorPoint.x) + Math.PI;
                var otherAngle = angle - Math.PI / 2;
                var otherDistance = Math.sqrt(adjustPoint.x * adjustPoint.x + adjustPoint.y * adjustPoint.y);
                adjustPoint.x = Math.sin(otherAngle) * otherDistance;
                adjustPoint.y = Math.cos(otherAngle) * otherDistance;
                return true;
            }
        }
        return false;
    };
    return Program;
}());
export { Program };
