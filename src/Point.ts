import { PointType } from "./PointType.js";

export interface Point {
    x: number
    y: number
    relativeTo?: Point
    c1?: Point
    c2?: Point
    c3?: Point
    type?: PointType
}
