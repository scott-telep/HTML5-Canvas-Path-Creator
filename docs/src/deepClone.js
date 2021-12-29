var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * @see https://stackoverflow.com/a/40293777
 */
export function deepClone(obj, hash) {
    if (hash === void 0) { hash = new WeakMap(); }
    // Do not try to clone primitives or functions
    if (Object(obj) !== obj || obj instanceof Function)
        return obj;
    if (hash.has(obj))
        return hash.get(obj); // Cyclic reference
    try { // Try to run constructor (without arguments, as we don't know them)
        var result = new obj.constructor();
    }
    catch (e) { // Constructor failed, create object without running the constructor
        result = Object.create(Object.getPrototypeOf(obj));
    }
    // Optional: support for some standard constructors (extend as desired)
    if (obj instanceof Map)
        Array.from(obj, function (_a) {
            var key = _a[0], val = _a[1];
            return result.set(deepClone(key, hash), deepClone(val, hash));
        });
    else if (obj instanceof Set)
        Array.from(obj, function (key) { return result.add(deepClone(key, hash)); });
    // Register in hash    
    hash.set(obj, result);
    // Clone and assign enumerable own properties recursively
    return Object.assign.apply(Object, __spreadArrays([result], Object.keys(obj).map(function (key) {
        var _a;
        return (_a = {}, _a[key] = deepClone(obj[key], hash), _a);
    })));
}
