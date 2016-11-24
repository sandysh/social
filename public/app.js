webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;
	var sourceMap = obj.sourceMap;

	if (media) {
		styleElement.setAttribute("media", media);
	}

	if (sourceMap) {
		// https://developer.chrome.com/devtools/docs/javascript-debugging
		// this makes source maps inside style tags work properly in Chrome
		css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}


/***/ },
/* 5 */,
/* 6 */
/***/ function(module, exports) {

"use strict";
/*!
 * vue-resource v1.0.3
 * https://github.com/vuejs/vue-resource
 * Released under the MIT License.
 */

'use strict';

/**
 * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
 */

var RESOLVED = 0;
var REJECTED = 1;
var PENDING = 2;

function Promise$1(executor) {

    this.state = PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise$1.reject = function (r) {
    return new Promise$1(function (resolve, reject) {
        reject(r);
    });
};

Promise$1.resolve = function (x) {
    return new Promise$1(function (resolve, reject) {
        resolve(x);
    });
};

Promise$1.all = function all(iterable) {
    return new Promise$1(function (resolve, reject) {
        var count = 0,
            result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (var i = 0; i < iterable.length; i += 1) {
            Promise$1.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise$1.race = function race(iterable) {
    return new Promise$1(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i += 1) {
            Promise$1.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var p$1 = Promise$1.prototype;

p$1.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PENDING) {
        if (x === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        var called = false;

        try {
            var then = x && x['then'];

            if (x !== null && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;
                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        } catch (e) {
            if (!called) {
                promise.reject(e);
            }
            return;
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

p$1.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PENDING) {
        if (reason === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        promise.state = REJECTED;
        promise.value = reason;
        promise.notify();
    }
};

p$1.notify = function notify() {
    var promise = this;

    nextTick(function () {
        if (promise.state !== PENDING) {
            while (promise.deferred.length) {
                var deferred = promise.deferred.shift(),
                    onResolved = deferred[0],
                    onRejected = deferred[1],
                    resolve = deferred[2],
                    reject = deferred[3];

                try {
                    if (promise.state === RESOLVED) {
                        if (typeof onResolved === 'function') {
                            resolve(onResolved.call(undefined, promise.value));
                        } else {
                            resolve(promise.value);
                        }
                    } else if (promise.state === REJECTED) {
                        if (typeof onRejected === 'function') {
                            resolve(onRejected.call(undefined, promise.value));
                        } else {
                            reject(promise.value);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            }
        }
    });
};

p$1.then = function then(onResolved, onRejected) {
    var promise = this;

    return new Promise$1(function (resolve, reject) {
        promise.deferred.push([onResolved, onRejected, resolve, reject]);
        promise.notify();
    });
};

p$1.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

/**
 * Promise adapter.
 */

if (typeof Promise === 'undefined') {
    window.Promise = Promise$1;
}

function PromiseObj(executor, context) {

    if (executor instanceof Promise) {
        this.promise = executor;
    } else {
        this.promise = new Promise(executor.bind(context));
    }

    this.context = context;
}

PromiseObj.all = function (iterable, context) {
    return new PromiseObj(Promise.all(iterable), context);
};

PromiseObj.resolve = function (value, context) {
    return new PromiseObj(Promise.resolve(value), context);
};

PromiseObj.reject = function (reason, context) {
    return new PromiseObj(Promise.reject(reason), context);
};

PromiseObj.race = function (iterable, context) {
    return new PromiseObj(Promise.race(iterable), context);
};

var p = PromiseObj.prototype;

p.bind = function (context) {
    this.context = context;
    return this;
};

p.then = function (fulfilled, rejected) {

    if (fulfilled && fulfilled.bind && this.context) {
        fulfilled = fulfilled.bind(this.context);
    }

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new PromiseObj(this.promise.then(fulfilled, rejected), this.context);
};

p.catch = function (rejected) {

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new PromiseObj(this.promise.catch(rejected), this.context);
};

p.finally = function (callback) {

    return this.then(function (value) {
        callback.call(this);
        return value;
    }, function (reason) {
        callback.call(this);
        return Promise.reject(reason);
    });
};

/**
 * Utility functions.
 */

var debug = false;var util = {};var slice = [].slice;


function Util (Vue) {
    util = Vue.util;
    debug = Vue.config.debug || !Vue.config.silent;
}

function warn(msg) {
    if (typeof console !== 'undefined' && debug) {
        console.warn('[VueResource warn]: ' + msg);
    }
}

function error(msg) {
    if (typeof console !== 'undefined') {
        console.error(msg);
    }
}

function nextTick(cb, ctx) {
    return util.nextTick(cb, ctx);
}

function trim(str) {
    return str.replace(/^\s*|\s*$/g, '');
}

function toLower(str) {
    return str ? str.toLowerCase() : '';
}

function toUpper(str) {
    return str ? str.toUpperCase() : '';
}

var isArray = Array.isArray;

function isString(val) {
    return typeof val === 'string';
}

function isBoolean(val) {
    return val === true || val === false;
}

function isFunction(val) {
    return typeof val === 'function';
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isPlainObject(obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function isBlob(obj) {
    return typeof Blob !== 'undefined' && obj instanceof Blob;
}

function isFormData(obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData;
}

function when(value, fulfilled, rejected) {

    var promise = PromiseObj.resolve(value);

    if (arguments.length < 2) {
        return promise;
    }

    return promise.then(fulfilled, rejected);
}

function options(fn, obj, opts) {

    opts = opts || {};

    if (isFunction(opts)) {
        opts = opts.call(obj);
    }

    return merge(fn.bind({ $vm: obj, $options: opts }), fn, { $options: opts });
}

function each(obj, iterator) {

    var i, key;

    if (obj && typeof obj.length == 'number') {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (isObject(obj)) {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
}

var assign = Object.assign || _assign;

function merge(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source, true);
    });

    return target;
}

function defaults(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {

        for (var key in source) {
            if (target[key] === undefined) {
                target[key] = source[key];
            }
        }
    });

    return target;
}

function _assign(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source);
    });

    return target;
}

function _merge(target, source, deep) {
    for (var key in source) {
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {};
            }
            if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = [];
            }
            _merge(target[key], source[key], deep);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

/**
 * Root Prefix Transform.
 */

function root (options, next) {

    var url = next(options);

    if (isString(options.root) && !url.match(/^(https?:)?\//)) {
        url = options.root + '/' + url;
    }

    return url;
}

/**
 * Query Parameter Transform.
 */

function query (options, next) {

    var urlParams = Object.keys(Url.options.params),
        query = {},
        url = next(options);

    each(options.params, function (value, key) {
        if (urlParams.indexOf(key) === -1) {
            query[key] = value;
        }
    });

    query = Url.params(query);

    if (query) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + query;
    }

    return url;
}

/**
 * URL Template v2.0.6 (https://github.com/bramstein/url-template)
 */

function expand(url, params, variables) {

    var tmpl = parse(url),
        expanded = tmpl.expand(params);

    if (variables) {
        variables.push.apply(variables, tmpl.vars);
    }

    return expanded;
}

function parse(template) {

    var operators = ['+', '#', '.', '/', ';', '?', '&'],
        variables = [];

    return {
        vars: variables,
        expand: function (context) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
                if (expression) {

                    var operator = null,
                        values = [];

                    if (operators.indexOf(expression.charAt(0)) !== -1) {
                        operator = expression.charAt(0);
                        expression = expression.substr(1);
                    }

                    expression.split(/,/g).forEach(function (variable) {
                        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                        values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                        variables.push(tmp[1]);
                    });

                    if (operator && operator !== '+') {

                        var separator = ',';

                        if (operator === '?') {
                            separator = '&';
                        } else if (operator !== '#') {
                            separator = operator;
                        }

                        return (values.length !== 0 ? operator : '') + values.join(separator);
                    } else {
                        return values.join(',');
                    }
                } else {
                    return encodeReserved(literal);
                }
            });
        }
    };
}

function getValues(context, operator, key, modifier) {

    var value = context[key],
        result = [];

    if (isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            value = value.toString();

            if (modifier && modifier !== '*') {
                value = value.substring(0, parseInt(modifier, 10));
            }

            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
        } else {
            if (modifier === '*') {
                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            result.push(encodeValue(operator, value[k], k));
                        }
                    });
                }
            } else {
                var tmp = [];

                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        tmp.push(encodeValue(operator, value));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(encodeValue(operator, value[k].toString()));
                        }
                    });
                }

                if (isKeyOperator(operator)) {
                    result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                } else if (tmp.length !== 0) {
                    result.push(tmp.join(','));
                }
            }
        }
    } else {
        if (operator === ';') {
            result.push(encodeURIComponent(key));
        } else if (value === '' && (operator === '&' || operator === '?')) {
            result.push(encodeURIComponent(key) + '=');
        } else if (value === '') {
            result.push('');
        }
    }

    return result;
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
    return operator === ';' || operator === '&' || operator === '?';
}

function encodeValue(operator, value, key) {

    value = operator === '+' || operator === '#' ? encodeReserved(value) : encodeURIComponent(value);

    if (key) {
        return encodeURIComponent(key) + '=' + value;
    } else {
        return value;
    }
}

function encodeReserved(str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part);
        }
        return part;
    }).join('');
}

/**
 * URL Template (RFC 6570) Transform.
 */

function template (options) {

    var variables = [],
        url = expand(options.url, options.params, variables);

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
}

/**
 * Service for URL templating.
 */

var ie = document.documentMode;
var el = document.createElement('a');

function Url(url, params) {

    var self = this || {},
        options = url,
        transform;

    if (isString(url)) {
        options = { url: url, params: params };
    }

    options = merge({}, Url.options, self.$options, options);

    Url.transforms.forEach(function (handler) {
        transform = factory(handler, transform, self.$vm);
    });

    return transform(options);
}

/**
 * Url options.
 */

Url.options = {
    url: '',
    root: null,
    params: {}
};

/**
 * Url transforms.
 */

Url.transforms = [template, query, root];

/**
 * Encodes a Url parameter string.
 *
 * @param {Object} obj
 */

Url.params = function (obj) {

    var params = [],
        escape = encodeURIComponent;

    params.add = function (key, value) {

        if (isFunction(value)) {
            value = value();
        }

        if (value === null) {
            value = '';
        }

        this.push(escape(key) + '=' + escape(value));
    };

    serialize(params, obj);

    return params.join('&').replace(/%20/g, '+');
};

/**
 * Parse a URL and return its components.
 *
 * @param {String} url
 */

Url.parse = function (url) {

    if (ie) {
        el.href = url;
        url = el.href;
    }

    el.href = url;

    return {
        href: el.href,
        protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
        port: el.port,
        host: el.host,
        hostname: el.hostname,
        pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
        search: el.search ? el.search.replace(/^\?/, '') : '',
        hash: el.hash ? el.hash.replace(/^#/, '') : ''
    };
};

function factory(handler, next, vm) {
    return function (options) {
        return handler.call(vm, options, next);
    };
}

function serialize(params, obj, scope) {

    var array = isArray(obj),
        plain = isPlainObject(obj),
        hash;

    each(obj, function (value, key) {

        hash = isObject(value) || isArray(value);

        if (scope) {
            key = scope + '[' + (plain || hash ? key : '') + ']';
        }

        if (!scope && array) {
            params.add(value.name, value.value);
        } else if (hash) {
            serialize(params, value, key);
        } else {
            params.add(key, value);
        }
    });
}

/**
 * XDomain client (Internet Explorer).
 */

function xdrClient (request) {
    return new PromiseObj(function (resolve) {

        var xdr = new XDomainRequest(),
            handler = function (_ref) {
            var type = _ref.type;


            var status = 0;

            if (type === 'load') {
                status = 200;
            } else if (type === 'error') {
                status = 500;
            }

            resolve(request.respondWith(xdr.responseText, { status: status }));
        };

        request.abort = function () {
            return xdr.abort();
        };

        xdr.open(request.method, request.getUrl());
        xdr.timeout = 0;
        xdr.onload = handler;
        xdr.onerror = handler;
        xdr.ontimeout = handler;
        xdr.onprogress = function () {};
        xdr.send(request.getBody());
    });
}

/**
 * CORS Interceptor.
 */

var ORIGIN_URL = Url.parse(location.href);
var SUPPORTS_CORS = 'withCredentials' in new XMLHttpRequest();

function cors (request, next) {

    if (!isBoolean(request.crossOrigin) && crossOrigin(request)) {
        request.crossOrigin = true;
    }

    if (request.crossOrigin) {

        if (!SUPPORTS_CORS) {
            request.client = xdrClient;
        }

        delete request.emulateHTTP;
    }

    next();
}

function crossOrigin(request) {

    var requestUrl = Url.parse(Url(request));

    return requestUrl.protocol !== ORIGIN_URL.protocol || requestUrl.host !== ORIGIN_URL.host;
}

/**
 * Body Interceptor.
 */

function body (request, next) {

    if (isFormData(request.body)) {

        request.headers.delete('Content-Type');
    } else if (isObject(request.body) || isArray(request.body)) {

        if (request.emulateJSON) {
            request.body = Url.params(request.body);
            request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            request.body = JSON.stringify(request.body);
        }
    }

    next(function (response) {

        Object.defineProperty(response, 'data', {
            get: function () {
                return this.body;
            },
            set: function (body) {
                this.body = body;
            }
        });

        return response.bodyText ? when(response.text(), function (text) {

            var type = response.headers.get('Content-Type');

            if (isString(type) && type.indexOf('application/json') === 0) {

                try {
                    response.body = JSON.parse(text);
                } catch (e) {
                    response.body = null;
                }
            } else {
                response.body = text;
            }

            return response;
        }) : response;
    });
}

/**
 * JSONP client.
 */

function jsonpClient (request) {
    return new PromiseObj(function (resolve) {

        var name = request.jsonp || 'callback',
            callback = '_jsonp' + Math.random().toString(36).substr(2),
            body = null,
            handler,
            script;

        handler = function (_ref) {
            var type = _ref.type;


            var status = 0;

            if (type === 'load' && body !== null) {
                status = 200;
            } else if (type === 'error') {
                status = 500;
            }

            resolve(request.respondWith(body, { status: status }));

            delete window[callback];
            document.body.removeChild(script);
        };

        request.params[name] = callback;

        window[callback] = function (result) {
            body = JSON.stringify(result);
        };

        script = document.createElement('script');
        script.src = request.getUrl();
        script.type = 'text/javascript';
        script.async = true;
        script.onload = handler;
        script.onerror = handler;

        document.body.appendChild(script);
    });
}

/**
 * JSONP Interceptor.
 */

function jsonp (request, next) {

    if (request.method == 'JSONP') {
        request.client = jsonpClient;
    }

    next(function (response) {

        if (request.method == 'JSONP') {

            return when(response.json(), function (json) {

                response.body = json;

                return response;
            });
        }
    });
}

/**
 * Before Interceptor.
 */

function before (request, next) {

    if (isFunction(request.before)) {
        request.before.call(this, request);
    }

    next();
}

/**
 * HTTP method override Interceptor.
 */

function method (request, next) {

    if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
        request.headers.set('X-HTTP-Method-Override', request.method);
        request.method = 'POST';
    }

    next();
}

/**
 * Header Interceptor.
 */

function header (request, next) {

    var headers = assign({}, Http.headers.common, !request.crossOrigin ? Http.headers.custom : {}, Http.headers[toLower(request.method)]);

    each(headers, function (value, name) {
        if (!request.headers.has(name)) {
            request.headers.set(name, value);
        }
    });

    next();
}

/**
 * Timeout Interceptor.
 */

function timeout (request, next) {

    var timeout;

    if (request.timeout) {
        timeout = setTimeout(function () {
            request.abort();
        }, request.timeout);
    }

    next(function (response) {

        clearTimeout(timeout);
    });
}

/**
 * XMLHttp client.
 */

function xhrClient (request) {
    return new PromiseObj(function (resolve) {

        var xhr = new XMLHttpRequest(),
            handler = function (event) {

            var response = request.respondWith('response' in xhr ? xhr.response : xhr.responseText, {
                status: xhr.status === 1223 ? 204 : xhr.status, // IE9 status bug
                statusText: xhr.status === 1223 ? 'No Content' : trim(xhr.statusText)
            });

            each(trim(xhr.getAllResponseHeaders()).split('\n'), function (row) {
                response.headers.append(row.slice(0, row.indexOf(':')), row.slice(row.indexOf(':') + 1));
            });

            resolve(response);
        };

        request.abort = function () {
            return xhr.abort();
        };

        if (request.progress) {
            if (request.method === 'GET') {
                xhr.addEventListener('progress', request.progress);
            } else if (/^(POST|PUT)$/i.test(request.method)) {
                xhr.upload.addEventListener('progress', request.progress);
            }
        }

        xhr.open(request.method, request.getUrl(), true);

        if ('responseType' in xhr) {
            xhr.responseType = 'blob';
        }

        if (request.credentials === true) {
            xhr.withCredentials = true;
        }

        request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.timeout = 0;
        xhr.onload = handler;
        xhr.onerror = handler;
        xhr.send(request.getBody());
    });
}

/**
 * Base client.
 */

function Client (context) {

    var reqHandlers = [sendRequest],
        resHandlers = [],
        handler;

    if (!isObject(context)) {
        context = null;
    }

    function Client(request) {
        return new PromiseObj(function (resolve) {

            function exec() {

                handler = reqHandlers.pop();

                if (isFunction(handler)) {
                    handler.call(context, request, next);
                } else {
                    warn('Invalid interceptor of type ' + typeof handler + ', must be a function');
                    next();
                }
            }

            function next(response) {

                if (isFunction(response)) {

                    resHandlers.unshift(response);
                } else if (isObject(response)) {

                    resHandlers.forEach(function (handler) {
                        response = when(response, function (response) {
                            return handler.call(context, response) || response;
                        });
                    });

                    when(response, resolve);

                    return;
                }

                exec();
            }

            exec();
        }, context);
    }

    Client.use = function (handler) {
        reqHandlers.push(handler);
    };

    return Client;
}

function sendRequest(request, resolve) {

    var client = request.client || xhrClient;

    resolve(client(request));
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * HTTP Headers.
 */

var Headers = function () {
    function Headers(headers) {
        var _this = this;

        classCallCheck(this, Headers);


        this.map = {};

        each(headers, function (value, name) {
            return _this.append(name, value);
        });
    }

    Headers.prototype.has = function has(name) {
        return getName(this.map, name) !== null;
    };

    Headers.prototype.get = function get(name) {

        var list = this.map[getName(this.map, name)];

        return list ? list[0] : null;
    };

    Headers.prototype.getAll = function getAll(name) {
        return this.map[getName(this.map, name)] || [];
    };

    Headers.prototype.set = function set(name, value) {
        this.map[normalizeName(getName(this.map, name) || name)] = [trim(value)];
    };

    Headers.prototype.append = function append(name, value) {

        var list = this.getAll(name);

        if (list.length) {
            list.push(trim(value));
        } else {
            this.set(name, value);
        }
    };

    Headers.prototype.delete = function _delete(name) {
        delete this.map[getName(this.map, name)];
    };

    Headers.prototype.forEach = function forEach(callback, thisArg) {
        var _this2 = this;

        each(this.map, function (list, name) {
            each(list, function (value) {
                return callback.call(thisArg, value, name, _this2);
            });
        });
    };

    return Headers;
}();

function getName(map, name) {
    return Object.keys(map).reduce(function (prev, curr) {
        return toLower(name) === toLower(curr) ? curr : prev;
    }, null);
}

function normalizeName(name) {

    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name');
    }

    return trim(name);
}

/**
 * HTTP Response.
 */

var Response = function () {
    function Response(body, _ref) {
        var url = _ref.url;
        var headers = _ref.headers;
        var status = _ref.status;
        var statusText = _ref.statusText;
        classCallCheck(this, Response);


        this.url = url;
        this.ok = status >= 200 && status < 300;
        this.status = status || 0;
        this.statusText = statusText || '';
        this.headers = new Headers(headers);
        this.body = body;

        if (isString(body)) {

            this.bodyText = body;
        } else if (isBlob(body)) {

            this.bodyBlob = body;

            if (isBlobText(body)) {
                this.bodyText = blobText(body);
            }
        }
    }

    Response.prototype.blob = function blob() {
        return when(this.bodyBlob);
    };

    Response.prototype.text = function text() {
        return when(this.bodyText);
    };

    Response.prototype.json = function json() {
        return when(this.text(), function (text) {
            return JSON.parse(text);
        });
    };

    return Response;
}();

function blobText(body) {
    return new PromiseObj(function (resolve) {

        var reader = new FileReader();

        reader.readAsText(body);
        reader.onload = function () {
            resolve(reader.result);
        };
    });
}

function isBlobText(body) {
    return body.type.indexOf('text') === 0 || body.type.indexOf('json') !== -1;
}

/**
 * HTTP Request.
 */

var Request = function () {
    function Request(options) {
        classCallCheck(this, Request);


        this.body = null;
        this.params = {};

        assign(this, options, {
            method: toUpper(options.method || 'GET')
        });

        if (!(this.headers instanceof Headers)) {
            this.headers = new Headers(this.headers);
        }
    }

    Request.prototype.getUrl = function getUrl() {
        return Url(this);
    };

    Request.prototype.getBody = function getBody() {
        return this.body;
    };

    Request.prototype.respondWith = function respondWith(body, options) {
        return new Response(body, assign(options || {}, { url: this.getUrl() }));
    };

    return Request;
}();

/**
 * Service for sending network requests.
 */

var CUSTOM_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
var COMMON_HEADERS = { 'Accept': 'application/json, text/plain, */*' };
var JSON_CONTENT_TYPE = { 'Content-Type': 'application/json;charset=utf-8' };

function Http(options) {

    var self = this || {},
        client = Client(self.$vm);

    defaults(options || {}, self.$options, Http.options);

    Http.interceptors.forEach(function (handler) {
        client.use(handler);
    });

    return client(new Request(options)).then(function (response) {

        return response.ok ? response : PromiseObj.reject(response);
    }, function (response) {

        if (response instanceof Error) {
            error(response);
        }

        return PromiseObj.reject(response);
    });
}

Http.options = {};

Http.headers = {
    put: JSON_CONTENT_TYPE,
    post: JSON_CONTENT_TYPE,
    patch: JSON_CONTENT_TYPE,
    delete: JSON_CONTENT_TYPE,
    custom: CUSTOM_HEADERS,
    common: COMMON_HEADERS
};

Http.interceptors = [before, timeout, method, body, jsonp, header, cors];

['get', 'delete', 'head', 'jsonp'].forEach(function (method) {

    Http[method] = function (url, options) {
        return this(assign(options || {}, { url: url, method: method }));
    };
});

['post', 'put', 'patch'].forEach(function (method) {

    Http[method] = function (url, body, options) {
        return this(assign(options || {}, { url: url, method: method, body: body }));
    };
});

/**
 * Service for interacting with RESTful services.
 */

function Resource(url, params, actions, options) {

    var self = this || {},
        resource = {};

    actions = assign({}, Resource.actions, actions);

    each(actions, function (action, name) {

        action = merge({ url: url, params: assign({}, params) }, options, action);

        resource[name] = function () {
            return (self.$http || Http)(opts(action, arguments));
        };
    });

    return resource;
}

function opts(action, args) {

    var options = assign({}, action),
        params = {},
        body;

    switch (args.length) {

        case 2:

            params = args[0];
            body = args[1];

            break;

        case 1:

            if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
                body = args[0];
            } else {
                params = args[0];
            }

            break;

        case 0:

            break;

        default:

            throw 'Expected up to 4 arguments [params, body], got ' + args.length + ' arguments';
    }

    options.body = body;
    options.params = assign({}, options.params, params);

    return options;
}

Resource.actions = {

    get: { method: 'GET' },
    save: { method: 'POST' },
    query: { method: 'GET' },
    update: { method: 'PUT' },
    remove: { method: 'DELETE' },
    delete: { method: 'DELETE' }

};

/**
 * Install plugin.
 */

function plugin(Vue) {

    if (plugin.installed) {
        return;
    }

    Util(Vue);

    Vue.url = Url;
    Vue.http = Http;
    Vue.resource = Resource;
    Vue.Promise = PromiseObj;

    Object.defineProperties(Vue.prototype, {

        $url: {
            get: function () {
                return options(Vue.url, this, this.$options.url);
            }
        },

        $http: {
            get: function () {
                return options(Vue.http, this, this.$options.http);
            }
        },

        $resource: {
            get: function () {
                return Vue.resource.bind(this);
            }
        },

        $promise: {
            get: function () {
                var _this = this;

                return function (executor) {
                    return new Vue.Promise(executor, _this);
                };
            }
        }

    });
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

module.exports = plugin;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(exports, "a", function() { return SET_TASKS; });
/* harmony export (binding) */ __webpack_require__.d(exports, "b", function() { return ADD_TASK; });
/* harmony export (binding) */ __webpack_require__.d(exports, "c", function() { return UPDATE_TASK; });
/* harmony export (binding) */ __webpack_require__.d(exports, "d", function() { return DELETE_TASK; });
/* harmony export (binding) */ __webpack_require__.d(exports, "e", function() { return LOADING_TASK; });
/* harmony export (binding) */ __webpack_require__.d(exports, "f", function() { return SKIP_CREATE_COMPANY; });
/* Tasks Mutation Types */
var SET_TASKS = 'SET_TASKS';
var ADD_TASK = 'ADD_TASK';
var UPDATE_TASK = 'UPDATE_TASK';
var DELETE_TASK = 'DELETE_TASK';
var LOADING_TASK = 'LOADING_TASK';

/*User Settings Mutation Types*/
var SKIP_CREATE_COMPANY = 'SKIP_CREATE_COMPANY';

/***/ },
/* 8 */,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

var Auth = __webpack_require__(19)();

module.exports = (function () {

    return function install(Vue, options) {
        var auth,
            driver = __webpack_require__(20)

            driver.Vue = Vue;

        auth = new Auth(options, driver);

        var login = auth.login;
        var fetch = auth.fetch;
        var logout = auth.logout;
        var oauth2 = auth.oauth2;
        var refresh = auth.refresh;
        var register = auth.register;
        var loginOther = auth.loginOther;
        var logoutOther = auth.logoutOther;

        Object.defineProperties(Vue.prototype, {
            $auth: {
                get: function () {
                    auth.login = login.bind(this);
                    auth.fetch = fetch.bind(this);
                    auth.logout = logout.bind(this);
                    auth.oauth2 = oauth2.bind(this);
                    auth.refresh = refresh.bind(this);
                    auth.register = register.bind(this);
                    auth.loginOther = loginOther.bind(this);
                    auth.logoutOther = logoutOther.bind(this);

                    return auth;
                }
            }
        });
    }
})();

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony default export */ exports["a"] = {
    rolesVar: 'roles'
};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);


__WEBPACK_IMPORTED_MODULE_0_vue___default.a.component('notification', __webpack_require__(67));
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.component('loader', __webpack_require__(66));

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);


__WEBPACK_IMPORTED_MODULE_0_vue___default.a.directive('char-counter', {
    inserted: function inserted(el) {
        $(el).characterCounter();
    }
});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_pages_News_vue__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_pages_News_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_pages_News_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_pages_Teams_vue__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_pages_Teams_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_pages_Teams_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_pages_Login_vue__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_pages_Login_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_pages_Login_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_pages_Events_vue__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_pages_Events_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_pages_Events_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_pages_tasks_Tasks_vue__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_pages_tasks_Tasks_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_pages_tasks_Tasks_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_pages_Dashboard_vue__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_pages_Dashboard_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_pages_Dashboard_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_pages_Projects_vue__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_pages_Projects_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__components_pages_Projects_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_pages_Messages_vue__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_pages_Messages_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__components_pages_Messages_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_pages_errors_Error404_vue__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__components_pages_errors_Error404_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__components_pages_errors_Error404_vue__);










/* harmony default export */ exports["a"] = [{
    path: '/',
    name: 'dashboard',
    meta: { auth: true },
    component: __WEBPACK_IMPORTED_MODULE_5__components_pages_Dashboard_vue___default.a,
    children: [{
        path: '/',
        name: 'tasks',
        component: __WEBPACK_IMPORTED_MODULE_4__components_pages_tasks_Tasks_vue___default.a
    }, {
        path: '/news',
        name: 'news',
        component: __WEBPACK_IMPORTED_MODULE_0__components_pages_News_vue___default.a
    }, {
        path: '/messages',
        name: 'messages',
        component: __WEBPACK_IMPORTED_MODULE_7__components_pages_Messages_vue___default.a
    }, {
        path: '/events',
        name: 'events',
        component: __WEBPACK_IMPORTED_MODULE_3__components_pages_Events_vue___default.a
    }, {
        path: '/teams',
        name: 'teams',
        component: __WEBPACK_IMPORTED_MODULE_1__components_pages_Teams_vue___default.a
    }, {
        path: '/projects',
        name: 'projects',
        component: __WEBPACK_IMPORTED_MODULE_6__components_pages_Projects_vue___default.a
    }]
}, {
    path: '/login',
    name: 'login',
    meta: { auth: false },
    component: __WEBPACK_IMPORTED_MODULE_2__components_pages_Login_vue___default.a
}, {
    path: '*',
    name: '404',
    component: __WEBPACK_IMPORTED_MODULE_8__components_pages_errors_Error404_vue___default.a
}];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vuex__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modules_tasks_js__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__actions_js__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__getters_js__ = __webpack_require__(46);


// modules




__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vuex___default.a);

var debug = "development" !== 'production';

/* harmony default export */ exports["a"] = new __WEBPACK_IMPORTED_MODULE_1_vuex___default.a.Store({
    actions: __WEBPACK_IMPORTED_MODULE_3__actions_js__,
    getters: __WEBPACK_IMPORTED_MODULE_4__getters_js__,
    modules: {
        tasks: __WEBPACK_IMPORTED_MODULE_2__modules_tasks_js__["a" /* default */]
    },
    strict: debug
});

/***/ },
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(24)

/* template */
var __vue_template__ = __webpack_require__(76)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/App.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-00a600b0", __vue_options__)
  } else {
    hotAPI.reload("data-v-00a600b0", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] App.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

var __utils  = __webpack_require__(23),
    __token  = __webpack_require__(22),
    __cookie = __webpack_require__(21)

module.exports = function () {

    // Private (used double underscore __).

    function __duckPunch(methodName, data) {
        var _this = this,
            success = data.success;

        data = __utils.extend(this.options[methodName + 'Data'], [data]);

        data.success = function (res) {
            data.success = success;

            _this.options[methodName + 'Process'].call(_this, res, data);
        };

        this.options._http.call(this, data);
    }

    function __bindContext(methodName, data) {
        var _auth = this.$auth;

        _auth.options[methodName + 'Perform'].call(_auth, _auth.options._bindData.call(_auth, data, this));
    }

    // Overrideable

    function _routerBeforeEach(cb) {

        if (this.options.tokenExpired.call(this)) {
            this.options.refreshPerform.call(this, {});
        }

        if (this.watch.authenticated === null && __token.get.call(this)) {
            if ( ! __cookie.exists.call(this)) {
                this.options.logoutProcess.call(this, null, {});

                this.watch.loaded = true

                return cb.call(this);
            }

            this.watch.authenticated = false
            this.options.fetchPerform.call(this, {success: cb, error: cb});
        } else {
            this.watch.loaded = true;
            return cb.call(this);
        }
    }

    function _transitionEach(routeAuth, cb) {
        routeAuth = __utils.toArray(routeAuth);

        if (routeAuth && (routeAuth === true || routeAuth.constructor === Array)) {
            if ( ! this.check()) {
                cb.call(this, this.options.authRedirect);
            }
            else if (routeAuth.constructor === Array && ! __utils.compare(routeAuth, this.watch.data[this.options.rolesVar])) {
                cb.call(this, this.options.forbiddenRedirect);
            }
            else {
                return cb();
            }
        }
        else if (routeAuth === false && this.check()) {
            cb.call(this, this.options.notFoundRedirect);
        }
        else {
            return cb();
        }
    }

    function _requestIntercept(req) {
        var token = __token.get.call(this);

        if (token) {
            this.options[this.options.authType + 'Auth'].request.call(this, req, token);
        }

        return req;
    }

    function _responseIntercept(res) {
        var token;

        if (this.options._invalidToken) {
            this.options._invalidToken.call(this, res);
        }

        token = this.options[this.options.authType + 'Auth'].response.call(this, res);

        if (token) {
            __token.set.call(this, null, token);
        }
    }

    function _parseUserData(data) {
        return data.data;
    }

    function _check(role) {
        if (this.watch.data !== null) {
            if (role) {
                return __utils.compare(role, this.watch.data[this.options.rolesVar]);
            }

            return true;
        }

        return false;
    }

    function _tokenExpired () {
        return ! this.watch.loaded && __token.get.call(this);
    }

    function _cookieDomain () {
        return window.location.hostname;
    }

    function _getUrl () {
        var port = window.location.port

        return window.location.protocol + '//' + window.location.hostname + (port ? ':' + port : '')
    }

    function _fetchPerform(data) {
        var _this = this,
            error = data.error;

        data.error = function (res) {
            _this.watch.loaded = true;

            if (error) { error.call(_this, res); }
        };

        __duckPunch.call(this, 'fetch', data);
    }

    function _fetchProcess(res, data) {
        this.watch.authenticated = true;
        this.watch.data = this.options.parseUserData.call(this, this.options._httpData.call(this, res));
        this.watch.loaded = true;

        if (data.success) { data.success.call(this, res); }
    }

    function _refreshPerform(data) {
        __duckPunch.call(this, 'refresh', data);
    }

    function _refreshProcess(res, data) {
        if (data.success) { data.success.call(this, res); }
    }

    function _registerPerform(data) {
        __duckPunch.call(this, 'register', data);
    }

    function _registerProcess(res, data) {
        if (data.autoLogin === true) {
            data = __utils.extend(data, [this.options.loginData]);

            this.options.loginPerform.call(this, data);
        }
        else {
            if (data.success) { data.success.call(this, res); }

            if (data.redirect) {
                this.options._routerGo.call(this, data.redirect);
            }
        }
    }

    function _loginPerform(data) {
        __duckPunch.call(this, 'login', data);
    }

    function _loginProcess(res, data) {
        var _this = this;

        __cookie.set.call(this, data.rememberMe);

        this.authenticated = null;

        this.options.fetchPerform.call(this, {
            success: function () {
                if (data.success) { data.success.call(this, res); }

                if (data.redirect && _this.options.check.call(_this)) {
                    _this.options._routerGo.call(_this, data.redirect);
                }
            }
        });
    }

    function _logoutPerform(data) {
        data = __utils.extend(this.options.logoutData, [data || {}]);

        if (data.makeRequest) {
            __duckPunch.call(this, 'logout', data);
        }
        else {
            this.options.logoutProcess.call(this, null, data);
        }
    }

    function _logoutProcess(res, data) {
        __cookie.delete.call(this);

        __token.delete.call(this, 'other');
        __token.delete.call(this, 'default');

        this.authenticated = false;
        this.watch.data = null;

        if (data.success) { data.success.call(this, res, data); }

        if (data.redirect) {
            this.options._routerGo.call(this, data.redirect);
        }
    }

    function _loginOtherPerform(data) {
        var success,
            token = this.token.call(this); // (admin) token

        data = data || {};

        success = data.success;

        data.success = function () {

            // Reshuffle tokens here...
            __token.set.call(this, 'other', this.token.call(this));
            __token.set.call(this, 'default', token);

            if (success) { success.call(this); }
        };

        __duckPunch.call(this, 'loginOther', data);
    }

    function _loginOtherProcess(res, data) {
        var _this = this;

        this.options.fetchPerform.call(this, {
            success: function () {
                if (data.success) { data.success.call(this, res); }

                if (data.redirect && _this.options.check.call(_this)) {
                    _this.options._routerGo.call(_this, data.redirect);
                }
            }
        });
    }

    function _logoutOtherPerform(data) {
        data = __utils.extend(this.options.logoutOtherData, [data || {}]);

        if (data.makeRequest) {
            __duckPunch.call(this, 'logoutOther', data);
        }
        else {
            this.options.logoutOtherProcess.call(this, null, data);
        }
    }

    function _logoutOtherProcess(res, data) {
        __token.delete.call(this, 'other');

        this.options.fetchPerform.call(this, {
            success: function () {
                if (data.success) { data.success.call(this, res, data); }

                if (data.redirect) {
                    this.options._routerGo.call(this, data.redirect);
                }
            }
        });
    }

    function _oauth2Perform(data) {
        var state = {},
            params = '',
            query = {};

        if (data.code === true) {
            data = __utils.extend(this.options[data.provider + 'Data'], [data]);

            try {
                if (data.query.state) {
                    state = JSON.parse(decodeURIComponent(data.query.state));
                }
            }
            catch (e) {
                console.error('vue-auth:error There was an issue retrieving the state data.');
                state = {};
            }

            data.rememberMe = state.rememberMe === true;
            data.state = state;

            this.options.loginPerform.call(this, data);
        } else {
            data = __utils.extend(this.options[data.provider + 'Oauth2Data'], [data]);

            data.redirect = data.redirect.call(this);

            data.state = data.state || {};
            data.state.rememberMe = data.rememberMe === true;

            params = '?client_id=' + data.clientId + '&redirect_uri=' + data.redirect + '&scope=' + data.scope + '&response_type=code&state=' + encodeURIComponent(JSON.stringify(data.state));

            window.location = data.url + params;
        }
    }

    var defaultOptions = {

        // Variables

        authType:          'bearer',
        rolesVar:          'roles',
        tokenName:         'auth-token',
        
        // Objects

        authRedirect:       {path: '/login'},
        forbiddenRedirect:  {path: '/403'},
        notFoundRedirect:   {path: '/404'},

        registerData:       {url: 'auth/register',     method: 'POST', redirect: '/login'},
        loginData:          {url: 'auth/login',        method: 'POST', redirect: '/'},
        logoutData:         {url: 'auth/logout',       method: 'POST', redirect: '/', makeRequest: false},
        oauth1Data:         {url: 'auth/login',        method: 'POST'},
        fetchData:          {url: 'auth/user',         method: 'GET'},
        refreshData:        {url: 'auth/refresh',      method: 'GET'},
        loginOtherData:     {url: 'auth/login-other',  method: 'POST', redirect: '/'},
        logoutOtherData:    {url: 'auth/logout-other', method: 'POST', redirect: '/admin', makeRequest: false},

        facebookData:       {url: 'auth/facebook',     method: 'POST', redirect: '/'},
        googleData:         {url: 'auth/google',       method: 'POST', redirect: '/'},

        facebookOauth2Data: {
            url: 'https://www.facebook.com/v2.5/dialog/oauth',
            redirect: function () { return this.options.getUrl() + '/login/facebook'; },
            clientId: '',
            scope: 'email'
        },
        googleOauth2Data: {
            url: 'https://accounts.google.com/o/oauth2/auth',
            redirect: function () { return this.options.getUrl() + '/login/google'; },
            clientId: '',
            scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
        },

        // Internal

        getUrl:             _getUrl,
        cookieDomain:       _cookieDomain,
        parseUserData:      _parseUserData,
        tokenExpired:       _tokenExpired,
        check:              _check,

        transitionEach:     _transitionEach,
        routerBeforeEach:   _routerBeforeEach,
        requestIntercept:   _requestIntercept,
        responseIntercept:  _responseIntercept,

        // Contextual

        registerPerform:    _registerPerform,
        registerProcess:    _registerProcess,

        loginPerform:       _loginPerform,
        loginProcess:       _loginProcess,

        logoutPerform:      _logoutPerform,
        logoutProcess:      _logoutProcess,

        fetchPerform:       _fetchPerform,
        fetchProcess:       _fetchProcess,

        refreshPerform:     _refreshPerform,
        refreshProcess:     _refreshProcess,

        loginOtherPerform:  _loginOtherPerform,
        loginOtherProcess:  _loginOtherProcess,

        logoutOtherPerform: _logoutOtherPerform,
        logoutOtherProcess: _logoutOtherProcess,

        oauth2Perform:      _oauth2Perform,

        // Auth drivers

        bearerAuth: {
            request: function (req, token) {
                this.options._setHeaders.call(this, req, {Authorization: 'Bearer ' + token});
            },
            
            response: function (res) {
                var token = this.options._getHeaders.call(this, res).Authorization;

                if (token) {
                    token = token.split('Bearer ');
                    
                    return token[token.length > 1 ? 1 : 0];
                }
            }
        },

        basicAuth: {
            request: function (req, token) {
                this.options._setHeaders.call(this, req, {Authorization: token});
            },
            
            response: function (res) {
                var token = this.options._getHeaders.call(this, res).Authorization;
                
                return token;
            }
        },

        deviseAuth: {
            tokens: ['Token-Type', 'Access-Token', 'Client', 'Uid', 'Expiry'],

            request: function (req, token) {
                var headers = {},
                    tokens = token.split(';');

                this.options.deviseAuth.tokens.forEach(function (tokenName, index) {
                    if (tokens[index]) {
                        headers[tokenName] = tokens[index];
                    }
                });
                
                this.options._setHeaders.call(this, req, headers);
            },
            
            response: function (res) {
                var token = [],
                    headers = this.options._getHeaders.call(this, res);
                
                if (headers['Access-Token']) {
                    this.options.deviseAuth.tokens.forEach(function (tokenName) {
                        if (headers[tokenName]) {
                            token.push(headers[tokenName]);
                        }
                    });
                    
                    return token.join(';');
                }
            }
        }
    };

    function Auth(options, driver) {
        var router = options.router,
            http = options.http;

        delete options.http;
        delete options.router;

        this.currentToken = null;

        this.options = __utils.extend(defaultOptions, [driver || {}, options || {}]);
        this.options.router = router;
        this.options.http = http;

        this.watch = this.options._watch.call(this, {
            data: null,
            loaded: false,
            authenticated: null
        });

        driver._init.call(this);
    }

    Auth.prototype.ready = function () {
        return this.watch.loaded;
    };

    Auth.prototype.user = function (data) {
        if (data) {
            this.watch.data = data;
        }

        return this.watch.data || {};
    };

    Auth.prototype.check = function (role) {
        return this.options.check.call(this, role);
    };

    Auth.prototype.other = function () {
        this.watch.data; // To fire watch

        return __token.get.call(this, 'other') ? true : false;
    };

    Auth.prototype.enableOther = function (data) {
        if (this.other()) {
            this.currentToken = null;
        }
    };

    Auth.prototype.disableOther = function (data) {
        if (this.other()) {
            this.currentToken = 'default';
        }
    };

    Auth.prototype.token = function (name) {
        return __token.get.call(this, name);
    };

    Auth.prototype.fetch = function (data) {
        __bindContext.call(this, 'fetch', data);
    };

    Auth.prototype.refresh = function (data) {
        __bindContext.call(this, 'refresh', data);
    };

    Auth.prototype.register = function (data) {
        __bindContext.call(this, 'register', data);
    };

    Auth.prototype.login = function (data) {
        __bindContext.call(this, 'login', data);
    };

    Auth.prototype.logout = function (data) {
        __bindContext.call(this, 'logout', data);
    };

    Auth.prototype.loginOther = function (data) {
        __bindContext.call(this, 'loginOther', data);
    };

    Auth.prototype.logoutOther = function (data) {
        __bindContext.call(this, 'logoutOther', data);
    };

    Auth.prototype.oauth2 = function (data) {
        __bindContext.call(this, 'oauth2', data);
    }

    return Auth;
};


/***/ },
/* 20 */
/***/ function(module, exports) {

module.exports = {

    // NOTE: Use underscore to denote a driver function (all are overrideable also).

    _init: function () {
        this.options._bind.call(this);

        this.options._beforeEach.call(this, this.options.routerBeforeEach, this.options.transitionEach);
        this.options._interceptor.call(this, this.options.requestIntercept, this.options.responseIntercept);
    },

    _bind: function () {
        this.options.http = this.options.http || this.options.Vue.http;
        this.options.router = this.options.router || this.options.Vue.router;
    },

    _watch: function (data) {
        return new this.options.Vue({
            data: function () {
                return data;
            }
        });
    },

    _getHeaders: function (res) {
        var i,
            data = {},
            headers = res.headers.map;

        for (i in headers) {
            data[i] = headers[i][0];
        }

        return data;
    },

    _setHeaders: function (req, headers) {
        var i;

        for (i in headers) {
            req.headers.set(i, headers[i]);
        }
    },

    _bindData: function (data, ctx) {
        var error, success;

        data = data || {};

        error = data.error;
        success = data.success;

        data.query = ctx.$route.query || {};

        if (data.success) { data.success = function (res) { success.call(ctx, res); } }
        if (data.error) { data.error = function (res) { error.call(ctx, res); } }

        return data;
    },

    _interceptor: function (req, res) {
        var _this = this;

        this.options.http.interceptors.push(function (request, next) {
            if (req) { req.call(_this, request); }
            
            next(function (response) {
                if (res) { res.call(_this, response); }
            });
        });
    },

    _beforeEach: function (routerBeforeEach, transitionEach) {
        var _this = this;

        this.options.router.beforeEach(function (transition, location, next) {
            routerBeforeEach.call(_this, function () {
                var auth;

                if (transition.to) {
                    auth = transition.to.auth;
                } else {
                    var authRoutes = transition.matched.filter(function (route) {
                        return route.meta.hasOwnProperty('auth');
                    });

                    // matches the nested route, the last one in the list
                    if (authRoutes.length) {
                        auth = authRoutes[authRoutes.length - 1].meta.auth;
                    }
                }

                transitionEach.call(_this, auth, function (redirect) {
                    if (!redirect) {
                        (next || transition.next)();
                        return;
                    }

                    // router v2.x
                    if (next) {
                        next(redirect);
                    } else {
                        this.options._routerReplace.call(this, redirect);
                    }
                });
            });
        })
    },

    _invalidToken: function (res) {
        if (res.status === 401) {
            this.logout();
        }
    },

    _routerReplace: function (data) {
        var router = this.options.router;

        router.replace.call(router, data);
    },

    _routerGo: function (data) {
        var router = this.options.router;

        (router.push || router.go).call(router, data);
    },

    _httpData: function (res) {
        return res.data || {};
    },

    _http: function (data) {
        this.options.http(data).then(data.success, data.error);
    }

};

/***/ },
/* 21 */
/***/ function(module, exports) {

module.exports = (function () {

    function setCookie (name, value, timeOffset) {
        var domain = this.options.cookieDomain(),
            expires = (new Date((new Date()).getTime() + timeOffset)).toUTCString();

        document.cookie = (name + '=' + value + '; domain=' + domain + '; path=/;' + (timeOffset ? ' expires=' + expires + ';' : ''));
    }

    return {
        set: function(rememberMe) {
            setCookie.call(this,
                'rememberMe',
                rememberMe === true ? 'true' : 'false',
                rememberMe === true ? 12096e5 : undefined
            );
        },

        exists: function(name) {
            return document.cookie.match(/rememberMe/);
        },

        delete: function(name) {
            setCookie.call(this, 'rememberMe', 'false', -12096e5);
        }
    };

})();

/***/ },
/* 22 */
/***/ function(module, exports) {

module.exports = (function () {

    function tokenName(name) {
        name = name || this.currentToken;

        if ( ! name && this.other.call(this)) { name = 'other'; }
        else if ( ! name || name === 'default') { name = 'default'; }

        return name + '-' + this.options.tokenName;
    }

    return {
        get: function (name) {
            name = tokenName.call(this, name);

            return localStorage.getItem(name);
        },

        set: function (name, token) {
            name = tokenName.call(this, name);

            if (token) {
                localStorage.setItem(name, token);
            }
        },

        delete: function (name) {
            name = tokenName.call(this, name);

            localStorage.removeItem(name);
        },

        expiring: function () {
            return false;
        }
    }

})();

/***/ },
/* 23 */
/***/ function(module, exports) {

module.exports = (function (){

    function isObject(val) {
        if (val !== null && typeof val === 'object' && val.constructor !== Array ) {
            return true;
        }

        return false;
    }

    function toArray(val) {
        return (typeof val) === 'string' ? [val] : val;
    }

    function extend(mainObj, appendObj) {
        var i, ii, key, data = {};

        for (key in mainObj) {
            if (isObject(mainObj[key])) {
                data[key] = extend(mainObj[key], {});
            }
            else {
                data[key] = mainObj[key];
            }
        }

        for (i = 0, ii = appendObj.length; i < ii; i++) {
            for (key in appendObj[i]) {
                if (isObject(appendObj[i][key])) {
                    data[key] = extend(mainObj[key] || {}, [appendObj[i][key]]);
                }
                else  {
                    data[key] = appendObj[i][key];
                }
            }
        }

        return data;
    }

    function compare(one, two) {
        var i, ii, key;

        if (typeof one === 'object' && typeof two === 'object') {
            for (key in one) {
                if (compare(one[key], two[key])) {
                    return true;
                }
            }

            return false;
        }

        one = toArray(one);
        two = toArray(two);

        if (one.constructor !== Array || two.constructor !== Array) {
            return false;
        }

        for (i = 0, ii = one.length; i < ii; i++) {
            if (two.indexOf(one[i]) >= 0) {
                return true;
            }
        }

        return false;
    }

    return {
        extend: extend,
        toArray: toArray,
        compare: compare
    };
})();

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'SocialTask'
};

/***/ },
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Loader',
    props: {
        color: {
            type: String,
            required: false,
            default: 'white'
        },
        height: {
            type: Number,
            required: false,
            default: 10
        },
        width: {
            type: Number,
            required: false,
            default: 10
        }
    },
    computed: {
        style: function style() {
            return {
                height: this.height + 'px',
                width: this.width + 'px'
            };
        }
    }
};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Notification',
    props: {
        type: {
            type: String,
            required: false,
            default: ''
        },
        message: {
            type: String,
            required: true
        },
        depth: {
            type: Number,
            required: false,
            default: 0
        }
    }
};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Events',
    data: function data() {
        return {};
    }
};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: "Login",
    data: function data() {
        return {
            loading: false,
            credentials: {
                email: 'ptrantow@example.com',
                password: 'password'
            }
        };
    },


    methods: {
        authenticate: function authenticate() {
            if (this.loading) return;

            this.loading = true;

            this.$auth.login({
                body: this.credentials,
                success: function success(response) {
                    this.loading = false;
                    console.log(response);
                },
                error: function error(response) {
                    this.loading = false;
                    console.log(response);
                },

                rememberMe: true
            });
        }
    }
};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Messages',
    data: function data() {
        return {};
    }
};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'News',
    data: function data() {
        return {};
    }
};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Projects',
    data: function data() {
        return {};
    }
};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Teams',
    data: function data() {
        return {};
    }
};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Error404'
};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'CompanyCreator',
    data: function data() {
        return {
            company: { name: '', description: '' },
            errors: {},
            loading: false
        };
    },

    methods: {
        submit: function submit() {
            this.loading = true;
            this.$http.post('companies', this.company).then(handleSuccess, handleFail).catch(handleError);

            function handleSuccess(_ref) {
                var data = _ref.body.data;

                this.loading = false;
                var user = this.$auth.user();
                user.companies.push(data);
            }

            function handleFail(res) {
                this.loading = false;
                console.log(res);
            }

            function handleError(error) {
                console.warn(error);
            }
        },
        skip: function skip() {
            var settings = localStorage.getItem('settings');
            settings = JSON.parse(settings);
            console.log(settings);
            settings.company.skip = true;

            //localStorage.setItem('settings', settings);
        }
    }
};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* unused harmony export BASE_URL */
/* harmony export (binding) */ __webpack_require__.d(exports, "a", function() { return API_URL; });
var BASE_URL = 'http://127.0.0.1';
var API_URL = BASE_URL + '/api/v1';

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_resource__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_resource___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_resource__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__config_js__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__ = __webpack_require__(7);
/* harmony export (immutable) */ exports["fetchTasks"] = fetchTasks;
/* harmony export (immutable) */ exports["createTask"] = createTask;
/* harmony export (immutable) */ exports["editTask"] = editTask;
/* harmony export (immutable) */ exports["deleteTask"] = deleteTask;
/* harmony export (immutable) */ exports["skipCompanyCreation"] = skipCompanyCreation;





__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_resource___default.a);

var TaskResource = __WEBPACK_IMPORTED_MODULE_0_vue___default.a.resource(__WEBPACK_IMPORTED_MODULE_2__config_js__["a" /* API_URL */] + '/tasks{/id}');

/* helper methods */
var loading = {
    tasks: {
        create: function create(dispatch, value) {
            dispatch({
                type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["e" /* LOADING_TASK */],
                payload: { create: value }
            });
        },
        read: function read(dispatch, value) {
            dispatch({
                type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["e" /* LOADING_TASK */],
                payload: { read: value }
            });
        },
        update: function update(dispatch, value) {
            dispatch({
                type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["e" /* LOADING_TASK */],
                payload: { update: value }
            });
        },
        delete: function _delete(dispatch, value) {
            dispatch({
                type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["e" /* LOADING_TASK */],
                payload: { delete: value }
            });
        }
    }
};

/* Tasks CRUD methods */
function fetchTasks(_ref) {
    var dispatch = _ref.dispatch;

    loading.task.read(dispatch, true);

    TaskResource.get().then(handleSuccess, handleFail).catch(handleError);

    function handleSuccess(_ref2) {
        var data = _ref2.data.data;

        dispatch({
            type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["a" /* SET_TASKS */],
            payload: data
        });

        loading.task.read(dispatch, false);
    }

    function handleFail(error) {
        loading.task.read(dispatch, false);
    }

    function handleError(error) {
        console.warn(error);
        loading.task.read(dispatch, false);
    }
}

function createTask(_ref3, task, callback) {
    var dispatch = _ref3.dispatch;


    loading.task.create(dispatch, true);

    TaskResource.save(null, task).then(handleSuccess, handleFail).catch(handleError);

    function handleSuccess(_ref4) {
        var task = _ref4.data.data.task;

        dispatch({
            type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["b" /* ADD_TASK */],
            payload: task
        });

        if (callback && typeof callback === 'function') callback();

        loading.task.create(dispatch, false);
    }

    function handleFail(error) {
        loading.task.create(dispatch, false);
    }

    function handleError(error) {
        console.warn(error);
        loading.task.create(dispatch, false);
    }
}

function editTask(_ref5, task, callback) {
    var dispatch = _ref5.dispatch;

    loading.task.update(dispatch, true);

    TaskResource.update({ id: task.id }, task).then(handleSuccess, handleFail).catch(handleError);

    function handleSuccess(_ref6) {
        var data = _ref6.data;

        dispatch({
            type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["c" /* UPDATE_TASK */],
            payload: task
        });

        if (callback && typeof callback === 'function') callback();

        loading.task.update(dispatch, false);
    }

    function handleFail(error) {
        loading.task.update(dispatch, false);
    }

    function handleError(error) {
        console.warn(error);
        loading.task.update(dispatch, false);
    }
}

function deleteTask(_ref7, task, callback) {
    var dispatch = _ref7.dispatch;


    loading.task.delete(dispatch, true);

    TaskResource.delete({ id: task.id }).then(handleSuccess, handleFail).catch(handleError);

    function handleSuccess(_ref8) {
        var data = _ref8.data;

        dispatch({
            type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["d" /* DELETE_TASK */],
            payload: task
        });

        if (callback && typeof callback === 'function') callback();

        loading.task.delete(dispatch, false);
    }

    function handleFail(error) {
        loading.task.delete(dispatch, false);
    }

    function handleError(error) {
        console.warn(error);
        loading.task.delete(dispatch, false);
    }
}

/*User Settings actions*/
function skipCompanyCreation(_ref9) {
    var dispatch = _ref9.dispatch;
    var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    dispatch({
        type: __WEBPACK_IMPORTED_MODULE_3__mutation_types_js__["f" /* SKIP_CREATE_COMPANY */],
        payload: skip
    });
}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(exports, "allTasks", function() { return allTasks; });
/* harmony export (binding) */ __webpack_require__.d(exports, "completedTasks", function() { return completedTasks; });
/* harmony export (binding) */ __webpack_require__.d(exports, "incompleteTasks", function() { return incompleteTasks; });
/*Tasks Getters*/
var allTasks = function allTasks(_ref) {
  var tasks = _ref.tasks;
  return tasks.all;
};
var completedTasks = function completedTasks(_ref2) {
  var tasks = _ref2.tasks;
  return tasks.all.filter(function (task) {
    return task.complete;
  });
};
var incompleteTasks = function incompleteTasks(_ref3) {
  var tasks = _ref3.tasks;
  return tasks.all.filter(function (task) {
    return !task.complete;
  });
};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__ = __webpack_require__(7);
var _mutations;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var state = {
    all: [],
    loading: {
        create: false,
        read: true,
        update: false,
        delete: false
    }
};

var mutations = (_mutations = {}, _defineProperty(_mutations, __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__["a" /* SET_TASKS */], function (state, _ref) {
    var payload = _ref.payload;

    state.all = payload;
}), _defineProperty(_mutations, __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__["b" /* ADD_TASK */], function (state, _ref2) {
    var payload = _ref2.payload;

    state.all.push(payload);
}), _defineProperty(_mutations, __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__["c" /* UPDATE_TASK */], function (state, _ref3) {
    var payload = _ref3.payload;

    for (var i = state.all.length - 1; i >= 0; i--) {
        if (state.all[i].id === payload.id) {
            state.all.$set(i, payload);
            break;
        }
    }
}), _defineProperty(_mutations, __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__["d" /* DELETE_TASK */], function (state, _ref4) {
    var payload = _ref4.payload;

    state.all.$remove(payload);
}), _defineProperty(_mutations, __WEBPACK_IMPORTED_MODULE_0__mutation_types_js__["e" /* LOADING_TASK */], function (state, _ref5) {
    var payload = _ref5.payload;

    if (payload.hasOwnProperty('create')) state.loading.create = !!payload.create;
    if (payload.hasOwnProperty('read')) state.loading.read = !!payload.read;
    if (payload.hasOwnProperty('update')) state.loading.update = !!payload.update;
    if (payload.hasOwnProperty('delete')) state.loading.delete = !!payload.delete;
}), _mutations);

/* harmony default export */ exports["a"] = {
    state: state,
    mutations: mutations
};

/***/ },
/* 48 */,
/* 49 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\nhtml, body {\n    height: 100%;\n}\nbody {\n    background: url(/images/background.jpg);\n}\n.main-login {\n    height: 100%;\n    width: 100%;\n    display: table;\n}\n.brand{\n    position: relative;\n    background: teal;\n    padding: 5px 30px;\n    top: -50px;\n}\n.login-wrapper {\n    display: table-cell;\n    vertical-align: middle;\n}\n.login-container {\n    width: 450px;\n    margin: 0 auto;\n}\n.register-link {\n    padding: 5px;\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/pages/Login.vue?83e8365a"],"names":[],"mappings":";AACA;IACA,aAAA;CACA;AAEA;IACA,wCAAA;CACA;AAEA;IACA,aAAA;IACA,YAAA;IACA,eAAA;CACA;AAEA;IACA,mBAAA;IACA,iBAAA;IACA,kBAAA;IACA,WAAA;CACA;AAEA;IACA,oBAAA;IACA,uBAAA;CACA;AAEA;IACA,aAAA;IACA,eAAA;CACA;AACA;IACA,aAAA;CACA","file":"Login.vue","sourcesContent":["<style>\n    html, body {\n        height: 100%;\n    }\n\n    body {\n        background: url(/images/background.jpg);\n    }\n\n    .main-login {\n        height: 100%;\n        width: 100%;\n        display: table;\n    }\n\n    .brand{\n        position: relative;\n        background: teal;\n        padding: 5px 30px;\n        top: -50px;\n    }\n\n    .login-wrapper {\n        display: table-cell;\n        vertical-align: middle;\n    }\n\n    .login-container {\n        width: 450px;\n        margin: 0 auto;\n    }\n    .register-link {\n        padding: 5px;\n    }\n</style>\n<template>\n    <div class=\"main-login\">\n        <div class=\"login-wrapper\">\n            <div class=\"login-container\">\n                <div class=\"card z-depth-3 grey lighten-4\">\n                    <div class=\"card-content\">\n                        <div class=\"center\">\n                            <span class=\"card-title brand white-text\">Social-Tasking</span>\n                        </div>\n                        <form method=\"post\" action=\"/api/v1/login\" @submit.prevent=\"authenticate\">\n                            <div class='row'>\n                                <div class='input-field col s12'>\n                                    <input class='validate' type='email' name='email' v-model=\"credentials.email\"/>\n                                    <label for='email' class=\"_center\">Enter your email</label>\n                                </div>\n                            </div>\n\n                            <div class='row'>\n                                <div class='input-field col s12'>\n                                    <input class='validate' type='password' name='password' v-model=\"credentials.password\"/>\n                                    <label for='password' class=\"_center\">Enter your password</label>\n                                </div>\n                                <label class=\"right\">\n                                    <router-link to=\"/forgot-password\" class=\"pink-text\">\n                                        <strong>Forgot Password?</strong>\n                                    </router-link>\n                                </label>\n                            </div>\n                            <div class='row'>\n                                <button type='submit'\n                                    class='col s12 btn btn-large waves-effect teal'\n                                    :disabled=\"loading\"\n                                >\n                                    <loader v-if=\"loading\" style=\"width:auto\" color=\"grey\"></loader>\n                                    <span v-else>Login</span>\n                                </button>\n                            </div>\n                        </form>\n                    </div>\n                </div>\n\n                <div class=\"center\">\n                    <router-link to=\"/register\" class=\"white-text teal lighten-1 register-link\">Create account</router-link>\n                </div>\n            </div>\n        </div>\n    </div>\n</template>\n\n<script>\nexport default {\n    name: \"Login\",\n    data () {\n        return {\n            loading: false,\n            credentials: {\n                email: 'ptrantow@example.com',\n                password: 'password',\n            }\n        }\n    },\n\n    methods: {\n        authenticate () {\n            if(this.loading) return;\n\n            this.loading = true;\n\n            this.$auth.login({\n                body: this.credentials,\n                success (response) {\n                    this.loading = false;\n                    console.log(response);\n                },\n                error (response) {\n                    this.loading = false;\n                    console.log(response);\n                },\n                rememberMe: true\n            });        \n        }\n    },\n }\n</script>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.loader {\n  width: 70px;\n  text-align: center;\n}\n.loader > div {\n  width: 10px;\n  height: 10px;\n  background-color: #333;\n\n  border-radius: 100%;\n  display: inline-block;\n  animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n}\n.loader .bounce1 {\n  animation-delay: -0.32s;\n}\n.loader .bounce2 {\n  animation-delay: -0.16s;\n}\n@keyframes sk-bouncedelay {\n0%, 80%, 100% {\n    transform: scale(0);\n}\n40% {\n    transform: scale(1.0);\n}\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/global/Loader.vue?52a6ed3a"],"names":[],"mappings":";AAsCA;EACA,YAAA;EACA,mBAAA;CACA;AAEA;EACA,YAAA;EACA,aAAA;EACA,uBAAA;;EAEA,oBAAA;EACA,sBAAA;EAEA,yDAAA;CACA;AAEA;EAEA,wBAAA;CACA;AAEA;EAEA,wBAAA;CACA;AAOA;AACA;IAEA,oBAAA;CACA;AAAA;IAEA,sBAAA;CACA;CACA","file":"Loader.vue","sourcesContent":["<template>\n    <div class=\"loader\">\n        <div :class=\"['bounce1', color]\" :style=\"style\"></div>\n        <div :class=\"['bounce2', color]\" :style=\"style\"></div>\n        <div :class=\"['bounce3', color]\" :style=\"style\"></div>\n    </div>\n</template>\n<script>\n    export default {\n        name: 'Loader',\n        props: {\n            color: {\n                type: String,\n                required: false,\n                default: 'white'\n            },\n            height: {\n                type: Number,\n                required: false,\n                default: 10\n            },\n            width: {\n                type: Number,\n                required: false,\n                default: 10\n            }\n        },\n        computed: {\n            style () {\n                return {\n                    height: this.height + 'px',\n                    width: this.width + 'px',\n                }\n            }\n        }\n    }\n</script>\n<style>\n.loader {\n  width: 70px;\n  text-align: center;\n}\n\n.loader > div {\n  width: 10px;\n  height: 10px;\n  background-color: #333;\n\n  border-radius: 100%;\n  display: inline-block;\n  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n  animation: sk-bouncedelay 1.4s infinite ease-in-out both;\n}\n\n.loader .bounce1 {\n  -webkit-animation-delay: -0.32s;\n  animation-delay: -0.32s;\n}\n\n.loader .bounce2 {\n  -webkit-animation-delay: -0.16s;\n  animation-delay: -0.16s;\n}\n\n@-webkit-keyframes sk-bouncedelay {\n  0%, 80%, 100% { -webkit-transform: scale(0) }\n  40% { -webkit-transform: scale(1.0) }\n}\n\n@keyframes sk-bouncedelay {\n  0%, 80%, 100% { \n    -webkit-transform: scale(0);\n    transform: scale(0);\n  } 40% { \n    -webkit-transform: scale(1.0);\n    transform: scale(1.0);\n  }\n}\n</style>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(98)

/* script */
__vue_exports__ = __webpack_require__(34)

/* template */
var __vue_template__ = __webpack_require__(93)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/global/Loader.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ea9149e4", __vue_options__)
  } else {
    hotAPI.reload("data-v-ea9149e4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Loader.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(35)

/* template */
var __vue_template__ = __webpack_require__(88)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/global/Notification.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-96675cb4", __vue_options__)
  } else {
    hotAPI.reload("data-v-96675cb4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Notification.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(36)

/* template */
var __vue_template__ = __webpack_require__(80)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Events.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-43bf5fc5", __vue_options__)
  } else {
    hotAPI.reload("data-v-43bf5fc5", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Events.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(97)

/* script */
__vue_exports__ = __webpack_require__(37)

/* template */
var __vue_template__ = __webpack_require__(87)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Login.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-78af626d", __vue_options__)
  } else {
    hotAPI.reload("data-v-78af626d", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Login.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(38)

/* template */
var __vue_template__ = __webpack_require__(77)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Messages.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1a2d5978", __vue_options__)
  } else {
    hotAPI.reload("data-v-1a2d5978", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Messages.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(39)

/* template */
var __vue_template__ = __webpack_require__(89)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/News.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a64a9d02", __vue_options__)
  } else {
    hotAPI.reload("data-v-a64a9d02", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] News.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(40)

/* template */
var __vue_template__ = __webpack_require__(90)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Projects.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c253acb4", __vue_options__)
  } else {
    hotAPI.reload("data-v-c253acb4", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Projects.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(41)

/* template */
var __vue_template__ = __webpack_require__(83)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Teams.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5488e38c", __vue_options__)
  } else {
    hotAPI.reload("data-v-5488e38c", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Teams.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(42)

/* template */
var __vue_template__ = __webpack_require__(86)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/errors/Error404.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6840cf18", __vue_options__)
  } else {
    hotAPI.reload("data-v-6840cf18", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Error404.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(43)

/* template */
var __vue_template__ = __webpack_require__(81)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/sub-components/CompanyCreator.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-457d2eca", __vue_options__)
  } else {
    hotAPI.reload("data-v-457d2eca", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] CompanyCreator.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('router-view')
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-00a600b0", module.exports)
  }
}

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h1', ["Messages"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1a2d5978", module.exports)
  }
}

/***/ },
/* 78 */,
/* 79 */,
/* 80 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h1', ["Events"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-43bf5fc5", module.exports)
  }
}

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "row"
  }, [_vm._h('div', {
    staticClass: "col s12 m7"
  }, [_vm._h('form', {
    attrs: {
      "autocomplete": "off"
    },
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.submit($event)
      }
    }
  }, [_vm._h('div', {
    staticClass: "card horizontal"
  }, [_vm._h('div', {
    staticClass: "card-stacked"
  }, [_vm._m(0), " ", _vm._h('div', {
    staticClass: "card-content"
  }, [_vm._h('div', {
    staticClass: "row"
  }, [_vm._h('notification', {
    attrs: {
      "type": "indigo lighten-1",
      "message": "Field marked <strong>(*)</strong> are required."
    }
  }), " ", _vm._h('div', {
    staticClass: "input-field col s12"
  }, [_vm._h('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.company.name),
      expression: "company.name"
    }],
    attrs: {
      "id": "company-name",
      "type": "text"
    },
    domProps: {
      "value": _vm._s(_vm.company.name)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.company.name = $event.target.value
      }
    }
  }), " ", _vm._h('label', {
    staticClass: "required",
    attrs: {
      "for": "company-name"
    }
  }, ["Name"])])]), " ", _vm._h('div', {
    staticClass: "row"
  }, [_vm._h('div', {
    staticClass: "input-field col s12"
  }, [_vm._h('textarea', {
    directives: [{
      name: "char-counter",
      rawName: "v-char-counter"
    }, {
      name: "model",
      rawName: "v-model",
      value: (_vm.company.description),
      expression: "company.description"
    }],
    staticClass: "materialize-textarea",
    attrs: {
      "id": "company-description",
      "length": "160"
    },
    domProps: {
      "value": _vm._s(_vm.company.description)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.company.description = $event.target.value
      }
    }
  }), " ", _vm._h('label', {
    staticClass: "required",
    attrs: {
      "for": "company-description"
    }
  }, ["Description"])])])]), " ", _vm._h('div', {
    staticClass: "card-action"
  }, [_vm._h('div', {
    staticClass: "col s12"
  }, [_vm._h('button', {
    staticClass: "waves-effect waves-light btn-flat teal white-text",
    attrs: {
      "type": "submit",
      "disabled": _vm.loading
    }
  }, [(_vm.loading) ? _vm._h('loader') : _vm._h('span', [_vm._h('i', {
    staticClass: "material-icons left"
  }, ["cloud"]), " Save\n                                "]), " "]), " ", _vm._h('button', {
    staticClass: "waves-effect waves-light btn-flat right",
    attrs: {
      "type": "button"
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.skip()
      }
    }
  }, [_vm._h('i', {
    staticClass: "material-icons right"
  }, ["skip_next"]), "Skip"])])])])])])])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('h2', {
    staticClass: "card-header"
  }, [_vm._h('i', {
    staticClass: "material-icons"
  }, ["business"]), " Create Company"])
}]}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-457d2eca", module.exports)
  }
}

/***/ },
/* 82 */,
/* 83 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h1', ["Teams"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5488e38c", module.exports)
  }
}

/***/ },
/* 84 */,
/* 85 */,
/* 86 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', [_vm._m(0), " ", _vm._h('p', ["Go Home: ", _vm._h('router-link', {
    attrs: {
      "to": {
        name: 'tasks'
      }
    }
  }, ["click here"])])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('h1', ["404 Error: ", _vm._h('small', ["Resource Not Found"])])
}]}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-6840cf18", module.exports)
  }
}

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "main-login"
  }, [_vm._h('div', {
    staticClass: "login-wrapper"
  }, [_vm._h('div', {
    staticClass: "login-container"
  }, [_vm._h('div', {
    staticClass: "card z-depth-3 grey lighten-4"
  }, [_vm._h('div', {
    staticClass: "card-content"
  }, [_vm._m(0), " ", _vm._h('form', {
    attrs: {
      "method": "post",
      "action": "/api/v1/login"
    },
    on: {
      "submit": function($event) {
        $event.preventDefault();
        _vm.authenticate($event)
      }
    }
  }, [_vm._h('div', {
    staticClass: "row"
  }, [_vm._h('div', {
    staticClass: "input-field col s12"
  }, [_vm._h('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.credentials.email),
      expression: "credentials.email"
    }],
    staticClass: "validate",
    attrs: {
      "type": "email",
      "name": "email"
    },
    domProps: {
      "value": _vm._s(_vm.credentials.email)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.credentials.email = $event.target.value
      }
    }
  }), " ", _vm._h('label', {
    staticClass: "_center",
    attrs: {
      "for": "email"
    }
  }, ["Enter your email"])])]), " ", _vm._h('div', {
    staticClass: "row"
  }, [_vm._h('div', {
    staticClass: "input-field col s12"
  }, [_vm._h('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.credentials.password),
      expression: "credentials.password"
    }],
    staticClass: "validate",
    attrs: {
      "type": "password",
      "name": "password"
    },
    domProps: {
      "value": _vm._s(_vm.credentials.password)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.credentials.password = $event.target.value
      }
    }
  }), " ", _vm._h('label', {
    staticClass: "_center",
    attrs: {
      "for": "password"
    }
  }, ["Enter your password"])]), " ", _vm._h('label', {
    staticClass: "right"
  }, [_vm._h('router-link', {
    staticClass: "pink-text",
    attrs: {
      "to": "/forgot-password"
    }
  }, [_vm._h('strong', ["Forgot Password?"])])])]), " ", _vm._h('div', {
    staticClass: "row"
  }, [_vm._h('button', {
    staticClass: "col s12 btn btn-large waves-effect teal",
    attrs: {
      "type": "submit",
      "disabled": _vm.loading
    }
  }, [(_vm.loading) ? _vm._h('loader', {
    staticStyle: {
      "width": "auto"
    },
    attrs: {
      "color": "grey"
    }
  }) : _vm._h('span', ["Login"]), " "])])])])]), " ", _vm._h('div', {
    staticClass: "center"
  }, [_vm._h('router-link', {
    staticClass: "white-text teal lighten-1 register-link",
    attrs: {
      "to": "/register"
    }
  }, ["Create account"])])])])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "center"
  }, [_vm._h('span', {
    staticClass: "card-title brand white-text"
  }, ["Social-Tasking"])])
}]}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-78af626d", module.exports)
  }
}

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    class: ["toast", _vm.type, "z-depth-" + _vm.depth],
    staticStyle: {
      "float": "none",
      "display": "block"
    },
    domProps: {
      "innerHTML": _vm._s(_vm.message)
    }
  }, ["Hi"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-96675cb4", module.exports)
  }
}

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h1', ["News"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-a64a9d02", module.exports)
  }
}

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h1', ["Projects"])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-c253acb4", module.exports)
  }
}

/***/ },
/* 91 */,
/* 92 */,
/* 93 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "loader"
  }, [_vm._h('div', {
    class: ['bounce1', _vm.color],
    style: (_vm.style)
  }), " ", _vm._h('div', {
    class: ['bounce2', _vm.color],
    style: (_vm.style)
  }), " ", _vm._h('div', {
    class: ['bounce3', _vm.color],
    style: (_vm.style)
  })])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-ea9149e4", module.exports)
  }
}

/***/ },
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(49);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-78af626d!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Login.vue", function() {
			var newContent = require("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-78af626d!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Login.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(50);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-ea9149e4!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Loader.vue", function() {
			var newContent = require("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-ea9149e4!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Loader.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_router__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_resource__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_resource___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vue_resource__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__websanova_vue_auth__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__websanova_vue_auth___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__websanova_vue_auth__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_App_vue__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_App_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__routes_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__store_store_js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__auth_js__ = __webpack_require__(10);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };






__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_2_vue_resource___default.a);

__webpack_require__(12);
__webpack_require__(11);






__WEBPACK_IMPORTED_MODULE_0_vue___default.a.config.silent = false;
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.config.devtools = true;
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.http.options.root = '/api/v1';
var router = new __WEBPACK_IMPORTED_MODULE_1_vue_router___default.a({ routes: __WEBPACK_IMPORTED_MODULE_5__routes_js__["a" /* default */], linkActiveClass: 'active', base: __dirname });

__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_3__websanova_vue_auth___default.a, _extends({
    router: router,
    http: __WEBPACK_IMPORTED_MODULE_0_vue___default.a.http
}, __WEBPACK_IMPORTED_MODULE_7__auth_js__["a" /* default */]));

var app = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a(_extends({ router: router, store: __WEBPACK_IMPORTED_MODULE_6__store_store_js__["a" /* default */] }, __WEBPACK_IMPORTED_MODULE_4__components_App_vue___default.a)).$mount('#app');

window.app = app;
/*
const router = new VueRouter({routes});

new Vue({
    name: 'SocialTask',
    store: store,
    router: router,
    render (c) {
        return c('div',{},[
            c('router-view')
        ]);
    } 
}).$mount('#app');
 */
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 103 */,
/* 104 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__partials_Navbar_vue__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__partials_Navbar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__partials_Navbar_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__partials_Leftbar_vue__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__partials_Leftbar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__partials_Leftbar_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__sub_components_CompanyCreator_vue__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__sub_components_CompanyCreator_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__sub_components_CompanyCreator_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vuex__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vuex___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vuex__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



// import Rightbar from './Rightbar.vue';



/* harmony default export */ exports["default"] = {
    name: "Dashboard",
    data: function data() {
        return {
            settings: {},
            tasks: []
        };
    },

    computed: {
        companies: function companies() {
            return this.$auth.user().companies;
        }
    },
    mounted: function mounted() {
        var settings = localStorage.getItem('settings');

        if (!settings) {
            settings = {
                company: {
                    skip: false
                }
            };
        } else {
            settings = JSON.parse(settings);
        }

        console.log(settings);

        this.settings = settings;

        settings = JSON.stringify(settings);

        localStorage.setItem('settings', settings);
    },

    components: { Navbar: __WEBPACK_IMPORTED_MODULE_0__partials_Navbar_vue___default.a, Leftbar: __WEBPACK_IMPORTED_MODULE_1__partials_Leftbar_vue___default.a, /*Rightbar, */CompanyCreator: __WEBPACK_IMPORTED_MODULE_2__sub_components_CompanyCreator_vue___default.a }
};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Navbar',
    data: function data() {
        return {};
    }
};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(122)

/* script */
__vue_exports__ = __webpack_require__(104)

/* template */
var __vue_template__ = __webpack_require__(108)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/Dashboard.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2bcc7a18", __vue_options__)
  } else {
    hotAPI.reload("data-v-2bcc7a18", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Dashboard.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(126)

/* script */
__vue_exports__ = __webpack_require__(105)

/* template */
var __vue_template__ = __webpack_require__(109)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/partials/Navbar.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-60e1281e", __vue_options__)
  } else {
    hotAPI.reload("data-v-60e1281e", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Navbar.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return ((_vm.companies.length || _vm.settings.skip) && _vm.$auth.ready()) ? _vm._h('div', [_vm._h('navbar'), " ", _vm._h('div', {
    attrs: {
      "id": "main"
    }
  }, [_vm._h('div', {
    staticClass: "wrapper"
  }, [_vm._h('leftbar'), " ", _vm._h('section', {
    attrs: {
      "id": "content"
    }
  }, [_vm._h('div', {
    staticClass: "container"
  }, [_vm._h('router-view')])])])])]) : _vm._h('company-creator')
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-2bcc7a18", module.exports)
  }
}

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "navbar-fixed"
  }, [_vm._h('nav', {
    staticClass: "blue lighten-1"
  }, [_vm._h('div', {
    staticClass: "nav-wrapper"
  }, [_vm._h('ul', {
    staticClass: "left"
  }, [_vm._h('li', [_vm._h('h3', {
    staticClass: "logo-wrapper"
  }, [_vm._h('span', {
    staticClass: "logo-text"
  }, ["Materialize"])])])]), " ", _vm._h('ul', {
    staticClass: "right hide-on-med-and-down"
  }, [_vm._h('li', [_vm._h('a', {
    staticClass: "waves-effect waves-block waves-light translation-button",
    attrs: {
      "href": "javascript:void(0);",
      "data-activates": "translation-dropdown"
    }
  }, [_vm._h('img', {
    attrs: {
      "src": "images/flag-icons/United-States.png",
      "alt": "USA"
    }
  })]), " ", _vm._h('ul', {
    staticClass: "dropdown-content",
    attrs: {
      "id": "translation-dropdown"
    }
  }, [_vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('img', {
    attrs: {
      "src": "images/flag-icons/United-States.png",
      "alt": "English"
    }
  }), " ", _vm._h('span', {
    staticClass: "language-select"
  }, ["English"])])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('img', {
    attrs: {
      "src": "images/flag-icons/France.png",
      "alt": "French"
    }
  }), " ", _vm._h('span', {
    staticClass: "language-select"
  }, ["French"])])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('img', {
    attrs: {
      "src": "images/flag-icons/China.png",
      "alt": "Chinese"
    }
  }), " ", _vm._h('span', {
    staticClass: "language-select"
  }, ["Chinese"])])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('img', {
    attrs: {
      "src": "images/flag-icons/Germany.png",
      "alt": "German"
    }
  }), " ", _vm._h('span', {
    staticClass: "language-select"
  }, ["German"])])])])]), " ", _vm._h('li', [_vm._h('a', {
    staticClass: "waves-effect waves-block waves-light toggle-fullscreen",
    attrs: {
      "href": "javascript:void(0);"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-action-settings-overscan"
  })])]), " ", _vm._h('li', [_vm._h('a', {
    staticClass: "waves-effect waves-block waves-light notification-button",
    attrs: {
      "href": "javascript:void(0);",
      "data-activates": "notifications-dropdown"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-social-notifications"
  }, [_vm._h('small', {
    staticClass: "notification-badge"
  }, ["5"])])]), _vm._h('ul', {
    staticClass: "dropdown-content",
    attrs: {
      "id": "notifications-dropdown"
    }
  }, [_vm._h('li', [_vm._h('h5', ["NOTIFICATIONS ", _vm._h('span', {
    staticClass: "new badge"
  }, ["5"])])]), " ", _vm._h('li', {
    staticClass: "divider"
  }), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-action-add-shopping-cart"
  }), " A new order has been placed!"]), " ", _vm._h('time', {
    staticClass: "media-meta",
    attrs: {
      "datetime": "2015-06-12T20:50:48+08:00"
    }
  }, ["2 hours ago"])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-action-stars"
  }), " Completed the task"]), " ", _vm._h('time', {
    staticClass: "media-meta",
    attrs: {
      "datetime": "2015-06-12T20:50:48+08:00"
    }
  }, ["3 days ago"])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-action-settings"
  }), " Settings updated"]), " ", _vm._h('time', {
    staticClass: "media-meta",
    attrs: {
      "datetime": "2015-06-12T20:50:48+08:00"
    }
  }, ["4 days ago"])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-editor-insert-invitation"
  }), " Director meeting started"]), " ", _vm._h('time', {
    staticClass: "media-meta",
    attrs: {
      "datetime": "2015-06-12T20:50:48+08:00"
    }
  }, ["6 days ago"])]), " ", _vm._h('li', [_vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-action-trending-up"
  }), " Generate monthly report"]), " ", _vm._h('time', {
    staticClass: "media-meta",
    attrs: {
      "datetime": "2015-06-12T20:50:48+08:00"
    }
  }, ["1 week ago"])])])]), " ", _vm._h('li', [_vm._h('a', {
    staticClass: "waves-effect waves-block waves-light chat-collapse",
    attrs: {
      "href": "#",
      "data-activates": "chat-out"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-communication-chat"
  })])])]), " ", " "])])])
}]}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-60e1281e", module.exports)
  }
}

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'Leftbar',
    data: function data() {
        return {};
    }
};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(120)

/* script */
__vue_exports__ = __webpack_require__(110)

/* template */
var __vue_template__ = __webpack_require__(112)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/partials/Leftbar.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-226be9ca"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-226be9ca", __vue_options__)
  } else {
    hotAPI.reload("data-v-226be9ca", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Leftbar.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('aside', [_vm._h('ul', {
    staticClass: "side-nav fixed",
    staticStyle: {
      "transform": "translateX(0px)"
    },
    attrs: {
      "id": "slide-out"
    }
  }, [_vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "about.html"
    }
  }, ["All Tasks"])]), " ", _vm._h('li', {
    staticClass: "divider"
  }), " ", _vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "getting-started.html"
    }
  }, ["Filters"])]), " ", _vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "getting-started.html"
    }
  }, [_vm._h('i', {
    staticClass: "material-icons dp48"
  }, ["add_alert"]), "Priority"])]), " ", _vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "getting-started.html"
    }
  }, [_vm._h('i', {
    staticClass: "material-icons dp48"
  }, ["perm_contact_calendar"]), "Today"])]), " ", _vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "http://materializecss.com/mobile.html"
    }
  }, ["Done"])]), " ", _vm._h('li', {
    staticClass: "bold"
  }, [_vm._h('a', {
    staticClass: "waves-effect waves-teal",
    attrs: {
      "href": "http://materializecss.com/mobile.html"
    }
  }, ["Deleted"])])]), " ", _vm._h('a', {
    staticClass: "sidebar-collapse btn-floating btn-medium waves-effect waves-light hide-on-large-only cyan",
    attrs: {
      "href": "#",
      "data-activates": "slide-out"
    }
  }, [_vm._h('i', {
    staticClass: "mdi-navigation-menu"
  })])])
}]}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-226be9ca", module.exports)
  }
}

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
    name: 'TaskCreator',
    data: function data() {
        return {
            showMore: false
        };
    },

    methods: {}
};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TaskCreator_vue__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TaskCreator_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__TaskCreator_vue__);
//
//
//
//
//
//
//
//



/* harmony default export */ exports["default"] = {
    name: "Tasks",
    data: function data() {
        return {
            tasks: []
        };
    },

    components: { TaskCreator: __WEBPACK_IMPORTED_MODULE_0__TaskCreator_vue___default.a }
};

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */
__webpack_require__(124)

/* script */
__vue_exports__ = __webpack_require__(113)

/* template */
var __vue_template__ = __webpack_require__(118)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/tasks/TaskCreator.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d5184f2c", __vue_options__)
  } else {
    hotAPI.reload("data-v-d5184f2c", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] TaskCreator.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(114)

/* template */
var __vue_template__ = __webpack_require__(117)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/home/roshan/personal/social/resources/assets/js/components/pages/tasks/Tasks.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3f8001d1", __vue_options__)
  } else {
    hotAPI.reload("data-v-3f8001d1", __vue_options__)
  }
})()}
if (__vue_options__.functional) {console.error("[vue-loader] Tasks.vue: functional components are not supported and should be defined in plain js files using render functions.")}

module.exports = __vue_exports__


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "row"
  }, [_vm._h('div', {
    staticClass: "col s12 m8 offset-m2"
  }, [_vm._h('task-creator')])])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-3f8001d1", module.exports)
  }
}

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;
  return _vm._h('nav', [_vm._h('div', {
    staticClass: "nav-wrapper white"
  }, [_vm._h('form', [_vm._h('div', {
    staticClass: "input-field"
  }, [_vm._h('input', {
    attrs: {
      "type": "search",
      "placeholder": "New task"
    },
    on: {
      "click": function($event) {
        _vm.showMore = true
      },
      "blur": function($event) {
        _vm.showMore = false
      }
    }
  }), " ", _vm._h('i', {
    staticClass: "material-icons"
  }, ["close"])]), " ", _vm._h('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_vm._h('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.showMore),
      expression: "showMore"
    }],
    staticClass: "more-fields"
  }, [_vm._h('div', {
    staticClass: "green",
    staticStyle: {
      "height": "100px"
    }
  })])])])])])
},staticRenderFns: []}
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-d5184f2c", module.exports)
  }
}

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\naside[data-v-226be9ca] {\n    position: fixed;\n    width: 100px;\n    left: 180px;\n    z-index: 999;\n    height: auto;\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/pages/partials/Leftbar.vue?6565aae1"],"names":[],"mappings":";AACA;IACA,gBAAA;IACA,aAAA;IACA,YAAA;IACA,aAAA;IACA,aAAA;CACA","file":"Leftbar.vue","sourcesContent":["<style scoped>\n    aside {\n        position: fixed;\n        width: 100px;\n        left: 180px;\n        z-index: 999;\n        height: auto;\n    }\n</style>\n<template>\n    <aside>\n        <ul class=\"side-nav fixed\" style=\"transform: translateX(0px);\" id=\"slide-out\">\n            <li class=\"bold\"><a href=\"about.html\" class=\"waves-effect waves-teal\">All Tasks</a></li>\n            <li class=\"divider\"></li>\n            <li class=\"bold\"><a href=\"getting-started.html\" class=\"waves-effect waves-teal\">Filters</a></li>\n            <li class=\"bold\"><a href=\"getting-started.html\" class=\"waves-effect waves-teal\"><i class=\"material-icons dp48\">add_alert</i>Priority</a></li>\n            <li class=\"bold\"><a href=\"getting-started.html\" class=\"waves-effect waves-teal\"><i class=\"material-icons dp48\">perm_contact_calendar</i>Today</a></li>\n            <li class=\"bold\"><a href=\"http://materializecss.com/mobile.html\" class=\"waves-effect waves-teal\">Done</a></li>\n            <li class=\"bold\"><a href=\"http://materializecss.com/mobile.html\" class=\"waves-effect waves-teal\">Deleted</a></li>\n        </ul>\n        <a href=\"#\" data-activates=\"slide-out\" class=\"sidebar-collapse btn-floating btn-medium waves-effect waves-light hide-on-large-only cyan\"><i class=\"mdi-navigation-menu\"></i></a>\n    </aside>\n</template>\n\n<script>\n    export default {\n        name: 'Leftbar',\n        data () {\n            return {}\n        }\n    }\n</script>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(119);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-226be9ca&scoped=true!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Leftbar.vue", function() {
			var newContent = require("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-226be9ca&scoped=true!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Leftbar.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n#main {\n    padding-left: 240px;\n}\n@media only screen and (min-width: 993px) {\n.container {\n        width: 98%;\n}\n}\n@media only screen and (min-width: 601px) {\n.container {\n        width: 98%;\n}\n}\n.container {\n    margin: 0 auto;\n    max-width: 100% !important;\n    width: 98%;\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/pages/Dashboard.vue?6f3de2fe"],"names":[],"mappings":";AACA;IACA,oBAAA;CACA;AACA;AACA;QACA,WAAA;CACA;CACA;AAEA;AACA;QACA,WAAA;CACA;CACA;AAEA;IACA,eAAA;IACA,2BAAA;IACA,WAAA;CACA","file":"Dashboard.vue","sourcesContent":["<style>\n    #main {\n        padding-left: 240px;\n    }\n    @media only screen and (min-width: 993px) {\n        .container {\n            width: 98%;\n        }\n    }\n\n    @media only screen and (min-width: 601px) {\n        .container {\n            width: 98%;\n        }\n    }\n\n    .container {\n        margin: 0 auto;\n        max-width: 100% !important;\n        width: 98%;\n    }\n</style>\n<template>\n    <div v-if=\"(companies.length || settings.skip) && $auth.ready()\">\n        <navbar></navbar>\n\n        <div id=\"main\">\n            <div class=\"wrapper\">\n                <leftbar></leftbar>\n                <section id=\"content\">\n                    <div class=\"container\">\n                        <router-view></router-view>\n                    </div>\n                </section>\n            </div>\n        </div>\n    </div>\n\n    <company-creator v-else></company-creator>\n</template>\n\n<script>\n    import Navbar from './partials/Navbar.vue';\n    import Leftbar from './partials/Leftbar.vue';\n    // import Rightbar from './Rightbar.vue';\n    import CompanyCreator from '../sub-components/CompanyCreator.vue';\n    import { mapGetters } from 'vuex';\n\n    export default {\n        name: \"Dashboard\",\n        data () {\n            return {\n                settings: {},\n                tasks: []\n            }\n        },\n        computed: {\n            companies () {\n                return this.$auth.user().companies;\n            }\n        },\n        mounted () {\n            let settings = localStorage.getItem('settings');\n            \n            if (!settings) {\n                settings = {\n                    company: {\n                        skip: false\n                    }\n                };\n            }else {\n                settings = JSON.parse(settings);\n            } \n\n            console.log(settings);\n\n            this.settings = settings;\n\n            settings = JSON.stringify(settings);\n\n            localStorage.setItem('settings', settings);\n        },\n        components: {Navbar, Leftbar, /*Rightbar, */CompanyCreator}\n    }\n</script>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(121);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2bcc7a18!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Dashboard.vue", function() {
			var newContent = require("!!./../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2bcc7a18!./../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Dashboard.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.fade-enter-active, .fade-leave-active {\n  transition: opacity .5s\n}\n.fade-enter, .fade-leave-active {\n  opacity: 0\n}\n.slide-fade-enter-active {\n  transition: all .3s ease;\n}\n.slide-fade-leave-active {\n  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.slide-fade-enter, .slide-fade-leave-active {\n  padding-left: 10px;\n  opacity: 0;\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/pages/tasks/TaskCreator.vue?4210cb5f"],"names":[],"mappings":";AACA;EACA,uBAAA;CACA;AACA;EACA,UAAA;CACA;AACA;EACA,yBAAA;CACA;AACA;EACA,qDAAA;CACA;AACA;EACA,mBAAA;EACA,WAAA;CACA","file":"TaskCreator.vue","sourcesContent":["<style>\n    .fade-enter-active, .fade-leave-active {\n      transition: opacity .5s\n    }\n    .fade-enter, .fade-leave-active {\n      opacity: 0\n    }\n    .slide-fade-enter-active {\n      transition: all .3s ease;\n    }\n    .slide-fade-leave-active {\n      transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n    }\n    .slide-fade-enter, .slide-fade-leave-active {\n      padding-left: 10px;\n      opacity: 0;\n    }\n</style>\n<template>\n    <nav>\n        <div class=\"nav-wrapper white\">\n            <form>\n                <div class=\"input-field\">\n                    <input type=\"search\" placeholder=\"New task\" @click=\"showMore = true\" @blur=\"showMore = false\">\n                    <i class=\"material-icons\">close</i>\n                </div>\n                <transition name=\"fade\">\n                    <div class=\"more-fields\" v-show=\"showMore\">\n                        <div style=\"height:100px\" class=\"green\"></div>\n                    </div>\n                </transition>\n            </form>\n        </div>\n    </nav>\n</template>\n\n<script>\n    export default {\n        name: 'TaskCreator',\n        data () {\n            return {\n                showMore: false\n            }\n        },\n        methods: {\n            \n        }\n    }\n</script>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(123);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-d5184f2c!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./TaskCreator.vue", function() {
			var newContent = require("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-d5184f2c!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./TaskCreator.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "\n.logo-wrapper {\n    margin: 0;\n}\n", "", {"version":3,"sources":["/./resources/assets/js/components/pages/partials/Navbar.vue?676ed1ca"],"names":[],"mappings":";AACA;IACA,UAAA;CACA","file":"Navbar.vue","sourcesContent":["<style>\n    .logo-wrapper {\n        margin: 0;\n    }\n</style>\n<template>\n    <div class=\"navbar-fixed\">\n        <nav class=\"blue lighten-1\">\n            <div class=\"nav-wrapper\">\n                <ul class=\"left\">                      \n                    <li>\n                        <h3 class=\"logo-wrapper\"><span class=\"logo-text\">Materialize</span></h3>\n                    </li>\n                </ul>\n                <ul class=\"right hide-on-med-and-down\">\n                    <li>\n                        <a href=\"javascript:void(0);\" class=\"waves-effect waves-block waves-light translation-button\" data-activates=\"translation-dropdown\"><img src=\"images/flag-icons/United-States.png\" alt=\"USA\"></a>\n                        <ul id=\"translation-dropdown\" class=\"dropdown-content\">\n                            <li>\n                            <a href=\"#!\"><img src=\"images/flag-icons/United-States.png\" alt=\"English\">  <span class=\"language-select\">English</span></a>\n                            </li>\n                            <li>\n                            <a href=\"#!\"><img src=\"images/flag-icons/France.png\" alt=\"French\">  <span class=\"language-select\">French</span></a>\n                            </li>\n                            <li>\n                            <a href=\"#!\"><img src=\"images/flag-icons/China.png\" alt=\"Chinese\">  <span class=\"language-select\">Chinese</span></a>\n                            </li>\n                            <li>\n                            <a href=\"#!\"><img src=\"images/flag-icons/Germany.png\" alt=\"German\">  <span class=\"language-select\">German</span></a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li><a href=\"javascript:void(0);\" class=\"waves-effect waves-block waves-light toggle-fullscreen\"><i class=\"mdi-action-settings-overscan\"></i></a>\n                    </li>\n                    <li><a href=\"javascript:void(0);\" class=\"waves-effect waves-block waves-light notification-button\" data-activates=\"notifications-dropdown\"><i class=\"mdi-social-notifications\"><small class=\"notification-badge\">5</small></i>\n                    \n                    </a><ul id=\"notifications-dropdown\" class=\"dropdown-content\">\n                  <li>\n                    <h5>NOTIFICATIONS <span class=\"new badge\">5</span></h5>\n                  </li>\n                  <li class=\"divider\"></li>\n                  <li>\n                    <a href=\"#!\"><i class=\"mdi-action-add-shopping-cart\"></i> A new order has been placed!</a>\n                    <time class=\"media-meta\" datetime=\"2015-06-12T20:50:48+08:00\">2 hours ago</time>\n                  </li>\n                  <li>\n                    <a href=\"#!\"><i class=\"mdi-action-stars\"></i> Completed the task</a>\n                    <time class=\"media-meta\" datetime=\"2015-06-12T20:50:48+08:00\">3 days ago</time>\n                  </li>\n                  <li>\n                    <a href=\"#!\"><i class=\"mdi-action-settings\"></i> Settings updated</a>\n                    <time class=\"media-meta\" datetime=\"2015-06-12T20:50:48+08:00\">4 days ago</time>\n                  </li>\n                  <li>\n                    <a href=\"#!\"><i class=\"mdi-editor-insert-invitation\"></i> Director meeting started</a>\n                    <time class=\"media-meta\" datetime=\"2015-06-12T20:50:48+08:00\">6 days ago</time>\n                  </li>\n                  <li>\n                    <a href=\"#!\"><i class=\"mdi-action-trending-up\"></i> Generate monthly report</a>\n                    <time class=\"media-meta\" datetime=\"2015-06-12T20:50:48+08:00\">1 week ago</time>\n                  </li>\n                </ul>\n                    </li>                        \n                    <li><a href=\"#\" data-activates=\"chat-out\" class=\"waves-effect waves-block waves-light chat-collapse\"><i class=\"mdi-communication-chat\"></i></a>\n                    </li>\n                </ul>\n                <!-- translation-button -->\n                \n                <!-- notifications-dropdown -->\n                \n            </div>\n        </nav>\n    </div>\n</template>\n\n<script>\n    export default {\n        name: 'Navbar',\n        data () {\n            return {}\n        }\n    }\n</script>"],"sourceRoot":"webpack://"}]);

// exports


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(125);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-60e1281e!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navbar.vue", function() {
			var newContent = require("!!./../../../../../../node_modules/css-loader/index.js?sourceMap!./../../../../../../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-60e1281e!./../../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navbar.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }
],[102]);
//# sourceMappingURL=app.js.map