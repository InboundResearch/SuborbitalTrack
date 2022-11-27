// class hierarchy
// default values...
// vector manipulation macros
export let LogLevel = function () {
    let _ = Object.create (null);
    _.TRACE = 0;
    _.INFO = 1;
    _.WARNNG = 2;
    _.ERROR = 3;
    // default
    let logLevel = _.ERROR;
    _.set = function (newLogLevel) {
        logLevel = newLogLevel;
    };
    let formatStrings = ["TRC", "INF", "WRN", "ERR"];
    _.say = function (messageLogLevel, message) {
        if (messageLogLevel >= logLevel) {
            console.log (formatStrings[messageLogLevel] + ": " + message)
        }
    };
    _.trace = function (message) {
        this.say (_.TRACE, message);
    };
    _.info = function (message) {
        this.say (_.INFO, message);
    };
    _.warn = function (message) {
        this.say (_.WARNNG, message);
    };
    _.error = function (message) {
        this.say (_.ERROR, message);
    };
    return _;
} ();
LogLevel.set (LogLevel.INFO);
/**
 * A collection of utility functions.
 *
 * @class Utility
 */
export let Utility = function () {
    let _ = Object.create (null);
    const TWO_PI = Math.PI * 2.0;
    let unwind = _.unwind = function (value, cap) {
        value -= Math.floor (value / cap) * cap;
        while (value >= cap) {
            value -= cap;
        }
        while (value < 0) {
            value += cap;
        }
        return value;
    };
    _.unwindRadians = function (radians) {
        return _.unwind (radians, TWO_PI);
    };
    _.unwindDegrees = function (degrees) {
        return _.unwind (degrees, 360.0);
    };
    /**
     * Convert an angle measured in degrees to radians.
     *
     * @method degreesToRadians
     * @param {float} degrees the degree measure to be converted
     * @return {float}
     */
    _.degreesToRadians = function (degrees) {
        return unwind (degrees / 180.0, 2.0) * Math.PI;
    };
    _.cos = function (degrees) {
        return Math.cos (_.degreesToRadians (degrees));
    };
    _.sin = function (degrees) {
        return Math.sin (_.degreesToRadians (degrees));
    };
    _.tan = function (degrees) {
        return Math.tan (_.degreesToRadians (degrees));
    };
    /**
     * Convert an angle measured in radians to degrees.
     *
     * @method radiansToDegrees
     * @param {float} radians the radian measure to be converted
     * @return {float}
     */
    _.radiansToDegrees = function (radians) {
        return (unwind (radians, TWO_PI) / Math.PI) * 180;
    };
    /**
     * Make the first letter of a string be upper case.
     *
     * @method uppercase
     * @param {string} string the text to convert to upper case
     * @return {string}
     */
    _.uppercase = function (string) {
        return string[0].toUpperCase () + string.slice (1);
    };
    /**
     * Make the first letter of a string be lower case.
     *
     * @method lowercase
     * @param {string} string the text to convert to lower case
     * @return {string}
     */
    _.lowercase = function (string) {
        return string[0].toLowerCase () + string.slice (1);
    };
    /**
     * Convert an array of arrays to a single array of values (in order).
     *
     * @method flatten
     * @param {Array} array the input array of arrays
     * @return {Array}
     */
    _.flatten = function (array) {
        let result = [];
        for (let element of array) {
            for (let value of element) {
                result.push (value);
            }
        }
        return result;
    };
    /**
     * truncate a number to a specific precision, equivalent to discretization
     *
     * @method fixNum
     * @param {float} number the number to discretize
     * @param {integer} precision how many decimal places to force
     * @return {number}
     */
    _.fixNum = function (number, precision) {
        (precision = (((typeof precision !== "undefined") && (precision != null)) ? precision : 7));
        return Number.parseFloat (number.toFixed (precision));
    };
    /**
     * zero pad a number to a specific width
     *
     * @method padNum
     * @param {number} number the number to pad
     * @param {integer} width how many places the final number should be
     * @param {char} fill the character to pad with (default is "0")
     * @return {*}
     */
    _.padNum = function (number, width, fill) {
        fill = fill || "0";
        number = number + "";
        return number.length >= width ? number : new Array(width - number.length + 1).join(fill) + number;
    }
    /**
     * provide a default value if the requested value is undefined. this is
     * here because the macro doesn't handle multiline values.
     *
     * @method defaultValue
     * @param {any} value the value to test for undefined
     * @param {any} defaultValue the default value to provide if value is undefined
     * @return {any}
     */
    _.defaultValue = function (value, defaultValue) {
        return (value = (((typeof value !== "undefined") && (value != null)) ? value : defaultValue));
    };
    /**
     * provide a default value if the requested value is undefined by calling a function. this is
     * here because the macro doesn't handle multiline values.
     *
     * @method defaultFunction
     * @param {any} value the value to test for undefined
     * @param {function} defaultFunction the function to call if value is undefined
     * @return {any}
     */
    _.defaultFunction = function (value, defaultFunction) {
        return (value = (((typeof value !== "undefined") && (value != null)) ? value : defaultFunction ()));
    };
    /**
     * create a reversed mapping from a given object (assumes 1:1 values)
     *
     * @method reverseMap
     * @param {object} mapping the the object containing the mapping to be reversed
     * @return {object}
     */
    _.reverseMap = function (mapping) {
        let reverseMapping = Object.create (null);
        for (let name in mapping) {
            reverseMapping[mapping[name]] = name;
        }
        return reverseMapping;
    };
    return _;
} ();
let FloatN = function (dim) {
    let _ = Object.create (null);
    _.create = function () {
        return new Float32Array(dim);
    };
    // _.copy (from, to)
    // from: FloatN
    // to: FloatN
    // copies the values of 'from' over to 'to'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.copy = function (from, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        for (let i = 0; i < dim; ++i) {
            str += "to[" + i + "] = from[" + i + "];\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.point (from, to)
    // from: FloatN-1
    // to: FloatN
    // populates 'to' as a homogenous coordinate point of 'from'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.point = function (from, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        let end = dim - 1;
        for (let i = 0; i < end; ++i) {
            str += "to[" + i + "] = from[" + i + "];\n";
        }
        str += "to[" + end + "] = 1;\n";
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.vector (from, to)
    // from: FloatN-1
    // to: FloatN
    // populates 'to' as a homogenous coordinate point of 'from'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.vector = function (from, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        let end = dim - 1;
        for (let i = 0; i < end; ++i) {
            str += "to[" + i + "] = from[" + i + "];\n";
        }
        str += "to[" + end + "] = 0;\n";
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.dot (left, right)
    // left: FloatN
    // right: FloatN
    // computes the dot produce of 'left' and 'right'
    // returns the Float result
    /**
     *
     */
    eval (function () {
        let str = "_.dot = function (left, right) {\n";
        str += "return (left[0] * right[0])";
        for (let i = 1; i < dim; ++i) {
            str += "\n + (left[" + i + "] * right[" + i + "])";
        }
        str += ";\n";
        str += "};\n";
        return str;
    } ());
    // _.normSq (from)
    // from: FloatN
    // computes the squared length of the input vector
    // returns the Float result
    /**
     *
     * @param from
     */
    _.normSq = function (from) {
        return _.dot (from, from);
    };
    // _.norm (from)
    // from: FloatN
    // computes the length of the input vector
    // returns the Float result
    /**
     *
     * @param from
     * @return {number}
     */
    _.norm = function (from) {
        let n2 = _.normSq (from);
        return (n2 > 0.0) ? ((Math.abs (n2 - 1.0) > 1.0e-6) ? Math.sqrt (n2) : 1.0) : 0.0;
    };
    /**
     *
     * @param from
     * @param to
     */
    _.normalize = function (from, to) {
        let n = _.norm (from);
        return (Math.abs (n - 1.0) > 1.0e-6) ? _.scale (from, 1 / n, to) : _.copy (from, to);
    };
    // _.add (left, right, to)
    // left: FloatN
    // right: FloatN
    // to: FloatN
    // sets the values of 'to' to the sum of 'left' and 'right'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.add = function (left, right, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        for (let i = 0; i < dim; ++i) {
            str += "to[" + i + "] = left[" + i + "] + right[" + i + "];\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.subtract (left, right, to)
    // left: FloatN
    // right: FloatN
    // to: FloatN
    // sets the values of 'to' to the difference of 'left' and 'right'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.subtract = function (left, right, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        for (let i = 0; i < dim; ++i) {
            str += "to[" + i + "] = left[" + i + "] - right[" + i + "];\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.scale (from, scale, to)
    // from: FloatN
    // scale: Float
    // to: FloatN
    // sets the values of 'to' to a scaled version of 'from'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.scale = function (from, scale, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        for (let i = 0; i < dim; ++i) {
            str += "to[" + i + "] = from[" + i + "] * scale;\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.fixNum (from, precision, to)
    // from: FloatN
    // precision: int
    // to: FloatN
    // sets the values of 'to' to a fixed precision version of 'from'
    // if 'to' is omitted, will create a new vector
    // returns 'to'
    /**
     *
     */
    eval (function () {
        let str = "_.fixNum = function (from, precision, to) {\n";
        str += "to = (typeof to !== 'undefined') ? to : _.create ();\n";
        for (let i = 0; i < dim; ++i) {
            str += "to[" + i + "] = Utility.fixNum (from[" + i + "], precision);\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.minor
    /**
     *
     */
    eval (function () {
        let str = "_.minor = function (from) {\n";
        str += "let minorIndex = 0, minorValue = from[minorIndex], nextValue;\n";
        for (let i = 1; i < dim; ++i) {
            str += "nextValue = from[" + i +"]; ";
            str += "if (minorValue > nextValue) { minorIndex = " + i + "; minorValue = nextValue;};\n";
        }
        str += "return minorIndex;\n";
        str += "};\n";
        return str;
    } ());
    // _.major
    /**
     *
     */
    eval (function () {
        let str = "_.major = function (from) {\n";
        str += "let majorIndex = 0, majorValue = from[majorIndex], nextValue;\n";
        for (let i = 1; i < dim; ++i) {
            str += "nextValue = from[" + i +"]; ";
            str += "if (majorValue < nextValue) { majorIndex = " + i + "; majorValue = nextValue;};\n";
        }
        str += "return majorIndex;\n";
        str += "};\n";
        return str;
    } ());
    // _.str (from)
    // from: FloatN
    // returns the string representation of the from (to 7 significant digits), about 10 miles at
    // 1/16" resolution
    /**
     *
     */
    eval (function () {
        let str = "_.str = function (from) {\n";
        str += "return '(' + from[0]";
        for (let i = 1; i < dim; ++i) {
            str += "\n + ', ' +  + from[" + i + "].toFixed (7)";
        }
        str += " + ')';\n";
        str += "};\n";
        return str;
    } ());
    /**
     *
     * @param left
     * @param right
     * @return {boolean}
     */
    _.equals = function (left, right) {
        return _.str (left) === _.str (right);
    };
    return _;
};
export let Float2 = function () {
    let _ = FloatN (2);
    /**
     *
     * @param from
     * @param to
     * @return {*}
     */
    _.perpendicular = function (from, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : _.create ()));
        to[0] = from[1]; to[1] = -from[0];
        return to;
    };
    /**
     *
     * @param left
     * @param right
     * @return {number}
     */
    _.cross = function (left, right) {
        return (left[0] * right[1]) - (left[1] * right[0]);
    };
    return _;
} ();
export let Float3 = function () {
    let _ = FloatN (3);
    /**
     *
     * @param left
     * @param right
     * @param to
     * @return {*}
     */
    _.cross = function (left, right, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : _.create ()));
        to[0] = (left[1] * right[2]) - (left[2] * right[1]);
        to[1] = (left[2] * right[0]) - (left[0] * right[2]);
        to[2] = (left[0] * right[1]) - (left[1] * right[0]);
        return to;
    };
    return _;
} ();
export let Float4 = function () {
    return FloatN (4);
} ();
/**
 * A (square) NxN matrix
 *
 * @class FloatNxN
 */
let FloatNxN = function (dim) {
    let _ = Object.create (null);
    let _FloatN = FloatN (dim);
    let size = dim * dim;
    let index = _.index = function (row, column) {
        return (row * dim) + column;
    };
    let defineTo = function (to) {
        (to = (((typeof to !== "undefined") && (to != null)) ? to : "to"));
        return to + " = (typeof " + to + " !== 'undefined') ? " + to + " : _.create ();\n";
    };
    /**
     * Create a new FloatNxN.
     *
     * @method create
     * @static
     * @return {FloatNxN}
     */
    _.create = function () {
        return new Float32Array (size);
    };
    /**
     * Copy contents from an array into a FloatNxN and return the result.
     *
     * @method copy
     * @static
     * @param {FloatNxN} from source.
     * @param {FloatNxN} to destination. if 'to' is omitted, a new one will be created.
     * @return {FloatNxN} returns 'to'.
     */
    eval (function () {
        let str = "_.copy = function (from, to) {\n";
        str += defineTo ();
        for (let row = 0; row < dim; ++row) {
            for (let col = 0; col < dim; ++col) {
                let i = index (row, col);
                str += "to[" + i + "] = from[" + i + "]; ";
            }
            str += "\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.identity (to)
    // to: FloatNxN
    // sets the values of 'to' to an identity matrix
    // if 'to' is omitted, will create a new matrix
    // returns 'to'
    eval (function () {
        let str = "_.identity = function (to) {\n";
        str += defineTo ();
        for (let row = 0; row < dim; ++row) {
            for (let column = 0; column < dim; ++column) {
                str += "to[" + index (row, column) + "] = " + ((row === column) ? 1 : 0) + "; ";
            }
            str += "\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    _.IDENTITY = _.identity ();
    // _.transpose (from, to)
    // from: FloatNxN
    // to: FloatNxN
    // transposes the values of 'from' over to 'to'
    // if 'to' is omitted, will create a new matrix
    // returns 'to'
    eval (function () {
        let str = "_.transpose = function (from, to) {\n";
        str += defineTo ();
        for (let row = 0; row < dim; ++row) {
            for (let column = 0; column < dim; ++column) {
                str += "to[" + index (row, column) + "] = from[" + index (column, row) + "]; ";
            }
            str += "\n";
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    // _.multiply (left, right, to)
    // left: FloatNxN
    // right: FloatNxN
    // to: FloatNxN
    // populates 'to' with the result of matrix multiplication of 'left' and 'right'
    // if 'to' is omitted, will create a new matrix
    // returns 'to'
    eval (function () {
        let rc = function (r, c) {
            let str = "(left[" + index (r, 0) + "] * right[" + index (0, c) + "])";
            for (let i = 1; i < dim; ++i) {
                str += " + (left[" + index (r, i) + "] * right[" + index (i, c) + "])";
            }
            str += ";\n";
            return str;
        };
        let str = "_.multiply = function (left, right, to) {\n";
        str += defineTo ();
        for (let row = 0; row < dim; ++row) {
            for (let column = 0; column < dim; ++column) {
                str += "to[" + index (row, column) + "] = " + rc (row, column);
            }
        }
        str += "return to;\n";
        str += "};\n";
        return str;
    } ());
    _.chain = function (...args) {
        let result = args[0];
        for (let index = 1, end = args.length; index < end; ++index) {
            let next = args[index];
            result = _.multiply(result, next);
        }
        return result;
    };
    // _.scale (scale, to)
    // scale: Float or FloatN
    // to: FloatNxN
    // sets the values of 'to' to a scale matrix
    // if 'to' is omitted, will create a new matrix
    // returns 'to'
    eval(function () {
        let end = dim - 1;
        let str = "_.scale = function (scale, to) {\n";
        str += "scale = Array.isArray(scale) ? scale : Array(" + end + ").fill(scale);\n";
        str += "to = _.identity (to);\n";
        for (let i = 0; i < end; ++i) {
            str += "to[" + index(i, i) + "] = scale[" + i + "]; ";
        }
        str += "\n";
        str += "return to;\n";
        str += "};\n";
        return str;
    }());
    // _.translate (translate, to)
    // translate: FloatN
    // to: FloatNxN
    // sets the values of 'to' to a translation matrix
    // if 'to' is omitted, will create a new matrix
    // returns 'to'
    eval(function () {
        let end = dim - 1;
        let str = "_.translate = function (translate, to) {\n";
        str += "to = _.identity (to);\n";
        for (let i = 0; i < end; ++i) {
            str += "to[" + index(end, i) + "] = translate[" + i + "]; ";
        }
        str += "\n";
        str += "return to;\n";
        str += "};\n";
        return str;
    }());
    // _.str (from)
    // from: FloatNxN
    // returns the string representation of the matrix
    eval (function () {
        let strRow = function (row) {
            let str = "'(' + from[" + index (row, 0) + "]";
            for (let column = 1; column < dim; ++column) {
                str += " + ', ' + from[" + index (row, column) + "]";
            }
            str += " + ')'";
            return str;
        };
        let str = "_.str = function (from) {\n";
        str += "return ";
        str += strRow (0);
        for (let row = 1; row < dim; ++row) {
            str += " + ', ' + " + strRow (row);
        }
        str += ";\n";
        str += "};\n";
        return str;
    } ());
    return _;
};
/**
 * A 4x4 matrix used as a 3D transformation
 *
 * @class Float4x4
 * @extends FloatNxN
 */
export let Float4x4 = function () {
    let dim = 4;
    let _ = FloatNxN (dim);
    /**
     *
     * @param from
     * @param to
     * @return {*}
     */
    _.inverse = function (from, to) {
        // adapted from a bit of obfuscated, unwound, code
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : _.create ()));
        let A = from[0] * from[5] - from[1] * from[4], B = from[0] * from[6] - from[2] * from[4],
            C = from[9] * from[14] - from[10] * from[13], D = from[9] * from[15] - from[11] * from[13],
            E = from[10] * from[15] - from[11] * from[14], F = from[0] * from[7] - from[3] * from[4],
            G = from[1] * from[6] - from[2] * from[5], H = from[1] * from[7] - from[3] * from[5],
            K = from[2] * from[7] - from[3] * from[6], L = from[8] * from[13] - from[9] * from[12],
            M = from[8] * from[14] - from[10] * from[12], N = from[8] * from[15] - from[11] * from[12],
            Q = 1 / (A * E - B * D + F * C + G * N - H * M + K * L);
        to[0] = (from[5] * E - from[6] * D + from[7] * C) * Q;
        to[1] = (-from[1] * E + from[2] * D - from[3] * C) * Q;
        to[2] = (from[13] * K - from[14] * H + from[15] * G) * Q;
        to[3] = (-from[9] * K + from[10] * H - from[11] * G) * Q;
        to[4] = (-from[4] * E + from[6] * N - from[7] * M) * Q;
        to[5] = (from[0] * E - from[2] * N + from[3] * M) * Q;
        to[6] = (-from[12] * K + from[14] * F - from[15] * B) * Q;
        to[7] = (from[8] * K - from[10] * F + from[11] * B) * Q;
        to[8] = (from[4] * D - from[5] * N + from[7] * L) * Q;
        to[9] = (-from[0] * D + from[1] * N - from[3] * L) * Q;
        to[10] = (from[12] * H - from[13] * F + from[15] * A) * Q;
        to[11] = (-from[8] * H + from[9] * F - from[11] * A) * Q;
        to[12] = (-from[4] * C + from[5] * M - from[6] * L) * Q;
        to[13] = (from[0] * C - from[1] * M + from[2] * L) * Q;
        to[14] = (-from[12] * G + from[13] * B - from[14] * A) * Q;
        to[15] = (from[8] * G - from[9] * B + from[10] * A) * Q;
        return to;
    };
    /**
     *
     * @param f4
     * @param f4x4
     * @param to
     * @return {*}
     */
    _.preMultiply = function (f4, f4x4, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : Float4.create ()));
        let f40 = f4[0], f41 = f4[1], f42 = f4[2], f43 = f4[3];
        to[0] = (f4x4[0] * f40) + (f4x4[4] * f41) + (f4x4[8] * f42) + (f4x4[12] * f43);
        to[1] = (f4x4[1] * f40) + (f4x4[5] * f41) + (f4x4[9] * f42) + (f4x4[13] * f43);
        to[2] = (f4x4[2] * f40) + (f4x4[6] * f41) + (f4x4[10] * f42) + (f4x4[14] * f43);
        to[3] = (f4x4[3] * f40) + (f4x4[7] * f41) + (f4x4[11] * f42) + (f4x4[15] * f43);
        return to;
    };
    /**
     *
     * @param f4x4
     * @param f4
     * @param to
     * @return {*}
     */
    _.postMultiply = function (f4x4, f4, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : Float4.create ()));
        let f40 = f4[0], f41 = f4[1], f42 = f4[2], f43 = f4[3];
        to[0] = (f4x4[0] * f40) + (f4x4[1] * f41) + (f4x4[2] * f42) + (f4x4[3] * f43);
        to[1] = (f4x4[4] * f40) + (f4x4[5] * f41) + (f4x4[6] * f42) + (f4x4[7] * f43);
        to[2] = (f4x4[8] * f40) + (f4x4[9] * f41) + (f4x4[10] * f42) + (f4x4[11] * f43);
        to[3] = (f4x4[12] * f40) + (f4x4[13] * f41) + (f4x4[14] * f42) + (f4x4[15] * f43);
        return to;
    };
    /**
     *
     * @param angle
     */
    _.rotateX = function (angle) {
        let to = _.identity ();
        to[5] = to[10] = Math.cos (angle);
        to[9] = -(to[6] = Math.sin (angle));
        return to;
    };
    /**
     *
     * @param angle
     */
    _.rotateY = function (angle) {
        let to = _.identity ();
        to[0] = to[10] = Math.cos (angle);
        to[2] = -(to[8] = Math.sin (angle));
        return to;
    };
    /**
     *
     * @param angle
     */
    _.rotateZ = function (angle) {
        let to = _.identity ();
        to[0] = to[5] = Math.cos (angle);
        to[4] = -(to[1] = Math.sin (angle));
        return to;
    };
    /**
     *
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     * @param to
     * @return {*}
     */
    let frustum = function (left, right, bottom, top, near, far, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : _.create ()));
        let width = right - left, height = top - bottom, depth = far - near;
        to[0] = (near * 2) / width; to[1] = 0; to[2] = 0; to[3] = 0;
        to[4] = 0; to[5] = (near * 2) / height; to[6] = 0; to[7] = 0;
        to[8] = (right + left) / width; to[9] = (top + bottom) / height; to[10] = -(far + near) / depth; to[11] = -1;
        to[12] = 0; to[13] = 0; to[14] = (-2.0 * far * near) / depth; to[15] = 0;
        return to;
    };
    _.frustum = frustum;
    /**
     *
     * @param fov
     * @param aspectRatio
     * @param nearPlane
     * @param farPlane
     * @param to
     */
    _.perspective = function (fov, aspectRatio, nearPlane, farPlane, to) {
        let halfWidth = nearPlane * Math.tan (Utility.degreesToRadians(fov * 0.5));
        let halfHeight = halfWidth * aspectRatio;
        return frustum (-halfHeight, halfHeight, -halfWidth, halfWidth, nearPlane, farPlane, to);
    };
    /**
     *
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     * @param to
     * @return {*}
     */
    _.orthographic = function (left, right, bottom, top, near, far, to) {
        to = (to = (((typeof to !== "undefined") && (to != null)) ? to : _.create ()));
        let width = right - left, height = top - bottom, depth = far - near;
        to[0] = 2 / width; to[1] = 0; to[2] = 0; to[3] = 0;
        to[4] = 0; to[5] = 2 / height; to[6] = 0; to[7] = 0;
        to[8] = 0; to[9] = 0; to[10] = -2 / depth; to[11] = 0;
        to[12] = -(left + right) / width; to[13] = -(top + bottom) / height; to[14] = -(far + near) / depth; to[15] = 1;
        return to;
    };
    /**
     *
     * @param xAxis
     * @param yAxis
     * @param zAxis
     * @param from
     * @return {FloatNxN|Object}
     */
    let viewMatrix = function (xAxis, yAxis, zAxis, from) {
        let to = _.create ();
        to[0] = xAxis[0]; to[1] = xAxis[1]; to[2] = xAxis[2]; to[3] = 0;
        to[4] = yAxis[0]; to[5] = yAxis[1]; to[6] = yAxis[2]; to[7] = 0;
        to[8] = zAxis[0]; to[9] = zAxis[1]; to[10] = zAxis[2]; to[11] = 0;
        to[12] = from[0]; to[13] = from[1]; to[14] = from[2]; to[15] = 1;
        return _.inverse (to);
    };
    _.viewMatrix = viewMatrix;
    /**
     *
     * @param from
     * @param along
     * @param up
     * @return {FloatNxN|Object}
     */
    let lookFrom = function (from, along, up) {
        up = Float3.normalize (Utility.defaultValue (up, [0.0, 1.0, 0.0]));
        let zAxis = Float3.normalize (along);
        let xAxis = Float3.normalize (Float3.cross (up, zAxis));
        let yAxis = Float3.normalize (Float3.cross (zAxis, xAxis));
        return viewMatrix (xAxis, yAxis, zAxis, from);
    };
    _.lookFrom = lookFrom;
    /**
     *
     * @param from
     * @param at
     * @param up
     */
    _.lookFromAt = function (from, at, up) {
        return lookFrom (from, Float3.subtract (from, at), up);
    };
    /**
     *
     * @param size
     * @param fov
     * @param along
     * @param at
     * @param up
     */
    _.lookAt = function (size, fov, along, at, up) {
        let distance = size / Math.tan (Utility.degreesToRadians (fov * 0.5));
        let from = Float3.add (at, Float3.scale (along, distance / Float3.norm (along)));
        return lookFrom (from, along, up);
    };
    /**
     *
     * @param zAxis
     * @param up
     * @return {FloatNxN|Object}
     */
    _.rotateZAxisTo = function (zAxis, up) {
        up = Utility.defaultFunction(up, function () { return [0, 1, 0]; });
        zAxis = Float3.normalize (zAxis);
        let xAxis = Float3.normalize (Float3.cross (up, zAxis));
        let yAxis = Float3.normalize (Float3.cross (zAxis, xAxis));
        let to = _.create();
        to[0] = xAxis[0]; to[1] = xAxis[1]; to[2] = xAxis[2]; to[3] = 0;
        to[4] = yAxis[0]; to[5] = yAxis[1]; to[6] = yAxis[2]; to[7] = 0;
        to[8] = zAxis[0]; to[9] = zAxis[1]; to[10] = zAxis[2]; to[11] = 0;
        to[12] = 0; to[13] = 0; to[14] = 0; to[15] = 1;
        return to;
    };
    /**
     *
     * @param n
     * @param up
     * @return {FloatNxN|Object}
     */
    _.rotateXAxisTo = function (xAxis, up) {
        up = Utility.defaultFunction(up, function () { return [0, 1, 0]; });
        xAxis = Float3.normalize (xAxis);
        let zAxis = Float3.normalize (Float3.cross (xAxis, up));
        let yAxis = Float3.normalize (Float3.cross (zAxis, xAxis));
        let to = _.create();
        to[0] = xAxis[0]; to[1] = xAxis[1]; to[2] = xAxis[2]; to[3] = 0;
        to[4] = yAxis[0]; to[5] = yAxis[1]; to[6] = yAxis[2]; to[7] = 0;
        to[8] = zAxis[0]; to[9] = zAxis[1]; to[10] = zAxis[2]; to[11] = 0;
        to[12] = 0; to[13] = 0; to[14] = 0; to[15] = 1;
        return to;
    };
    return _;
} ();
export let WebGL2 = function () {
    let $ = Object.create (null);
    let ClassBase = $.ClassBase = function () {
        let _ = Object.create (null);
        /**
         *
         * @param parameters
         * @return {_}
         */
        _.new = function (parameters) {
            // create the object. this is a bit tricky here, as "this" is referring to a static instance
            // of the class we are deriving from ("new" probably isn't overloaded)
            let baseClass = Object.create (this);
            // if there is a constructor... ensure that we have parameters, then construct the object
            if ("construct" in baseClass) {
                (parameters = (((typeof parameters !== "undefined") && (parameters != null)) ? parameters : Object.create (null)));
                baseClass.construct (parameters);
            }
            return baseClass;
        };
        return _;
    } ();
    $.CLASS_NAME_REQUIRED = "CLASS_NAME_REQUIRED";
    $.CLASS_NAME_GENERATED = "CLASS_NAME_GENERATED";
    $.CLASS_NAME_OPTIONAL = "CLASS_NAME_OPTIONAL";
    let ClassNamed = $.ClassNamed = function (nameRequired) {
        (nameRequired = (((typeof nameRequired !== "undefined") && (nameRequired != null)) ? nameRequired : $.CLASS_NAME_OPTIONAL));
        let _ = Object.create (ClassBase);
        // the container for names
        let index = Object.create (null);
        // name handling has several cases:
        // 1) it is supplied
        // 2) it is not supplied, but is auto-generated
        // 3) it is not supplied, and that is ok
        // 4) it is not supplied and that is an error
        // so a flag is needed indicating how to handle a name that is not present
        let uniqueNameId = 0;
        let validateName = function (name, replace) {
            // if the name was supplied, it's all good
            if ((typeof name !== "undefined") && (name != null)) {
                // but make sure it's not already in the index or we haven't declared we want to replace it
                if (!(name in index) || replace) {
                    return name;
                }
                throw "Duplicate name (" + name + ")";
            }
            // otherwise, we have to decide what to do, based on some construction parameters
            switch (nameRequired) {
                case $.CLASS_NAME_REQUIRED:
                    throw "Name is required";
                case $.CLASS_NAME_GENERATED:
                    return "id" + Utility.padNum(++uniqueNameId, 5);
                case $.CLASS_NAME_OPTIONAL:
                    return null;
            }
        };
        /**
         *
         * @param parameters
         * @param name
         * @return {_}
         */
        _.new = function (parameters, name) {
            // ensure parameters is a valid object
            (parameters = (((typeof parameters !== "undefined") && (parameters != null)) ? parameters : Object.create (null)));
            // validate the name, store a valid one in the parameters
            if ((name = validateName(name, (parameters.replace = (((typeof parameters.replace !== "undefined") && (parameters.replace != null)) ? parameters.replace : false)))) != null) parameters.name = name;
            // create the object the normal way. carefully, "this" is the static instance of the class
            // we are deriving from ("new" probably isn't overloaded)
            let classNamed = Object.getPrototypeOf(_).new.call (this, parameters);
            // index the object if we have a valid name
            if (name != null) {
                classNamed.name = name;
                index[name] = classNamed;
            }
            return classNamed;
        };
        /**
         *
         * @param name
         * @return {*}
         */
        _.get = function (name) {
            return index[name];
        };
        /**
         * get the name of this named thing (if it has one).
         *
         * @method getName
         * @return {string} the name of this node, or just "node".
         */
        _.getName = function () {
            return ("name" in this) ? this.name : "node";
        };
        /**
         *
         * @return {Object}
         */
        _.getIndex = function () {
            return index;
        };
        /**
         *
         * @param todo
         */
        _.forEach = function (todo) {
            // note this proceeds in hash order, whatever that might be
            for (let name in index) {
                let named = index[name];
                todo (named);
            }
        };
        return _;
    };
    let OnReady = $.OnReady = function () {
        let _ = Object.create (null);
        _.construct = function (scope, callback) {
            this.scope = scope;
            this.callback = callback;
            return this;
        };
        _.notify = function (parameter) {
            this.callback.call (this.scope, parameter);
        };
        _.new = function (scope, callback) {
            return Object.create (_).construct(scope, callback);
        };
        return _;
    } ();
    let PointerTracker = $.PointerTracker = function () {
        let _ = Object.create (ClassBase);
        let trackers = {};
        let previousDeltaSq = 0;
        let debugPeKeys = function () {
            //document.getElementById("pekeys").innerText = Object.keys (trackers[Object.keys (trackers)[0]].events).join(", ");
        };
        let hole = function (event) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        };
        let pointerMoved = function (event) {
            let tracker = trackers[event.currentTarget.id];
            let events = tracker.events;
            // check if there is a tracker (because there was a pointer down)...
            if (event.pointerId in events) {
                // get the last event and save this one over it
                let lastEvent = events[event.pointerId];
                events[event.pointerId] = event;
                let bound = tracker.element.getBoundingClientRect();
                let ppfXY = function (e) { return [(e.clientX - bound.left) / bound.width, (e.clientY - bound.top) / -bound.height, 0.0] };
                let ppfZ = function (e) { return [0.0, 0.0, (e.clientY - bound.top) / -bound.height] };
                let ppfEmpty = function (e) { return [0.0, 0.0, 0.0]; };
                let simpleDelta = function () {
                    let a = ppf(event);
                    let b = ppf(lastEvent);
                    let delta = Float3.subtract (a, b);
                    if (Float3.normSq (delta) > 0) {
                        tracker.onReady.notify (delta);
                    }
                };
                let ppf;
                // look to see how many pointers we are tracking
                let eventKeys = Object.keys(events);
                switch (eventKeys.length) {
                    case 1:
                        // the simple move... check the buttons to decide how to handle it
                        ppf = [
                            ppfEmpty,
                            ppfXY, // left click
                            ppfZ, // right click
                            ppfEmpty, ppfEmpty, ppfEmpty
                        ][event.buttons];
                        simpleDelta ();
                        break;
                    case 2: {
                        // gestures - why doesn't the browser already do this?
                        // macos laptop does right click on 2-finger gesture (if configured that way in
                        // the settings)
                        // two-finger vertical slide reported as wheel
                        // pinch-in/out reported as wheel
                        let a = ppfXY(events[eventKeys[0]]);
                        let b = ppfXY(events[eventKeys[1]]);
                        let deltaSq = Float3.normSq (Float3.subtract (a, b));
                        if (previousDeltaSq > 0) {
                            let response = (deltaSq > previousDeltaSq) ? 1 : -1;
                            console.log ("response = " + response);
                            tracker.onReady.notify ([0.0, 0.0, response]);
                        }
                        previousDeltaSq = deltaSq;
                        break;
                    }
                    default:
                        // we don't handle this...
                        ppf = ppfEmpty;
                        simpleDelta();
                        break;
                }
            }
            return hole (event);
        };
        let pointerUp = function (event) {
            let tracker = trackers[event.currentTarget.id];
            delete tracker.events[event.pointerId];
            debugPeKeys ();
            return hole (event);
        };
        let pointerDown = function (event) {
            let tracker = trackers[event.currentTarget.id];
            tracker.events[event.pointerId] = event;
            previousDeltaSq = 0;
            debugPeKeys ();
            return hole (event);
        };
        let wheel = function (event) {
            let tracker = trackers[event.currentTarget.id];
            tracker.onReady.notify (Float3.copy ([0, 0, -event.deltaY]));
            return hole (event);
        };
        const KEY_LEFT = 37;
        const KEY_UP = 38;
        const KEY_RIGHT = 39;
        const KEY_DOWN = 40;
        let keyDown = function (event) {
            let tracker = trackers[event.currentTarget.id];
            switch (event.keyCode) {
                case KEY_LEFT: tracker.onReady.notify ([-tracker.stepSize, 0.0, 0.0]); break;
                case KEY_UP: tracker.onReady.notify ([0.0, tracker.stepSize, 0.0]); break;
                case KEY_RIGHT: tracker.onReady.notify ([tracker.stepSize, 0.0, 0.0]); break;
                case KEY_DOWN: tracker.onReady.notify ([0.0, -tracker.stepSize, 0.0]); break;
                default: tracker.onReady.notify ([0.0, 0.0, 0.0]); break;
            }
            return hole (event);
        };
        _.construct = function (parameters) {
            // get the elementId and save this tracker to the global list
            trackers[parameters.elementId] = this;
            // elementId, onReadyIn, stepSizeIn
            this.onReady = parameters.onReady;
            this.stepSize = (parameters.stepSize = (((typeof parameters.stepSize !== "undefined") && (parameters.stepSize != null)) ? parameters.stepSize : 0.05));
            this.events = {};
            // setup all the event handlers on this element
            let element = this.element = document.getElementById(parameters.elementId);
            element.addEventListener("pointerdown", pointerDown, false);
            element.addEventListener ("pointermove", pointerMoved, false);
            element.addEventListener ("pointerup", pointerUp, false);
            element.addEventListener ("pointercancel", pointerUp, false);
            element.addEventListener ("pointerleave", pointerUp, false);
            element.addEventListener ("pointerout", pointerUp, false);
            element.addEventListener("keydown", keyDown, false);
            element.addEventListener("wheel", wheel, false);
            element.addEventListener("contextmenu", hole, false);
            element.focus();
        };
        return _;
    } ();
    let DocumentHelper = function () {
        let _ = Object.create (ClassBase);
        /**
         *
         * @param id
         */
        _.element = function (id) {
            this[id] = document.getElementById (id);
            return this;
        };
        /**
         *
         * @param ids
         */
        _.elements = function (...ids) {
            for (let id of ids) {
                this.element (id);
            }
            return this;
        };
        /**
         *
         */
        _.all = function () {
            // find all of the elements in the document with ids...
            return this;
        };
        return _;
    } ();
    let RollingStats = $.RollingStats = function () {
        let _ = Object.create (ClassBase);
        _.construct = function (parameters) {
            this.count = Utility.defaultValue (parameters.count, 10);
            if ("fill" in parameters) {
                this.fill = parameters.fill;
            }
            this.reset ();
        };
        _.update = function (value) {
            this.sum += value;
            if (this.history.length < this.count) {
                this.history.push(value);
            } else {
                this.sum -= this.history[this.current];
                this.history[this.current] = value;
                this.current = (this.current + 1) % this.count;
            }
            let avg = this.sum / this.history.length;
            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;
            let variance = 0;
            for (let value of this.history) {
                max = Math.max (value, max);
                min = Math.min (value, min);
                let sampleVariance = (value - avg);
                variance += (sampleVariance * sampleVariance);
            }
            variance /= this.count;
            return { min: min, max: max, avg: avg, var: variance, std: Math.sqrt (variance) };
        };
        _.reset = function () {
            this.history = [];
            this.sum = 0;
            if ("fill" in this) {
                for (let i = 0; i < this.count; ++i) {
                    this.history.push (this.fill);
                    this.sum += this.fill;
                }
            }
            this.current = 0;
        };
        return _;
    } ();
    let context;
    $.getContext = function () { return context; };
    /**
     * A Rendering context.
     *
     * @class Render
     */
    let Render = $.Render = function () {
        let _ = Object.create (ClassBase);
        /**
         * The initializer for a rendering context.
         *
         * @method construct
         * @return {Render}
         */
        _.construct = function (parameters) {
            // get the parent div, create the canvas, and the rendering context
            let canvasDiv = document.getElementById (parameters.canvasDivId);
            let canvas = document.createElement("canvas");
            canvasDiv.appendChild(canvas);
            context = this.context = canvas.getContext ("webgl2", { preserveDrawingBuffer: true });
            // size everything to the parent div
            let devicePixelRatio = (window.devicePixelRatio = (((typeof window.devicePixelRatio !== "undefined") && (window.devicePixelRatio != null)) ? window.devicePixelRatio : 1));
            let resizeHandler = function (event) {
                let canvasDiv = event[0].target;
                context.viewportWidth = context.canvas.width = canvasDiv.clientWidth * devicePixelRatio;
                context.viewportHeight = context.canvas.height = canvasDiv.clientHeight * devicePixelRatio;
                context.viewport (0, 0, context.viewportWidth, context.viewportHeight);
                context.canvas.style.width = canvasDiv.clientWidth + "px";
                context.canvas.style.height = canvasDiv.clientHeight + "px";
            };
            new ResizeObserver(resizeHandler).observe(canvasDiv);
            // set up some boilerplate, loading all the default shaders
            let loaderList = LoaderList.new ().addLoaders (
                LoaderShader
                    .new ("https://webgl.irdev.us/shaders/@.glsl")
                    //.new ("shaders/@.glsl")
                    .addVertexShaders ("basic")
                    .addFragmentShaders (["basic", "basic-texture", "color", "overlay", "rgb", "texture", "vertex-color"])
            );
            // include anything the user wants to load
            if ("loaders" in parameters) {
                loaderList.addLoaders (parameters.loaders);
            }
            // go get everything
            let scope = this;
            loaderList.go (OnReady.new (null, function (x) {
                // make some shapes we might use
                Tetrahedron.make ();
                Hexahedron.make ();
                Octahedron.make ();
                Icosahedron.make ();
                Square.make ();
                Sphere.makeN (2);
                Sphere.makeN (3);
                Sphere.makeN (5);
                // create the default shaders
                Program.new ({}, "basic");
                Program.new ({ vertexShader: "basic" }, "basic-texture");
                Program.new ({ vertexShader: "basic" }, "color");
                Program.new ({ vertexShader: "basic" }, "overlay");
                Program.new ({ vertexShader: "basic" }, "rgb");
                Program.new ({ vertexShader: "basic" }, "texture");
                Program.new ({ vertexShader: "basic" }, "vertex-color");
                // call the user back when it's all ready
                if (typeof parameters.onReady !== "undefined") {
                    parameters.onReady.notify (scope);
                }
            }));
        };
        _.save = function (filename) {
            //let image = this.canvas.toDataURL ("image/png").replace ("image/png", "image/octet-stream");
            let MIME_TYPE = "image/png";
            let imgURL = this.context.canvas.toDataURL (MIME_TYPE);
            let dlLink = document.createElement ('a');
            dlLink.download = filename + ".png";
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join (':');
            document.body.appendChild (dlLink);
            dlLink.click ();
            document.body.removeChild (dlLink);
        };
        return _;
    } ();
    /**
     * A loader for external assets.
     *
     * @class Loader
     */
    let Loader = $.Loader = function () {
        let _ = Object.create (ClassBase);
        /**
         * the initializer for a loader.
         *
         * @method construct
         * @param {Object} parameters not used.
         * @return {Loader}
         */
        _.construct = function (parameters) {
            this.items = [];
            this.onReady = OnReady.new (this, this.finish);
            return this;
        };
        _.addItem = function (type, name, parameters) {
            parameters.onReady = this.onReady;
            let item = { type: type, name: name, parameters: parameters };
            this.items.push (item);
            return this;
        };
        _.finish = function (finishedItem) {
            if (finishedItem === this.pendingItem) {
                // clear the pending item, and go on to the next one
                delete this.pendingItem;
                this.next ();
            } else {
                LogLevel.say (LogLevel.ERROR, "WHAT'S UP WILLIS?");
            }
        };
        /**
         * start the fetch process for all the loadable items.
         *
         * @method go
         * @param {Object} onFinishedAll an OnReady object to notify when the loader is finished.
         */
        _.go = function (onFinishedAll) {
            this.onFinishedAll = (onFinishedAll = (((typeof onFinishedAll !== "undefined") && (onFinishedAll != null)) ? onFinishedAll : { notify: function (x) {} }));
            this.next ();
        };
        /**
         * continue the fetch process for all the loadable items.
         *
         * @method next
         */
        _.next = function () {
            if (this.items.length > 0) {
                // have work to do, kick off a fetch
                let item = this.items.shift ();
                this.pendingItem = item.type.new (item.parameters, item.name);
            } else {
                // all done, inform our waiting handler
                this.onFinishedAll.notify (this);
            }
        };
        return _;
    } ();
    /**
     * A loader for loaders.
     *
     * @class LoaderList
     */
    let LoaderList = $.LoaderList = function () {
        let _ = Object.create (ClassBase);
        /**
         * the initializer for a loader.
         *
         * @method construct
         * @param {Object} parameters not used.
         * @return {LoaderList}
         */
        _.construct = function (parameters) {
            this.items = [];
            this.onReady = OnReady.new (this, this.finish);
            return this;
        };
        _.addLoaders = function (...loaders) {
            if (Array.isArray (loaders[0])) { loaders = loaders[0]; }
            for (let loader of loaders) {
                this.items.push (loader);
            }
            return this;
        };
        _.finish = function (finishedItem) {
            if (finishedItem === this.pendingItem) {
                // clear the pending item, and go on to the next one
                delete this.pendingItem;
                this.next ();
            } else {
                LogLevel.say (LogLevel.ERROR, "WHAT'S UP WILLIS?");
            }
        };
        _.next = function () {
            if (this.items.length > 0) {
                // have work to do, kick off a fetch
                let item = this.items.shift ();
                this.pendingItem = item;
                item.go (this.onReady);
            } else {
                // all done, inform our waiting handler
                this.onFinishedAll.notify (this);
            }
        };
        /**
         * start the fetch process for all the loaders
         *
         * @method go
         * @param {Object} onFinishedAll an OnReady object to notify when the loader is finished.
         */
        _.go = function (onFinishedAll) {
            this.onFinishedAll = (onFinishedAll = (((typeof onFinishedAll !== "undefined") && (onFinishedAll != null)) ? onFinishedAll : { notify: function (x) {} }));
            this.next ();
        };
        return _;
    } ();
    /**
     * A loader for external assets, which assumes assets reside in a common base path, and are named as
     * the file element is named.
     *
     * @class LoaderPath
     */
    let LoaderPath = $.LoaderPath = function () {
        let _ = Object.create (Loader);
        /**
         * the initializer for a path loader.
         *
         * @method construct
         * @param {Object} parameters an object specifying the loader class parameters
         * @return {Loader}
         */
        _.construct = function (parameters) {
            Object.getPrototypeOf(_).construct.call(this, parameters);
            this.type = parameters.type;
            this.path = parameters.path;
            return this;
        };
        _.addItems = function (names, parameters) {
            names = Array.isArray(names) ? names : Array(1).fill(names);
            for (let name of names) {
                let params = Object.assign (Object.create (null), parameters, { url:this.path.replace ("@", name) });
                Object.getPrototypeOf(_).addItem.call(this, this.type, name, params);
            }
            return this;
        };
        return _;
    } ();
    /**
     * A loader for external shader assets.
     *
     * @class LoaderShader
     */
    let LoaderShader = $.LoaderShader = function () {
        let _ = Object.create (LoaderPath);
        /**
         * the initializer for a shader loader.
         *
         * @method construct
         * @param {string} path the common path for a path loader.
         * @return {LoaderShader}
         */
        _.construct = function (path) {
            return Object.getPrototypeOf(_).construct.call(this, { type: Shader, path: path });
        };
        let addNames = function (names, prefix) {
            names = Array.isArray(names) ? names : Array(1).fill(names);
            let result = [];
            for (let name of names) {
                result.push (prefix + "-" + name);
            }
            return result;
        };
        // this constant is from the spec, moved it here because of a cross dependency on
        // having created the context already. I hope it never changes.
        const VERTEX_SHADER = 0x8B31;
        _.addVertexShaders = function (names) {
            return Object.getPrototypeOf(_).addItems.call (this, addNames (names, "vertex"), { type: VERTEX_SHADER });
        };
        // this constant is from the spec, moved it here because of a cross dependency on
        // having created the context already. I hope it never changes.
        const FRAGMENT_SHADER = 0x8B30;
        _.addFragmentShaders = function (names) {
            return Object.getPrototypeOf(_).addItems.call (this, addNames (names, "fragment"), { type: FRAGMENT_SHADER });
        };
        return _;
    } ();
    let Shader = $.Shader = function () {
        let _ = ClassNamed ();
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Shader: " + parameters.name);
            // there must be a type and url
            if (typeof parameters.type === "undefined") throw "Shader type Required";
            if (typeof parameters.url === "undefined") throw "Shader URL Required";
            let scope = this;
            let request = new XMLHttpRequest();
            request.onload = function (event) {
                if (request.status === 200) {
                    let shader = context.createShader (parameters.type);
                    // XXX can I do a shader include mechanism of some sort?
                    context.shaderSource (shader, request.responseText);
                    context.compileShader (shader);
                    if (!context.getShaderParameter (shader, context.COMPILE_STATUS)) {
                        LogLevel.say (LogLevel.ERROR, "Shader compilation failed for " + parameters.name + ":\n" + context.getShaderInfoLog (shader));
                    } else {
                        scope.compiledShader = shader;
                    }
                }
                // call the onReady handler if one was provided
                if (typeof parameters.onReady !== "undefined") {
                    parameters.onReady.notify (scope);
                }
            };
            request.open("GET", parameters.url);
            request.send();
        };
        return _;
    } ();
    /**
     * A Vertex and Fragment "shader" pairing, and utilities for setting attributes and parameters.
     *
     * @class Program
     */
    let Program = $.Program = function () {
        let _ = ClassNamed ($.CLASS_NAME_REQUIRED);
        /**
         * the name for the standard POSITION buffer attribute in a shader.
         * @element POSITION_ATTRIBUTE
         * @type {string}
         * @final
         */
        _.POSITION_ATTRIBUTE = "POSITION_ATTRIBUTE";
        /**
         * the name for the standard NORMAL buffer attribute in a shader.
         * @element NORMAL_ATTRIBUTE
         * @type {string}
         * @final
         */
        _.NORMAL_ATTRIBUTE = "NORMAL_ATTRIBUTE";
        /**
         * the name for the standard TEXTURE buffer attribute in a shader.
         * @element TEXTURE_ATTRIBUTE
         * @type {string}
         * @final
         */
        _.TEXTURE_ATTRIBUTE = "TEXTURE_ATTRIBUTE";
        /**
         * the name for the standard COLOR buffer attribute in a shader.
         * @element COLOR_ATTRIBUTE
         * @type {string}
         * @final
         */
        _.COLOR_ATTRIBUTE = "COLOR_ATTRIBUTE";
        /**
         * the name for the standard MODEL_MATRIX buffer attribute in a shader.
         * @element COLOR_ATTRIBUTE
         * @type {string}
         * @final
         */
        _.MODEL_MATRIX_ATTRIBUTE = "MODEL_MATRIX_ATTRIBUTE";
        let currentProgram;
        /**
         * the initializer for a shader.
         *
         * @method construct
         * @param {Object} parameters shader construction parameters
         * vertexShader name of the vertex shader to use
         * fragmentShader name of the fragment shader to use
         * attributeMapping maps POSITION, NORMAL, and TEXTURE attributes to the
         * attribute names in the shader. This allows the engine to manage the attributes without
         * forcing the shader author to use "standard" names for everything. Defaults to:
         * * POSITION_ATTRIBUTE: "inputPosition"
         * * NORMAL_ATTRIBUTE: "inputNormal"
         * * TEXTURE_ATTRIBUTE: "inputTexture"
         * * COLOR_ATTRIBUTE: "inputColor"
         * * MODEL_MATRIX_ATTRIBUTE: "inputModelMatrix"
         *
         * parameterMapping maps standard parameters to the parameter names in the
         * shader. This allows the engine to manage setting the standard set of parameters on the shader
         * without forcing the shader author to use "standard" names. Defaults to:
         * * MODEL_MATRIX_PARAMETER: "modelMatrix"
         * * VIEW_MATRIX_PARAMETER: "viewMatrix"
         * * PROJECTION_MATRIX_PARAMETER: "projectionMatrix"
         * * CAMERA_POSITION: "cameraPosition"
         * * OUTPUT_ALPHA_PARAMETER: "outputAlpha"
         * * TEXTURE_SAMPLER: "textureSampler"
         * * MODEL_COLOR:"modelColor"
         * * AMBIENT_LIGHT_COLOR: "ambientLightColor"
         * * AMBIENT_CONTRIBUTION:"ambientContribution"
         * * LIGHT_DIRECTION: "lightDirection"
         * * LIGHT_COLOR:"lightColor"
         * * DIFFUSE_CONTRIBUTION:"diffuseContribution"
         * * SPECULAR_CONTRIBUTION:"specularContribution"
         * * SPECULAR_EXPONENT:"specularExponent"
         * @return {Program}
         */
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Program: " + parameters.name);
            // default value for the shader names
            parameters.vertexShader = "vertex-" + (parameters.vertexShader = (((typeof parameters.vertexShader !== "undefined") && (parameters.vertexShader != null)) ? parameters.vertexShader : parameters.name));
            parameters.fragmentShader = "fragment-" + (parameters.fragmentShader = (((typeof parameters.fragmentShader !== "undefined") && (parameters.fragmentShader != null)) ? parameters.fragmentShader : parameters.name));
            // default values for the attribute mapping
            if (!("attributeMapping" in parameters)) {
                parameters.attributeMapping = {
                    POSITION_ATTRIBUTE: "inputPosition",
                    NORMAL_ATTRIBUTE: "inputNormal",
                    TEXTURE_ATTRIBUTE: "inputTexture",
                    COLOR_ATTRIBUTE: "inputColor",
                    MODEL_MATRIX_ATTRIBUTE: "inputModelMatrix"
                };
            }
            // default values for the parameter mapping
            if (!("parameterMapping" in parameters)) {
                parameters.parameterMapping = {
                    MODEL_MATRIX_PARAMETER: "modelMatrix",
                    VIEW_MATRIX_PARAMETER: "viewMatrix",
                    PROJECTION_MATRIX_PARAMETER: "projectionMatrix",
                    CAMERA_POSITION: "cameraPosition",
                    OUTPUT_ALPHA_PARAMETER: "outputAlpha",
                    TEXTURE_SAMPLER: "textureSampler",
                    MODEL_COLOR:"modelColor",
                    AMBIENT_LIGHT_COLOR: "ambientLightColor",
                    AMBIENT_CONTRIBUTION:"ambientContribution",
                    LIGHT_DIRECTION: "lightDirection",
                    LIGHT_COLOR:"lightColor",
                    DIFFUSE_CONTRIBUTION:"diffuseContribution",
                    SPECULAR_CONTRIBUTION:"specularContribution",
                    SPECULAR_EXPONENT:"specularExponent"
                };
            }
            this.currentShape = null;
            // create the shader program and attach the components
            let program = this.program = context.createProgram ();
            context.attachShader (program, Shader.get (parameters.vertexShader).compiledShader);
            context.attachShader (program, Shader.get (parameters.fragmentShader).compiledShader);
            // force a binding of attribute 0 to the position attribute (which SHOULD always be present)
            // this avoids a performance penalty incurred if a randomly assigned attribute is on index 0
            // but is not used by a particular shape (like a normals buffer).
            context.bindAttribLocation (program, 0, parameters.attributeMapping.POSITION_ATTRIBUTE);
            // link the program and check that it succeeded
            context.linkProgram (program);
            if (!context.getProgramParameter (program, context.LINK_STATUS)) {
                LogLevel.say (LogLevel.ERROR, "Could not initialise shader");
                // XXX do we need to delete it?
            }
            // have to do this before collecting parameters and attributes, or else...
            context.useProgram (program);
            // loop over the found active shader parameters providing setter methods for them, and map
            // the ones we know about
            let parameterMapping = parameters.parameterMapping;
            let reverseParameterMapping = Utility.reverseMap (parameterMapping);
            let standardParameterMapping = this.standardParameterMapping = Object.create (null);
            for (let i = 0, end = context.getProgramParameter (program, context.ACTIVE_UNIFORMS); i < end; i++) {
                let programUniform = ProgramUniform.new (program, i);
                let programUniformName = programUniform.name;
                let setProgramUniformFunctionName = "set" + Utility.uppercase (programUniformName);
                this[setProgramUniformFunctionName] = function (value) {
                    programUniform.set (value);
                    return this;
                };
                // if the shader parameter is in the standard mapping, add that
                if (programUniformName in reverseParameterMapping) {
                    standardParameterMapping[reverseParameterMapping[programUniformName]] = setProgramUniformFunctionName;
                }
            }
            // loop over the found active attributes, and map the ones we know about
            let reverseAttributeMapping = Utility.reverseMap (parameters.attributeMapping);
            let attributes = this.attributes = Object.create (null);
            for (let i = 0, end = context.getProgramParameter (program, context.ACTIVE_ATTRIBUTES); i < end; i++) {
                let activeAttribute = context.getActiveAttrib (program, i);
                let activeAttributeName = activeAttribute.name;
                if (activeAttributeName in reverseAttributeMapping) {
                    attributes[reverseAttributeMapping[activeAttributeName]] = ProgramAttribute.new (program, activeAttribute);
                }
            }
        };
        /**
         * set the standard shader parameters in one call.
         *
         * @method setStandardUniforms
         * @param {Object} parameters a mapping of standard parameter names to values, as specified in
         * the initialization of the shader
         * @chainable
         */
        _.setStandardUniforms = function (parameters) {
            let standardParameterMapping = this.standardParameterMapping;
            for (let parameter in parameters) {
                if (parameter in standardParameterMapping) {
                    this[standardParameterMapping[parameter]] (parameters[parameter]);
                }
            }
            return this;
        };
        let bindAttribute = function (scope, which, buffer) {
            // not every shader uses every attribute, so don't bother to set them unless they will be used
            if (which in scope.attributes) {
                context.bindBuffer (context.ARRAY_BUFFER, buffer);
                scope.attributes[which].bind ();
            }
            return scope;
        };
        /**
         * bind the POSITION attribute to the given buffer.
         *
         * @method bindPositionAttribute
         * @param {Object} buffer WebGL buffer to bind
         * @chainable
         */
        _.bindPositionAttribute = function (buffer) {
            return bindAttribute(this, _.POSITION_ATTRIBUTE, buffer);
        };
        /**
         * bind the NORMAL attribute to the given buffer.
         *
         * @method bindNormalAttribute
         * @param {Object} buffer WebGL buffer to bind
         * @chainable
         */
        _.bindNormalAttribute = function (buffer) {
            return bindAttribute(this, _.NORMAL_ATTRIBUTE, buffer);
        };
        /**
         * bind the TEXTURE attribute to the given buffer.
         *
         * @method bindTextureAttribute
         * @param {Object} buffer WebGL buffer to bind
         * @chainable
         */
        _.bindTextureAttribute = function (buffer) {
            // not every shader uses every attribute, so don't bother to set this unless it will be used
            return bindAttribute (this, _.TEXTURE_ATTRIBUTE, buffer);
        };
        /**
         * bind the COLOR attribute to the given buffer.
         *
         * @method bindColorAttribute
         * @param {Object} buffer WebGL buffer to bind
         * @chainable
         */
        _.bindColorAttribute = function (buffer) {
            // not every shader uses every attribute, so don't bother to set this unless it will be used
            return bindAttribute (this, _.COLOR_ATTRIBUTE, buffer);
        };
        /**
         * bind the COLOR attribute to the given buffer.
         *
         * @method bindColorAttribute
         * @param {Object} buffer WebGL buffer to bind
         * @chainable
         */
        _.bindModelMatrixAttribute = function (buffer) {
            // not every shader uses every attribute, so don't bother to set this unless it will be used
            return bindAttribute (this, _.MODEL_MATRIX_ATTRIBUTE, buffer);
        };
        /**
         * disable the enabled buffers.
         *
         * @method unbindAttributes
         * @return {Program}
         */
        _.unbindAttributes = function () {
            for (let attribute in this.attributes) {
                this.attributes[attribute].unbind ();
            }
        };
        /**
         * fetch the shader currently in use.
         *
         * @method getCurrentProgram
         * @static
         * @return {Program}
         */
        _.getCurrentProgram = function () {
            return currentProgram;
        };
        /**
         * set this as the current shader in the rendering context.
         *
         * @method use
         * @chainable
         */
        _.use = function () {
            if (currentProgram !== this) {
                // if a program is already set, we want to unbind it's buffers to avoid an extraneous
                // buffer connection hanging around in a subsequent draw effect
                if (currentProgram) {
                    currentProgram.unbindAttributes ();
                }
                LogLevel.say (LogLevel.TRACE, "Use program: " + this.name);
                currentProgram = this;
                context.useProgram (this.program);
                // reset the current shape to ensure we bind attributes correctly after changing programs
                this.currentShape = null;
            }
            return this;
        };
        _.useShape = function (shape) {
            if (this.currentShape !== shape) {
                LogLevel.say (LogLevel.TRACE, "Use shape: " + shape.name);
                this.currentShape = shape;
                return true;
            }
            return false;
        };
        return _;
    } ();
    let ProgramUniform = function () {
        let _ = Object.create (null);
        _.construct = function (program, i) {
            let activeUniform = context.getActiveUniform (program, i);
            this.name = activeUniform.name;
            this.type = activeUniform.type;
            this.location = context.getUniformLocation (program, activeUniform.name);
            // XXX temporarily store texture indices on the program (subversive actions here)
            if (this.type === context.SAMPLER_2D) {
                this.textureIndex = ("nextTextureIndex" in program) ? program.nextTextureIndex : 0;
                program.nextTextureIndex = this.textureIndex + 1;
                LogLevel.say (LogLevel.TRACE, "Program uniform: " + this.name + " (type 0x" + this.type.toString(16) + ") at index " + this.textureIndex);
            } else {
                LogLevel.say (LogLevel.TRACE, "Program uniform: " + this.name + " (type 0x" + this.type.toString(16) + ")");
            }
            return this;
        };
        _.set = function (value) {
            LogLevel.say (LogLevel.TRACE, "Set uniform: " + this.name);
            // see https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.1 (5.14) for explanation
            switch (this.type) {
                case 0x1404: // context.INT
                    context.uniform1i (this.location, value);
                    break;
                case 0x8B53: // context.INT_VEC2
                    context.uniform2iv (this.location, value);
                    break;
                case 0x8B54: // context.INT_VEC3
                    context.uniform3iv (this.location, value);
                    break;
                case 0x8B55: // context.INT_VEC4
                    context.uniform4iv (this.location, value);
                    break;
                case 0x1406: // context.FLOAT
                    context.uniform1f (this.location, value);
                    break;
                case 0x8B50: // context.FLOAT_VEC2
                    context.uniform2fv (this.location, value);
                    break;
                case 0x8B51: // context.FLOAT_VEC3
                    context.uniform3fv (this.location, value);
                    break;
                case 0x8B52: // context.FLOAT_VEC4
                    context.uniform4fv (this.location, value);
                    break;
                case 0x8B5A: // context.FLOAT_MAT2
                    context.uniformMatrix2fv (this.location, false, value);
                    break;
                case 0x8B5B: // context.FLOAT_MAT3
                    context.uniformMatrix3fv (this.location, false, value);
                    break;
                case 0x8B5C: // context.FLOAT_MAT4
                    context.uniformMatrix4fv (this.location, false, value);
                    break;
                case 0x8B5E: // context.SAMPLER_2D
                    // TEXTURE0 is a constant, up to TEXTURE31 (just incremental adds to TEXTURE0)
                    // XXX I wonder if this will need to be unbound
                    context.activeTexture (context.TEXTURE0 + this.textureIndex);
                    context.bindTexture (context.TEXTURE_2D, Texture.get (value).texture);
                    context.uniform1i (this.location, this.textureIndex);
                    break;
            }
        };
        _.new = function (program, i) {
            return Object.create (_).construct (program, i);
        };
        return _;
    } ();
    let ProgramAttribute = function () {
        let _ = Object.create (null);
        _.construct = function (program, activeAttribute) {
            this.name = activeAttribute.name;
            this.type = activeAttribute.type;
            this.location = context.getAttribLocation (program, this.name);
            LogLevel.say (LogLevel.TRACE, "Program attribute: " + this.name + " at index " + this.location + " (type 0x" + this.type.toString(16) + ")");
            // set the bind function
            switch (this.type) {
                case 0x1404:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 1, context.INT, false, 0, 0);
                    };
                    break;
                case 0x8B53:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 2, context.INT, false, 0, 0);
                    };
                    break;
                case 0x8B54:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 3, context.INT, false, 0, 0);
                    };
                    break;
                case 0x8B55:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 4, context.INT, false, 0, 0);
                    };
                    break;
                case 0x1406:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 1, context.FLOAT, false, 0, 0);
                    };
                    break;
                case 0x8B50:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 2, context.FLOAT, false, 0, 0);
                    };
                    break;
                case 0x8B51:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 3, context.FLOAT, false, 0, 0);
                    };
                    break;
                case 0x8B52:
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        context.enableVertexAttribArray (this.location);
                        context.vertexAttribPointer (this.location, 4, context.FLOAT, false, 0, 0);
                    };
                    break;
                case 0x8B5C: // context.FLOAT_MAT4
                    this.bind = function () {
                        LogLevel.say (LogLevel.TRACE, "Bind attribute (" + this.name + ") at location " + this.location);
                        const bytesPerRow = 16;
                        const bytesPerMatrix = 4 * bytesPerRow;
                        for (let i = 0; i < 4; ++i) {
                            const location = this.location + i;
                            const offset = i * bytesPerRow;
                            context.enableVertexAttribArray (location);
                            context.vertexAttribPointer (location, 4, context.FLOAT, false, bytesPerMatrix, offset);
                            context.vertexAttribDivisor (location, 1);
                        }
                    };
                    break;
            }
            return this;
        };
        _.unbind = function () {
            LogLevel.say (LogLevel.TRACE, "Unbind attribute (" + this.name + ") at location " + this.location);
            context.disableVertexAttribArray (this.location);
        };
        _.new = function (program, activeAttribute) {
            return Object.create (_).construct (program, activeAttribute);
        };
        return _;
    } ();
    let Texture = $.Texture = function () {
        let _ = ClassNamed ($.CLASS_NAME_REQUIRED);
        let afExtension;
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Texture: " + parameters.name);
            // make sure anisotropic filtering is defined, and has a reasonable default value
            (afExtension = (((typeof afExtension !== "undefined") && (afExtension != null)) ? afExtension : function () { return context.getExtension ("EXT_texture_filter_anisotropic") } ()));
            parameters.anisotropicFiltering = Math.min (context.getParameter(afExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT), ("anisotropicFiltering" in parameters)? parameters.anisotropicFiltering : 4);
            // there must be a url
            if (typeof parameters.url === "undefined") throw "Texture URL Required";
            let texture = this.texture = context.createTexture();
            let image = new Image();
            // allow cross origin loads, all of them... it's butt stupid that this isn't the default
            image.crossOrigin = "anonymous";
            let scope = this;
            image.onload = function() {
                context.bindTexture (context.TEXTURE_2D, texture);
                context.texImage2D (context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
                context.texParameteri (context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
                if (("generateMipMap" in parameters) && (parameters.generateMipMap === true)) {
                    context.texParameteri (context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
                    context.texParameterf (context.TEXTURE_2D, afExtension.TEXTURE_MAX_ANISOTROPY_EXT, parameters.anisotropicFiltering);
                    context.generateMipmap (context.TEXTURE_2D);
                } else {
                    context.texParameteri (context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
                }
                context.bindTexture (context.TEXTURE_2D, null);
                // call the onReady handler if one was provided
                if (typeof parameters.onReady !== "undefined") {
                    parameters.onReady.notify (scope);
                }
            };
            image.src = parameters.url;
        };
        return _;
    } ();
    /**
     * A node in a scene graph.
     *
     * @class Node
     */
    let Node = $.Node = function () {
        let _ = ClassNamed ($.CLASS_NAME_GENERATED);
        /**
         * the initializer for a scene graph node.
         *
         * @method construct
         * @param {Object} parameters an object with optional information to include in the node. The
         * possibilities are:
         * * transform {Float4x4}: a transformation matrix to apply before drawing or traversing children.
         * * state {function}: a parameter-less function to call before drawing or traversing children.
         * this function may set any render state needed.
         * * shape {string}: the name of a shape to draw.
         * * children: the node will have an array of children by default, but if the node is intended
         * to be a leaf, you can save the space and time associated with an empty list by setting this
         * value to "false".
         * @return {Node}
         */
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Node: " + parameters.name);
            // we select the traverse function based on the feature requested for the node. these are
            // the bit flags to indicate the features and the value we accumulate them into. note that
            // some combinations are invalid
            let HAS_TRANSFORM = 1;
            let HAS_STATE = 2;
            let HAS_SHAPE = 4;
            let HAS_CHILDREN = 8;
            let traverseFunctionIndex = 0;
            // collect the parameters, and accumulate the flags for the features
            if ("transform" in parameters) {
                this.transform = parameters.transform;
                traverseFunctionIndex += HAS_TRANSFORM;
            }
            if ("state" in parameters) {
                this.state = parameters.state;
                traverseFunctionIndex += HAS_STATE;
            }
            if ("shape" in parameters) {
                this.shape = Shape.get (parameters.shape);
                if (typeof (this.shape) === "undefined") {
                    LogLevel.say (LogLevel.WARNNG, "Shape not found: " + parameters.shape);
                }
                // retrieve the transforms - instance might not be in parameters, but that's ok as the
                // method will create a default
                this.instanceTransforms = this.shape.createInstanceTransforms(parameters.instance);
                traverseFunctionIndex += HAS_SHAPE;
            }
            // by default, nodes are enabled
            this.enabled = (parameters.enabled = (((typeof parameters.enabled !== "undefined") && (parameters.enabled != null)) ? parameters.enabled : true));
            // children are special, the default is to include children, but we want a way to say the
            // current node is a leaf node, so { children: false } is the way to do that
            if ((!("children" in parameters)) || (parameters.children !== false)) {
                this.children = [];
                traverseFunctionIndex += HAS_CHILDREN;
            }
            // now make a traverse function depending on the included features
            let INVALID_TRAVERSE = function (transform) {
                LogLevel.say (LogLevel.WARNING, "INVALID TRAVERSE");
                return this;
            };
            LogLevel.say (LogLevel.TRACE, "Node (" + parameters.name + "): traverse (" + traverseFunctionIndex + ")");
            this.traverse = [
                // 0 nothing
                INVALID_TRAVERSE,
                // 1 transform only
                INVALID_TRAVERSE,
                // 2 state only
                INVALID_TRAVERSE,
                // 3 transform, state
                INVALID_TRAVERSE,
                // 4 shape only
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.draw (standardUniforms);
                    }
                    return this;
                },
                // 5 transform, shape
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        this.draw (standardUniforms);
                    }
                    return this;
                },
                // 6 state, shape
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        this.draw (standardUniforms);
                    }
                    return this;
                },
                // 7 transform, state, shape
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        this.draw (standardUniforms);
                    }
                    return this;
                },
                // 8 children only
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER;
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 9 transform, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        let modelMatrix = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 10 state, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER;
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 11 transform, state, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        let modelMatrix = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 12 shape, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER;
                        this.draw (standardUniforms);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 13 transform, shape, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        this.draw (standardUniforms);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 14 state, shape, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER;
                        this.draw (standardUniforms);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                },
                // 15 transform, state, shape, children
                function (standardUniforms) {
                    if (this.enabled) {
                        LogLevel.say (LogLevel.TRACE, "Traverse: " + this.name);
                        this.state (standardUniforms);
                        let modelMatrix = standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.multiply (this.transform, standardUniforms.MODEL_MATRIX_PARAMETER);
                        this.draw (standardUniforms);
                        for (let child of this.children) {
                            standardUniforms.MODEL_MATRIX_PARAMETER = modelMatrix;
                            child.traverse (standardUniforms);
                        }
                    }
                    return this;
                }
            ][traverseFunctionIndex];
            return this;
        };
        _.removeChild = function (name) {
            let existingIndex = this.children.findIndex(child => child.name === name);
            if (existingIndex >= 0) {
                this.children.splice (existingIndex, 1);
                return true;
            }
            return false;
        };
        /**
         * add a child node (only applies to non-leaf nodes).
         *
         * @method addChild
         * @param {Node} node the node to add as a child.
         * @chainable
         */
        _.addChild = function (node) {
            if ("children" in this) {
                if (this.removeChild (node.getName ())) {
                    LogLevel.say (LogLevel.WARNNG, "Removed duplicate child node (" + node.getName () + ") from (" + this.getName () + ").");
                }
                this.children.push (node);
                node.parent = this;
            } else {
                LogLevel.say (LogLevel.ERROR, "Attempting to add child (" + node.getName () + ") to node (" + this.getName () + ") that is a leaf.");
            }
            return this;
        };
        /**
         * draw this node's contents.
         *
         * @method draw
         * @param {Object} standardUniforms the container for standard parameters, as documented in
         * Program
         */
        _.draw = function (standardUniforms) {
            Program.getCurrentProgram ().setStandardUniforms (standardUniforms);
            this.shape.instanceTransforms = this.instanceTransforms;
            this.shape.draw ();
        };
        /**
         * traverse this node and its contents. this function is a place-holder that is replaced by the
         * actual function called depending on the parameters passed during construction.
         *
         * @method traverse
         * @param {Object} standardUniforms the container for standard parameters, as documented in
         * Program
         * @chainable
         */
        _.traverse = function (standardUniforms) {
            return this;
        };
        /**
         *
         */
        _.getTransform = function (root) {
            let transform = ("transform" in this) ? this.transform : Float4x4.IDENTITY;
            // walk to the root, and concatenate the transformations on the return stack
            if (((typeof root !== "undefined") && (this == root)) || (!("parent" in this))) {
                return transform;
            } else {
                return Float4x4.multiply (transform, this.parent.getTransform(root));
            }
        };
        return _;
    } ();
    let Shape = $.Shape = function () {
        let _ = ClassNamed ($.CLASS_NAME_REQUIRED);
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Shape: " + parameters.name);
            let buffers = parameters.buffers ();
            let makeBuffer = function (bufferType, source, itemSize) {
                let buffer = context.createBuffer ();
                context.bindBuffer (bufferType, buffer);
                context.bufferData (bufferType, source, context.STATIC_DRAW);
                buffer.itemSize = itemSize;
                buffer.numItems = source.length / itemSize;
                return buffer;
            };
            // we will use the combination of input
            // 0 vertex only
            // 1 vertex, normal
            // 2 vertex, texture
            // 3 vertex, normal, texture
            // 4 vertex, index
            // 5 vertex, normal, index
            // 6 vertex, texture, index
            // 7 vertex, normal, texture, index
            // 8 vertex, color
            // 9 vertex, normal, color
            // 10 vertex, texture, color
            // 11 vertex, normal, texture, color
            // 12 vertex, color, index
            // 13 vertex, normal, color, index
            // 14 vertex, texture, color, index
            // 15 vertex, normal, texture, color, index
            // build the buffers
            const HAS_NORMAL = 1;
            const HAS_TEXTURE = 2;
            const HAS_INDEX = 4;
            const HAS_COLOR = 8;
            let drawFunctionIndex = 0;
            if ("position" in buffers) {
                this.positionBuffer = makeBuffer (context.ARRAY_BUFFER, new Float32Array (buffers.position), 3);
            } else {
                LogLevel.say (LogLevel.ERROR, "What you talking about willis?");
            }
            if ("normal" in buffers) {
                this.normalBuffer = makeBuffer (context.ARRAY_BUFFER, new Float32Array (buffers.normal), 3);
                drawFunctionIndex += HAS_NORMAL;
            }
            if ("texture" in buffers) {
                this.textureBuffer = makeBuffer (context.ARRAY_BUFFER, new Float32Array (buffers.texture), 2);
                drawFunctionIndex += HAS_TEXTURE;
            }
            if ("index" in buffers) {
                this.indexBuffer = makeBuffer (context.ELEMENT_ARRAY_BUFFER, new Uint16Array (buffers.index), 1);
                drawFunctionIndex += HAS_INDEX;
            }
            if ("color" in buffers) {
                this.colorBuffer = makeBuffer (context.ARRAY_BUFFER, new Float32Array (buffers.color), 4);
                drawFunctionIndex += HAS_COLOR;
            }
            this.draw = [
                // 0 vertex only
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced(context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 1 vertex, normal
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 2 vertex, texture
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 3 vertex, normal, texture
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced(context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 4 vertex, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 5 vertex, normal, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 6 vertex, texture, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 7 vertex, normal, texture, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 8 vertex, color
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 9 vertex, normal, color
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 10 vertex, texture, color
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 11 vertex, normal, texture, color
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                        }
                        context.drawArraysInstanced (context.TRIANGLES, 0, this.positionBuffer.numItems, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 12 vertex, color, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 13 vertex, normal, color, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 14 vertex, texture, color, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
                // 15 vertex, normal, texture, color, index
                function () {
                    try {
                        let program = Program.getCurrentProgram ();
                        if (program.useShape (this)) {
                            program
                                .bindPositionAttribute (this.positionBuffer)
                                .bindNormalAttribute (this.normalBuffer)
                                .bindTextureAttribute (this.textureBuffer)
                                .bindColorAttribute (this.colorBuffer)
                                .bindModelMatrixAttribute (this.instanceTransforms.buffer);
                            context.bufferSubData(context.ARRAY_BUFFER, 0, this.instanceTransforms.data);
                            context.bindBuffer (context.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                        }
                        context.drawElementsInstanced (context.TRIANGLES, this.indexBuffer.numItems, context.UNSIGNED_SHORT, 0, this.instanceTransforms.count);
                    } catch (err) {
                        LogLevel.say (LogLevel.ERROR, err.message);
                    }
                },
            ][drawFunctionIndex];
            // create a default instance transform that is a single identity matrix
            // XXX nodes will create their own default objects
            //this.instanceTransforms = this.createInstanceTransforms ();
            return this;
        };
        _.createInstanceTransforms = function (matrices) {
            const bytesPerFloat = 4;
            const floatsPerMatrix = 16;
            // make the source valid, matrices could be undefined, a number, or an empty array
            if (typeof (matrices) === "undefined") {
                // make it be a number to be initialized by the next step
                matrices = 1;
            }
            if ((typeof(matrices) === "number") || (matrices.length === 0)) {
                let tmp = [];
                for (let i = 0, end = Math.max (1, matrices); i < end; ++i) {
                    tmp.push (Float4x4.IDENTITY);
                }
                matrices = tmp;
            }
            let count = matrices.length;
            // create the transforms
            let instanceTransforms = {
                count: count,
                data: new Float32Array(count * floatsPerMatrix),
                matrices: [],
                buffer: function () {
                    let buffer = context.createBuffer ();
                    context.bindBuffer (context.ARRAY_BUFFER, buffer);
                    context.bufferData (context.ARRAY_BUFFER, count * floatsPerMatrix * bytesPerFloat, context.DYNAMIC_DRAW);
                    return buffer;
                } ()
            };
            // create "views" into the data so we can update the transforms easily
            for (let i = 0; i < count; ++i) {
                const byteOffsetToMatrix = i * floatsPerMatrix * bytesPerFloat;
                let view = new Float32Array (instanceTransforms.data.buffer, byteOffsetToMatrix, floatsPerMatrix)
                instanceTransforms.matrices.push(view);
                // and init it to the source
                Float4x4.copy (matrices[i], view);
            }
            // return the result
            return instanceTransforms;
        };
        return _;
    } ();
    let Thing = $.Thing = function () {
        let _ = ClassNamed ($.CLASS_NAME_GENERATED);
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "Thing: " + parameters.name);
            this.node = parameters.node;
            this.update = parameters.update;
        };
        _.updateAll = function (time) {
            _.forEach(function (thing) { thing.update (time); });
        };
        return _;
    } ();
    let TextFile = $.TextFile = function () {
        let _ = ClassNamed ($.CLASS_NAME_REQUIRED);
        _.construct = function (parameters) {
            LogLevel.say (LogLevel.INFO, "TextFile: " + parameters.name);
            // there must be a url
            if (typeof parameters.url === "undefined") throw "TextFile URL Required";
            let scope = this;
            let request = new XMLHttpRequest ();
            request.onload = function (event) {
                if (request.status === 200) {
                    scope.text = request.responseText;
                }
                // call the onReady handler if one was provided
                if (typeof parameters.onReady !== "undefined") {
                    parameters.onReady.notify (scope);
                }
            };
            request.open ("GET", parameters.url);
            request.send ();
        };
        return _;
    } ();
    let ShapeBuilder = $.ShapeBuilder = function () {
        let _ = Object.create (null);
        _.construct = function (precision) {
            this.precision = (precision = (((typeof precision !== "undefined") && (precision != null)) ? precision : 7));
            this.vertexIndex = Object.create (null);
            this.vertices = [];
            this.faces = [];
            this.normals = [];
            this.texture = [];
            return this;
        };
        _.addVertex = function (vertex) {
            let str = Float3.str(vertex);
            if (str in this.vertexIndex) {
                return this.vertexIndex[str];
            } else {
                let index = this.vertices.length;
                this.vertices.push(vertex);
                this.vertexIndex[str] = index;
                return index;
            }
        };
        _.addVertexNormal = function (vertex, normal) {
            let str = Float3.str(vertex) + Float3.str(normal);
            if (str in this.vertexIndex) {
                return this.vertexIndex[str];
            } else {
                let index = this.vertices.length;
                this.vertices.push(vertex);
                this.normals.push (normal);
                this.vertexIndex[str] = index;
                return index;
            }
        };
        _.addVertexTexture = function (vertex, texture) {
            let str = Float3.str(vertex) + Float2.str(texture);
            if (str in this.vertexIndex) {
                return this.vertexIndex[str];
            } else {
                let index = this.vertices.length;
                this.vertices.push(vertex);
                this.texture.push (texture);
                this.vertexIndex[str] = index;
                return index;
            }
        };
        _.addVertexNormalTexture = function (vertex, normal, texture) {
            let str = Float3.str(vertex) + Float3.str(normal) + Float2.str(texture);
            if (str in this.vertexIndex) {
                return this.vertexIndex[str];
            } else {
                let index = this.vertices.length;
                this.vertices.push(vertex);
                this.normals.push (normal);
                this.texture.push (texture);
                this.vertexIndex[str] = index;
                return index;
            }
        };
        _.addFace = function (face) {
            this.faces.push(face);
        };
        _.makeBuffers = function () {
            LogLevel.say (LogLevel.TRACE, this.vertices.length + " vertices for " + this.faces.length + " faces");
            let result = {
                position: Utility.flatten(this.vertices),
                index: Utility.flatten(this.faces)
            };
            if (this.normals.length > 0) {
                result.normal = Utility.flatten(this.normals);
            }
            if (this.texture.length > 0) {
                result.texture = Utility.flatten(this.texture);
            }
            return result;
        };
        _.makeFacets = function () {
            let vertex = [];
            let normal = [];
            for (let face of this.faces) {
                // get the first three vertices of the face to compute the normal
                let a = this.vertices[face[0]];
                let b = this.vertices[face[1]];
                let c = this.vertices[face[2]];
                let ab = Float3.normalize(Float3.subtract(b, a));
                let bc = Float3.normalize(Float3.subtract(c, b));
                let n = Float3.cross(ab, bc);
                // now loop over all of the points to add them to the vertices
                for (let i = 0; i < face.length; ++i) {
                    vertex.push(this.vertices[face[i]]);
                    normal.push(n);
                }
            }
            return {
                position: Utility.flatten(vertex),
                normal: Utility.flatten(normal)
            };
        };
        _.new = function (precision) {
            return Object.create (ShapeBuilder).construct (precision);
        };
        return _;
    } ();
    let Primitive = $.Primitive = function () {
        let _ = Object.create (null);
        _.getShapeBuilder = function () {
        };
        _.makeFromBuilder = function (name, builder) {
            (name = (((typeof name !== "undefined") && (name != null)) ? name : this.name));
            return Shape.new({
                buffers: function () {
                    return builder.makeFacets ();
                }
            }, name);
        };
        _.make = function (name) {
            let builder = this.getShapeBuilder();
            return this.makeFromBuilder(name, builder);
        };
        return _;
    }();
    let Tetrahedron = $.Tetrahedron = function () {
        let _ = Object.create (Primitive);
        _.name = "tetrahedron";
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new ();
            builder.addVertex([1, 1, 1]);
            builder.addVertex([-1, 1, -1]);
            builder.addVertex([-1, -1, 1]);
            builder.addVertex([1, -1, -1]);
            builder.addFace([0, 1, 2]);
            builder.addFace([1, 3, 2]);
            builder.addFace([2, 3, 0]);
            builder.addFace([3, 1, 0]);
            return builder;
        };
        return _;
    } ();
    let Hexahedron = $.Hexahedron = function () {
        let _ = Object.create(Primitive);
        _.name = "cube";
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new();
            builder.addVertex([-1, -1, -1]);
            builder.addVertex([-1, 1, -1]);
            builder.addVertex([1, 1, -1]);
            builder.addVertex([1, -1, -1]);
            builder.addVertex([-1, -1, 1]);
            builder.addVertex([-1, 1, 1]);
            builder.addVertex([1, 1, 1]);
            builder.addVertex([1, -1, 1]);
            builder.addFace([0, 1, 2, 0, 2, 3]); // Front face
            builder.addFace([7, 6, 5, 7, 5, 4]); // Back face
            builder.addFace([1, 5, 6, 1, 6, 2]); // Top face
            builder.addFace([4, 0, 3, 4, 3, 7]); // Bottom face
            builder.addFace([4, 5, 1, 4, 1, 0]); // Left face
            builder.addFace([3, 2, 6, 3, 6, 7]); // Right face
            return builder;
        };
        return _;
    }();
    let Octahedron = $.Octahedron = function () {
        let _ = Object.create(Primitive);
        _.name = "octahedron";
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new();
            builder.addVertex([0, 1, 0]);
            builder.addVertex([1, 0, 0]);
            builder.addVertex([0, 0, 1]);
            builder.addVertex([-1, 0, 0]);
            builder.addVertex([0, 0, -1]);
            builder.addVertex([0, -1, 0]);
            builder.addFace([0, 2, 1]);
            builder.addFace([0, 3, 2]);
            builder.addFace([0, 4, 3]);
            builder.addFace([0, 1, 4]);
            builder.addFace([5, 1, 2]);
            builder.addFace([5, 2, 3]);
            builder.addFace([5, 3, 4]);
            builder.addFace([5, 4, 1]);
            return builder;
        };
        return _;
    }();
    let Icosahedron = $.Icosahedron = function () {
        let _ = Object.create(Primitive);
        _.name = "icosahedron";
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new();
            let t = (1.0 + Math.sqrt(5.0)) / 2.0;
            let s = 1 / t;
            t = 1;
            builder.addVertex([-s, t, 0]);
            builder.addVertex([s, t, 0]);
            builder.addVertex([-s, -t, 0]);
            builder.addVertex([s, -t, 0]);
            builder.addVertex([0, -s, t]);
            builder.addVertex([0, s, t]);
            builder.addVertex([0, -s, -t]);
            builder.addVertex([0, s, -t]);
            builder.addVertex([t, 0, -s]);
            builder.addVertex([t, 0, s]);
            builder.addVertex([-t, 0, -s]);
            builder.addVertex([-t, 0, s]);
            builder.addFace([0, 11, 5]);
            builder.addFace([0, 5, 1]);
            builder.addFace([0, 1, 7]);
            builder.addFace([0, 7, 10]);
            builder.addFace([0, 10, 11]);
            builder.addFace([1, 5, 9]);
            builder.addFace([5, 11, 4]);
            builder.addFace([11, 10, 2]);
            builder.addFace([10, 7, 6]);
            builder.addFace([7, 1, 8]);
            builder.addFace([3, 9, 4]);
            builder.addFace([3, 4, 2]);
            builder.addFace([3, 2, 6]);
            builder.addFace([3, 6, 8]);
            builder.addFace([3, 8, 9]);
            builder.addFace([4, 9, 5]);
            builder.addFace([2, 4, 11]);
            builder.addFace([6, 2, 10]);
            builder.addFace([8, 6, 7]);
            builder.addFace([9, 8, 1]);
            return builder;
        };
        return _;
    }();
    let Square = $.Square = function () {
        let _ = Object.create(Primitive);
        _.name = "square";
        // override the make from builder to use buffers...
        _.makeFromBuilder = function (name, builder) {
            (name = (((typeof name !== "undefined") && (name != null)) ? name : this.name));
            return Shape.new ({
                buffers: function () {
                    return builder.makeBuffers ();
                }
            }, name);
        };
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new();
            builder.addVertexNormalTexture([ 1.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0]);
            builder.addVertexNormalTexture([-1.0, 1.0, 0.0], [0.0, 0.0, 1.0], [0.0, 0.0]);
            builder.addVertexNormalTexture([-1.0, -1.0, 0.0], [0.0, 0.0, 1.0], [0.0, 1.0]);
            builder.addVertexNormalTexture([ 1.0, -1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 1.0]);
            builder.addFace([0, 1, 2, 0, 2, 3]);
            return builder;
        };
        return _;
    }();
    let Sphere = $.Sphere = function () {
        let _ = Object.create (Primitive);
        _.name = "sphere";
        _.parameters = {
            baseShapeBuilderType: Icosahedron,
            subdivisions: 4
        };
        _.getShapeBuilder = function () {
            let builder = ShapeBuilder.new ();
            let addVertex = function (vertex) {
                return builder.addVertex (Float3.normalize (vertex));
            };
            let baseShapeBuilder = this.parameters.baseShapeBuilderType.getShapeBuilder ();
            // add all the vertices and faces from the baseShapeBuilder into ours...
            for (let vertex of baseShapeBuilder.vertices) {
                addVertex (vertex);
            }
            let vertices = builder.vertices;
            let faces = builder.faces = baseShapeBuilder.faces;
            // function to subdivide a face
            let subdivide = function () {
                // remove the triangle we want to subdivide, which is always the first one
                let tri = faces.splice (0, 1)[0];
                // compute three new vertices as the averages of each pair of vertices
                let v0 = addVertex (Float3.add (vertices[tri[0]], vertices[tri[1]]));
                let v1 = addVertex (Float3.add (vertices[tri[1]], vertices[tri[2]]));
                let v2 = addVertex (Float3.add (vertices[tri[2]], vertices[tri[0]]));
                // add 4 new triangles to replace the one we removed
                builder.addFace ([tri[0], v0, v2]);
                builder.addFace ([tri[1], v1, v0]);
                builder.addFace ([tri[2], v2, v1]);
                builder.addFace ([v0, v1, v2]);
            };
            // subdivide the triangles we already defined, do this the requested number of times (3
            // seems to be the minimum for a spherical appearance)
            LogLevel.say (LogLevel.TRACE, "Build sphere...");
            for (let j = 0; j < this.parameters.subdivisions; ++j) {
                LogLevel.say (LogLevel.TRACE, "Iteration " + j + " with " + vertices.length + " points in " + faces.length + " triangles");
                for (let i = 0, faceCount = faces.length; i < faceCount; ++i) {
                    subdivide ();
                }
            }
            LogLevel.say (LogLevel.TRACE, "Finished sphere with " + vertices.length + " points in " + faces.length + " triangles");
            return builder;
        };
        _.makeFromBuilder = function (name, builder) {
            (name = (((typeof name !== "undefined") && (name != null)) ? name : this.name));
            return Shape.new ({
                buffers: function () {
                    let buffers = builder.makeBuffers ();
                    buffers.normal = buffers.position;
                    return buffers;
                }
            }, name);
        };
        _.makeN = function (n) {
            this.parameters.subdivisions = n;
            this.make (this.name + n);
        };
        return _;
    } ();
    let makeNormal = function (outline) {
        let last = outline.length - 1;
        // variable and function to capture the computed normals
        let N = [];
        let pushNormal = function (a, c) {
            let ac = Float2.subtract (a, c);
            let acPerp = Float2.perpendicular (ac);
            N.push (Float2.normalize (acPerp));
        };
        // loop over the outline points to compute a normal for each one, we use a vector that is
        // perpendicular to the segment ac as the normal.
        if (Float2.equals (outline[0], outline[last])) {
            // the shape is closed, so we want to wrap around
            for (let b = 0; b <= last; ++b) {
                let a = outline[((b - 1) + last) % last];
                let c = outline[(b + 1) % last];
                pushNormal (a, c);
            }
        } else {
            // the shape is open, so we double the first and last points for the normals
            // XXX there might be better ways to do this...
            for (let b = 0; b <= last; ++b) {
                let a = outline[(b === 0) ? b : b - 1];
                let c = outline[(b === last) ? b : b + 1];
                pushNormal (a, c);
            }
        }
        return N;
    };
    let makeRevolve = $.makeRevolve = function (name, outline, normal, steps, projection) {
        // outline is an array of Float2, and the axis of revolution is x = 0, we make a number of
        // wedges, from top to bottom, to complete the revolution.
        // projection is a function to map the position to a texture coordinate
        let epsilon = 1.0e-6;
        let last = outline.length - 1;
        // make sure we have normals, generating a default set if necessary
        (normal = (((typeof normal !== "undefined") && (normal != null)) ? normal : makeNormal (outline)));
        // default projection is a plate carree, equirectangular projection
        // https://en.wikipedia.org/wiki/Equirectangular_projection
        (projection = (((typeof projection !== "undefined") && (projection != null)) ? projection : function (uvY) { return uvY; }));
        return Shape.new ({
            buffers: function () {
                // compute the steps we need to make to build the rotated shape
                LogLevel.say (LogLevel.TRACE, "Make revolved outline");
                let builder = ShapeBuilder.new ();
                let stepAngle = (-2.0 * Math.PI) / steps;
                for (let i = 0; i < steps; ++i) {
                    // this could be just i + 1, but doing the modulus might help prevent a crack
                    let j = i + 1;
                    let iAngle = i * stepAngle, iCosAngle = Math.cos (iAngle), iSinAngle = Math.sin (iAngle);
                    let jAngle = (j % steps) * stepAngle, jCosAngle = Math.cos (jAngle), jSinAngle = Math.sin (jAngle);
                    for (let m = 0; m < last; ++m) {
                        // the line segment mn is now going to be swept over the angle range ij
                        let n = m + 1;
                        let vm = outline[m], nm = normal[m];
                        let vn = outline[n], nn = normal[n];
                        // we allow degenerate faces by duplicating vertices in the outline, if the length
                        // between the two components is below the threshold, we skip this facet altogether.
                        if (Float2.norm (Float2.subtract (vm, vn)) > epsilon) {
                            // for each facet of the wedge, it's either a degenerate segment, an upward
                            // facing triangle, a downward facing triangle, or a quad.
                            let facetType = ((vm[0] < epsilon) ? 0 : 2) + ((vn[0] < epsilon) ? 0 : 1);
                            switch (facetType) {
                                case 0: // degenerate, emit nothing
                                    break;
                                case 1: { // top cap, emit 1 triangle
                                    let vim = builder.addVertexNormalTexture ([0, vm[1], 0], [nm[0] * iCosAngle, nm[1], nm[0] * iSinAngle], [i / steps, projection (m / last)]);
                                    let vin = builder.addVertexNormalTexture ([vn[0] * iCosAngle, vn[1], vn[0] * iSinAngle], [nn[0] * iCosAngle, nn[1], nn[0] * iSinAngle], [i / steps, projection (n / last)]);
                                    let vjn = builder.addVertexNormalTexture ([vn[0] * jCosAngle, vn[1], vn[0] * jSinAngle], [nn[0] * jCosAngle, nn[1], nn[0] * jSinAngle], [j / steps, projection (n / last)]);
                                    builder.addFace ([vim, vin, vjn]);
                                    break;
                                }
                                case 2: { // bottom cap, emit 1 triangle
                                    let vim = builder.addVertexNormalTexture ([vm[0] * iCosAngle, vm[1], vm[0] * iSinAngle], [nm[0] * iCosAngle, nm[1], nm[0] * iSinAngle], [i / steps, projection (m / last)]);
                                    let vjm = builder.addVertexNormalTexture ([vm[0] * jCosAngle, vm[1], vm[0] * jSinAngle], [nm[0] * jCosAngle, nm[1], nm[0] * jSinAngle], [j / steps, projection (m / last)]);
                                    let vin = builder.addVertexNormalTexture ([0, vn[1], 0], [nn[0] * iCosAngle, nn[1], nn[0] * iSinAngle], [i / steps, projection (n / last)]);
                                    builder.addFace ([vim, vin, vjm]);
                                    break;
                                }
                                case 3: { // quad, emit 2 triangles
                                    let vim = builder.addVertexNormalTexture ([vm[0] * iCosAngle, vm[1], vm[0] * iSinAngle], [nm[0] * iCosAngle, nm[1], nm[0] * iSinAngle], [i / steps, projection (m / last)]);
                                    let vin = builder.addVertexNormalTexture ([vn[0] * iCosAngle, vn[1], vn[0] * iSinAngle], [nn[0] * iCosAngle, nn[1], nn[0] * iSinAngle], [i / steps, projection (n / last)]);
                                    let vjm = builder.addVertexNormalTexture ([vm[0] * jCosAngle, vm[1], vm[0] * jSinAngle], [nm[0] * jCosAngle, nm[1], nm[0] * jSinAngle], [j / steps, projection (m / last)]);
                                    let vjn = builder.addVertexNormalTexture ([vn[0] * jCosAngle, vn[1], vn[0] * jSinAngle], [nn[0] * jCosAngle, nn[1], nn[0] * jSinAngle], [j / steps, projection (n / last)]);
                                    builder.addFace ([vjm, vim, vjn, vjn, vim, vin]);
                                    break;
                                }
                            }
                        }
                    }
                }
                return builder.makeBuffers ();
            }
        }, name);
    };
    let makeBall = $.makeBall = function (name, steps) {
        LogLevel.say (LogLevel.TRACE, "Make ball...");
        // generate an outline, and then revolve it
        let outline = [];
        let normal = [];
        let stepAngle = Math.PI / steps;
        for (let i = 0; i <= steps; ++i) {
            let angle = stepAngle * i;
            // using an angle setup so that 0 is (0, 1), and Pi is (0, -1) means switching (x, y) so we
            // get an outline that can be revolved around the x=0 axis
            let value = Float2.fixNum([Math.sin (angle), Math.cos (angle)]);
            outline.push (value);
            normal.push (value);
        }
        // revolve the surface, the outline is a half circle, so the revolved surface needs to be twice
        // as many steps to go all the way around
        return makeRevolve(name, outline, normal, steps * 2);
    };
    let makeSimpleExtrude = $.makeSimpleExtrude = function (name, outline, length, normal, projection) {
        // outline is an array of Float2 in XY, and the axis of extrusion is Z = 0, we make a polygon
        // for each segment of the edge, skipping zero-length segments
        // make sure we have length, with default of 2, assuming an outline spans -1..1
        (length = (((typeof length !== "undefined") && (length != null)) ? length : 2));
        // make sure we have normals, generating a default set if necessary
        (normal = (((typeof normal !== "undefined") && (normal != null)) ? normal : makeNormal (outline)));
        return Shape.new ({
            buffers: function () {
                // compute the steps we need to make to build the extruded shape
                LogLevel.say (LogLevel.TRACE, "Make extruded outline");
                let builder = ShapeBuilder.new ();
                let epsilon = 1.0e-6;
                let halfLength = length / 2.0;
                let last = outline.length - 1;
                for (let m = 0; m < last; ++m) {
                    // the line segment mn is now going to be extruded along the z-axis
                    let n = m + 1;
                    let vm = outline[m], nm = normal[m];
                    let vn = outline[n], nn = normal[n];
                    // we allow degenerate faces by duplicating vertices in the outline, if the length
                    // between the two components is below the threshold, we skip this facet altogether.
                    if (Float2.norm (Float2.subtract (vm, vn)) > epsilon) {
                        // each facet of the outline is a quad, emit 2 triangles
                        let vm0 = builder.addVertexNormalTexture ([vm[0], vm[1], -halfLength], [nm[0], nm[1], 0], [0, m / last]);
                        let vm1 = builder.addVertexNormalTexture ([vm[0], vm[1], halfLength], [nm[0], nm[1], 0], [1, m / last]);
                        let vn0 = builder.addVertexNormalTexture ([vn[0], vn[1], -halfLength], [nn[0], nn[1], 0], [0, n / last]);
                        let vn1 = builder.addVertexNormalTexture ([vn[0], vn[1], halfLength], [nn[0], nn[1], 0], [1, n / last]);
                        builder.addFace ([vm0, vm1, vn1, vn0, vm0, vn1]);
                    }
                }
                return builder.makeBuffers ();
            }
        }, name);
    };
    return $;
};
let TestContainer = function () {
    let _ = Object.create (null);
    // test design philosophy is to be verbose on failure, and silent on pass
    let assertEquals = function (msg, a, b) {
        a = (!isNaN (a)) ? Utility.fixNum (a) : a;
        b = (!isNaN (b)) ? Utility.fixNum (b) : b;
        if (a != b) {
            LogLevel.say (LogLevel.ERROR, "(FAIL ASSERTION) " + msg + " (" + a + " == " + b + ")");
            return false;
        }
        return true;
    };
    let assertArrayEquals = function (msg, a, b) {
        if (a.length == b.length) {
            for (let i = 0; i < a.length; ++i) {
                if (!assertEquals(msg + "[" + i + "]", a[i], b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            LogLevel.say (LogLevel.ERROR, msg + " (mismatched arrays, FAIL ASSERTION)");
            return false;
        }
    };
    let tests = [
        function () {
            LogLevel.say (LogLevel.INFO, "FloatN...");
            let x = [1.0, 2.0, 13.0, 0.5, 7.0];
            let Float5 = FloatN (5);
            let minor = Float5.minor (x);
            assertEquals("Minor Axis", Float5.minor (x), 3);
            assertEquals("Major Axis", Float5.major (x), 2);
        },
        function () {
            LogLevel.say (LogLevel.INFO, "Float4x4...");
            let viewMatrix = Float4x4.identity ();
            viewMatrix = Float4x4.multiply (Float4x4.rotateX (Utility.degreesToRadians (27.5)), viewMatrix);
            viewMatrix = Float4x4.multiply (Float4x4.translate ([ 0, -1.5, -3.5 ]), viewMatrix);
            viewMatrix = Float4x4.multiply (Float4x4.rotateY (Utility.degreesToRadians (10)), viewMatrix);
            viewMatrix = Float4x4.multiply (Float4x4.scale ([ 2, 2, 2 ]), viewMatrix);
            viewMatrix = Float4x4.multiply (Float4x4.translate ([ -0.5, -0.5, -0.5 ]), viewMatrix);
            let inverted = Float4x4.inverse(viewMatrix, Float4x4.create());
            let inverted2 = [
                0.49240389466285706, 1.7235358695799619e-9, 0.08682408928871155, 0,
                0.040090903639793396, 0.4435054361820221, -0.22736681997776031, 0,
                -0.07701390981674194, 0.23087431490421295, 0.4367676079273224, -0,
                0.1961156576871872, 1.25, 2.2234134674072266, 1
            ];
            assertArrayEquals("inverted == inverted2", inverted, inverted2)
        }
    ];
    _.runTests = function () {
        LogLevel.say (LogLevel.INFO, "Running Tests...");
        for (let test of tests) {
            test ();
        }
        LogLevel.say (LogLevel.INFO, "Finished Running Tests.");
    };
    return _;
} ();
TestContainer.runTests();
