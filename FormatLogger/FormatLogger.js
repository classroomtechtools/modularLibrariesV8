(function (__g__) {
  /*
    Template tag
    Usage __log__`${variables}`;
  */
  function __log__(strings, ...values) {
    const output = strings.map( (string, index) => `${string}${values[index] ? values[index] : ''}` );
    Logger.log(output.join(''));
  }

  function configure (config) {
    config = config || {};
    config.useLogger = config.useLogger || false;
    config.transformers = config.transformers || {};
    config.defaultTransformString = config.defaultTransformString || "{0}";
    config.pprintNewlines = config.pprintNewlines || true;
    config.pprintWhitespace = config.pprintWhitespace || 4;
    if (config.useLogger)
      config.loggerObject = Logger;
    else
      config.loggerObject = console;
    return config;
  }

  /*

  */
  function action(options) {

    __g__.__log__ = __log__;

    let config = configure(options);

    //  ValueError :: String -> Error
    var ValueError = function(message) {
      var err = new Error(message);
      err.name = 'ValueError';
      return err;
    };

    //  defaultTo :: a,a? -> a
    var defaultTo = function(x, y) {
      return y == null ? x : y;
    };

    //  create :: Object -> String,*... -> String
    var create = function() {

      return function(template) {
        var args = Array.prototype.slice.call(arguments, 1);
        var idx = 0;
        var state = 'UNDEFINED';

        return template.replace(
          /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
          function(match, literal, key, xf) {
            if (literal != null) {
              return literal;
            }
            if (key.length > 0) {
              if (state === 'IMPLICIT') {
                throw ValueError('cannot switch from ' +
                                 'implicit to explicit numbering');
              }
              state = 'EXPLICIT';
            } else {
              if (state === 'EXPLICIT') {
                throw ValueError('cannot switch from ' +
                                 'explicit to implicit numbering');
              }
              state = 'IMPLICIT';
              key = String(idx);
              idx += 1;
            }
            var value = defaultTo('', lookup(args, key.split('.')));
            if (xf == null) {
              return value;
            } else if (Object.prototype.hasOwnProperty.call(config.transformers, xf)) {
              return config.transformers[xf](value);
            } else {
              throw ValueError('no transformer named "' + xf + '"');
            }
          }
        );
      };
    };

    var lookup = function(obj, path) {
      if (!/^\d+$/.test(path[0])) {
        path = ['0'].concat(path);
      }
      for (var idx = 0; idx < path.length; idx += 1) {
        var key = path[idx];
        if (typeof obj[key] === 'function')
          obj = obj[key]();
        else
          obj = obj[key];
      }
      return obj;
    };

    Object.defineProperty(Object.prototype, 'stringify', {
      get: function () {
        return function (pretty) {
          pretty = pretty || false;
          if (pretty)
            return (config.pprintNewlines ? "\n" : "") +
              config.defaultTransformString.__format__(JSON.stringify(this, null, config.pprintWhitespace), this);
          else
            return config.defaultTransformString.__format__(JSON.stringify(this), this);
        }
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(Object.prototype, 'typeof_', {
      get: function () {
        var result = typeof this;
        switch (result) {
          case 'string':
            break;
          case 'boolean':
            break;
          case 'number':
            break;
          case 'object':
          case 'function':
            switch (this.constructor) {
              case new String().constructor:
                result = 'String';
                break;
              case new Boolean().constructor:
                result = 'Boolean';
                break;
              case new Number().constructor:
                result = 'Number';
                break;
              case new Array().constructor:
                result = 'Array';
                break;
              case new RegExp().constructor:
                result = 'RegExp';
                break;
              case new Date().constructor:
                result = 'Date';
                break;
              case Function:
                result = 'Function';
                break;
              default:
                result = this.constructor.toString();
                var m = this.constructor.toString().match(/function\s*([^( ]+)\(/);
                if (m)
                  result = m[1];
                else
                  result = this.constructor.name;   // it's an ES6 class, use name of constructor
                break;
            }
            break;
        }
        return result.substr(0, 1).toUpperCase() + result.substr(1);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(Object.prototype, 'print', {
      get: function () {
        return this.stringify(false);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(Object.prototype, '__print__', {
      get: function () {
        config.loggerObject.log.call(config.loggerObject, this.stringify(false) );
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(Object.prototype, 'pprint', {
      get: function () {
        return this.stringify(true);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(Object.prototype, '__pprint__', {
      get: function () {
        config.loggerObject.log.call(config.loggerObject, this.stringify(true) );
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(String.prototype, '__log__', {
      get: function () {
        return function() {
          config.loggerObject.log.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
        }.bind(this);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(String.prototype, '__error__', {
      get: function () {
        return function() {
          config.loggerObject.error.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
        }.bind(this);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(String.prototype, '__info__', {
      get: function () {
        return function() {
          config.loggerObject.info.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
        }.bind(this);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(String.prototype, '__warn__', {
      get: function () {
        return function() {
          config.loggerObject.warn.call(config.loggerObject, this.__format__.apply(this, Array.prototype.slice.call(arguments)) );
        }.bind(this);
      },
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(String.prototype, '__format__', {
      get: function () {
        var $format = create(config.transformers);
        return function () {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this);
          return $format.apply(__g__, args);
        }
      },
      configurable: true,
      enumerable: false,
    });
  }

  class FormatLogger {

    constructor (options) {
      // execute with some options
      action(options);
    }

    static init () {
      // execute with default options
      action({
        useLogger: true,  // uses Logger.log, false for console.log
        defaultTransformString: '<{0}> ({1.typeof_})',
        pprintNewLines: false
      });
    }

  }

  __g__.FormatLogger = FormatLogger;


})(this);
