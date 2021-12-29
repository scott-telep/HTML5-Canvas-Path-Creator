export var PointType;
(function (PointType) {
    PointType[PointType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
    PointType[PointType["QUADRATIC_CURVE"] = 4] = "QUADRATIC_CURVE";
    PointType[PointType["LINE"] = 2] = "LINE";
    PointType[PointType["MOVE"] = 3] = "MOVE";
})(PointType || (PointType = {}));
