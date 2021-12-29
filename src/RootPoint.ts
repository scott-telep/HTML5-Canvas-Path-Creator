import {Point} from "./Point.js"
import {PointType} from "./PointType.js"

export interface RootPoint extends Point {
    type: PointType
}
