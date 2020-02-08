(function(__g__) {

  if (typeof __g__.assert != 'undefined') {
    // already added, don't do again
    return;
  }

  var _log = [];

  /**
   * log: Log stuff
   *
   *
   */
  log = function () {
    var str = arguments[0];
    var obj = arguments[1];

    _log.push(str);
  };


  var UtgsUnit = {};  // private methods

  /**
  * For convenience, a variable that equals "undefined"
  */
  var UtgsUnit_UNDEFINED_VALUE;

  /**
  * Whether or not the current test page has been (completely) loaded yet
  */
  var isTestPageLoaded = false;

  /**
  * Predicate used for testing JavaScript == (i.e. equality excluding type)
  */
  UtgsUnit.DOUBLE_EQUALITY_PREDICATE = function(var1, var2) {return var1 == var2;};

  /**
  * Predicate used for testing JavaScript === (i.e. equality including type)
  */
  UtgsUnit.TRIPLE_EQUALITY_PREDICATE = function(var1, var2) {return var1 === var2;};

  /**
  * Predicate used for testing whether two obects' toStrings are equal
  */
  UtgsUnit.TO_STRING_EQUALITY_PREDICATE = function(var1, var2) {return var1.toString() === var2.toString();};

  /**
  * Hash of predicates for testing equality by primitive type
  */
  UtgsUnit.PRIMITIVE_EQUALITY_PREDICATES = {
    'String':   UtgsUnit.DOUBLE_EQUALITY_PREDICATE,
    'Number':   UtgsUnit.DOUBLE_EQUALITY_PREDICATE,
    'Boolean':  UtgsUnit.DOUBLE_EQUALITY_PREDICATE,
    'Date':     UtgsUnit.TRIPLE_EQUALITY_PREDICATE,
    'RegExp':   UtgsUnit.TO_STRING_EQUALITY_PREDICATE,
    'Function': UtgsUnit.TO_STRING_EQUALITY_PREDICATE
  }

  /**
  * @param Any object
  * @return String - the type of the given object
  * @private
  */
  UtgsUnit.trueTypeOf = function(something) {
    var result = typeof something;
    try {
      switch (result) {
        case 'string':
          break;
        case 'boolean':
          break;
        case 'number':
          break;
        case 'object':
        case 'function':
          switch (something.constructor) {
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
              var m = something.constructor.toString().match(/function\s*([^( ]+)\(/);
              if (m)
                result = m[1];
              else
                break;
          }
          break;
      }
    }
    finally {
      result = result.substr(0, 1).toUpperCase() + result.substr(1);
      return result;
    }
  }

  UtgsUnit.displayStringForValue = function(aVar) {
    var result = '<' + aVar + '>';
    if (!(aVar === null || aVar === UtgsUnit_UNDEFINED_VALUE)) {
      result += ' (' + UtgsUnit.trueTypeOf(aVar) + ')';
    }
    return result;
  }

  UtgsUnit.validateArguments = function(opt, fields) {
    fields = fields.split(' ');
    for (var f=0; f < fields.length; f++) {
      if (!opt.hasOwnProperty(fields[f])) {
        throw UtgsUnit.AssertionArgumentError("Assertions needs property " + fields[f] + " in opt argument");
      }
    }
    opt.comment = opt.comment || '';
  }

  UtgsUnit.checkEquals = function(var1, var2) {
    return var1 === var2;
  }

  UtgsUnit.checkNotUndefined = function(aVar) {
    return aVar !== UtgsUnit_UNDEFINED_VALUE;
  }

  UtgsUnit.checkNotNull = function(aVar) {
    return aVar !== null;
  }

  /**
  * All assertions ultimately go through this method.
  */
  UtgsUnit.assert = function(comment, booleanValue, failureMessage) {
    if (!booleanValue)
      throw new UtgsUnit.Failure(comment, failureMessage);
  }


  /**
  * @class
  * A UtgsUnit.Failure represents an assertion failure (or a call to fail()) during the execution of a Test Function
  * @param comment an optional comment about the failure
  * @param message the reason for the failure
  */
  UtgsUnit.Failure = function(comment, message) {
    /**
    * Declaration that this is a UtgsUnit.Failure
    * @ignore
    */
    this.isUtgsUnitFailure = true;
    /**
    * An optional comment about the failure
    */
    this.comment = comment;
    /**
    * The reason for the failure
    */
    this.UtgsUnitMessage = message;
    /**
    * The stack trace at the point at which the failure was encountered
    */
    // this.stackTrace = UtgsUnit.Util.getStackTrace();

    var failComment = '';
    if (comment != null) failComment = 'Comment: '+comment;
    message.__print__;
    throw Error(failComment +'\n\t\t  -- Failure: '+ message + '\n    ');
  }


  /**
  * @class
  * A UtgsUnitAssertionArgumentError represents an invalid call to an assertion function - either an invalid argument type
  * or an incorrect number of arguments
  * @param description a description of the argument error
  */
  UtgsUnit.AssertionArgumentError = function(description) {
    /**
    * A description of the argument error
    */
    this.description = description;
    throw Error('Argument error: '+ description);
  }


  /**
  * @class
  * @constructor
  * Contains utility functions for the UtgsUnit framework
  */
  UtgsUnit.Util = {};
  try {
    UtgsUnit.Util.ContextManager = ContextManager;
  } catch(err) {
    throw Error("Please install ContextManager")
  }

  /**
  * Standardizes an HTML string by temporarily creating a DIV, setting its innerHTML to the string, and the asking for
  * the innerHTML back
  * @param html
  */
  UtgsUnit.Util.standardizeHTML = function(html) {
    var translator = document.createElement("DIV");
    translator.innerHTML = html;
    return UtgsUnit.Util.trim(translator.innerHTML);
  }

  /**
  * Returns whether the given string is blank after being trimmed of whitespace
  * @param string
  */
  UtgsUnit.Util.isBlank = function(string) {
    return UtgsUnit.Util.trim(string) == '';
  }

  /**
  * Implemented here because the JavaScript Array.push(anObject) and Array.pop() functions are not available in IE 5.0
  * @param anArray the array onto which to push
  * @param anObject the object to push onto the array
  */
  UtgsUnit.Util.push = function(anArray, anObject) {
    anArray[anArray.length] = anObject;
  }

  /**
  * Implemented here because the JavaScript Array.push(anObject) and Array.pop() functions are not available in IE 5.0
  * @param anArray the array from which to pop
  */
  UtgsUnit.Util.pop = function pop(anArray) {
    if (anArray.length >= 1) {
      delete anArray[anArray.length - 1];
      anArray.length--;
    }
  }

  /**
  * Returns the name of the given function, or 'anonymous' if it has no name
  * @param aFunction
  */
  UtgsUnit.Util.getFunctionName = function(aFunction) {
    var regexpResult = aFunction.toString().match(/function(\s*)(\w*)/);
    if (regexpResult && regexpResult.length >= 2 && regexpResult[2]) {
      return regexpResult[2];
    }
    return 'anonymous';
  }

  /**
  * Returns the current stack trace
  */
  UtgsUnit.Util.getStackTrace = function() {
    var result = '';

    if (typeof(arguments.caller) != 'undefined') { // IE, not ECMA
      for (var a = arguments.caller; a != null; a = a.caller) {
        result += '> ' + UtgsUnit.Util.getFunctionName(a.callee) + '\n';
        if (a.caller == a) {
          result += '*';
          break;
        }
      }
    }
    else { // Mozilla, not ECMA
      // fake an exception so we can get Mozilla's error stack
      try
      {
        foo.bar;
      }
      catch(exception)
      {
        var stack = UtgsUnit.Util.parseErrorStack(exception);
        for (var i = 1; i < stack.length; i++)
        {
          result += '> ' + stack[i] + '\n';
        }
      }
    }

    return result;
  }

  /**
  * Returns an array of stack trace elements from the given exception
  * @param exception
  */
  UtgsUnit.Util.parseErrorStack = function(exception) {
    var stack = [];
    var name;

    if (!exception || !exception.stack) {
      return stack;
    }

    var stacklist = exception.stack.split('\n');

    for (var i = 0; i < stacklist.length - 1; i++) {
      var framedata = stacklist[i];

      name = framedata.match(/^(\w*)/)[1];
      if (!name) {
        name = 'anonymous';
      }

      stack[stack.length] = name;
    }
    // remove top level anonymous functions to match IE

    while (stack.length && stack[stack.length - 1] == 'anonymous') {
      stack.length = stack.length - 1;
    }
    return stack;
  }

  /**
  * Strips whitespace from either end of the given string
  * @param string
  */
  UtgsUnit.Util.trim = function(string) {
    if (string == null)
      return null;

    var startingIndex = 0;
    var endingIndex = string.length - 1;

    var singleWhitespaceRegex = /\s/;
    while (string.substring(startingIndex, startingIndex + 1).match(singleWhitespaceRegex))
      startingIndex++;

    while (string.substring(endingIndex, endingIndex + 1).match(singleWhitespaceRegex))
      endingIndex--;

    if (endingIndex < startingIndex)
      return '';

    return string.substring(startingIndex, endingIndex + 1);
  }

  UtgsUnit.Util.getKeys = function(obj) {
    var keys = [];
    for (var key in obj) {
      UtgsUnit.Util.push(keys, key);
    }
    return keys;
  }

  // private function here that makes context managers
  //:

  UtgsUnit.Util.inherit = function(superclass, subclass) {
      var x = function() {};
      x.prototype = superclass.prototype;
      subclass.prototype = new x();
  }

  __g__.assert = {

    FailError: UtgsUnit.Failure,

    contextManager: UtgsUnit.Util.ContextManager,

    /**
    * Checks that two values are equal (using ===)
    * @param {String} comment optional, displayed in the case of failure
    * @param {Value} expected the expected value
    * @param {Value} actual the actual value
    * @throws UtgsUnit.Failure if the values are not equal
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    equals: function (opt) {
      UtgsUnit.validateArguments(opt, 'expected actual');
      UtgsUnit.assert(opt.comment, UtgsUnit.checkEquals(opt.expected, opt.actual), 'Expected {0.expected} but was {0.actual}'.__format__(opt));
    },


    /**
    * Checks that the given boolean value is true.
    * @param {String} comment optional, displayed in the case of failure
    * @param {Boolean} value that is expected to be true
    * @throws UtgsUnit.Failure if the given value is not true
    * @throws UtgsUnitInvalidAssertionArgument if the given value is not a boolean or if an incorrect number of arguments is passed
    */
    assert: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        if (typeof(opt.actual) != 'boolean')
            throw new UtgsUnit.AssertionArgumentError('Bad argument to assert(boolean)');

        UtgsUnit.assert(opt.comment, opt.actual === true, 'Call to assert(boolean) with false');
    },


    /**
    * Synonym for true_
    * @see #assert
    */
    true_: function (opt) {
        this.assert(opt);
    },

    /**
    * Checks that a boolean value is false.
    * @param {String} comment optional, displayed in the case of failure
    * @param {Boolean} value that is expected to be false
    * @throws UtgsUnit.Failure if value is not false
    * @throws UtgsUnitInvalidAssertionArgument if the given value is not a boolean or if an incorrect number of arguments is passed
    */
    false_: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');

        if (typeof(opt.actual) != 'boolean')
            throw new UtgsUnit.AssertionArgumentError('Bad argument to false_(boolean)');

        UtgsUnit.assert(opt.comment, opt.actual === false, 'Call to false_(boolean) with true');
    },

    /**
    * Checks that two values are not equal (using !==)
    * @param {String} comment optional, displayed in the case of failure
    * @param {Value} value1 a value
    * @param {Value} value2 another value
    * @throws UtgsUnit.Failure if the values are equal
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    notEqual: function (opt) {
        UtgsUnit.validateArguments(opt, 'expected actual');
        UtgsUnit.assert(opt.comment, opt.expected !== opt.actual, 'Expected not to be {0.expected}'.__format__(opt));
    },

    /**
    * Checks that a value is null
    * @param {opt}
    * @throws UtgsUnit.Failure if the value is not null
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    null_: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        UtgsUnit.assert(opt.comment, opt.actual === null, 'Expected ' + UtgsUnit.displayStringForValue(null) + ' but was {0.actual}'.__format__(opt));
    },

    /**
    * Checks that a value is not null
    * @param {opt} value the value
    * @throws UtgsUnit.Failure if the value is null
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    notNull: function(opt) {
      UtgsUnit.validateArguments(opt, 'actual');
      UtgsUnit.assert(opt.comment, UtgsUnit.checkNotNull(opt.actual), 'Expected not to be ' + UtgsUnit.displayStringForValue(null));
    },

    /**
    * Checks that a value is undefined
    * @param {opt}
    * @throws UtgsUnit.Failure if the value is not undefined
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    undefined_: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        UtgsUnit.assert(opt.comment, opt.actual === UtgsUnit_UNDEFINED_VALUE, 'Expected ' + UtgsUnit.displayStringForValue(UtgsUnit_UNDEFINED_VALUE) + ' but was ' + UtgsUnit.displayStringForValue(opt.actual));
    },

    /**
    * Checks that a value is not undefined
    * @param {opt} comment optional, displayed in the case of failure
    * @throws UtgsUnit.Failure if the value is undefined
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    notUndefined: function (opt) {
      UtgsUnit.validateArguments(opt, 'actual');
      UtgsUnit.assert(opt.comment, UtgsUnit.checkNotUndefined(opt.actual), 'Expected not to be ' + UtgsUnit.displayStringForValue(UtgsUnit_UNDEFINED_VALUE));
    },

    /**
    * Checks that a value is NaN (Not a Number)
    * @param {opt} comment optional, displayed in the case of failure
    * @throws UtgsUnit.Failure if the value is a number
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    NaN_: function (opt) {
      UtgsUnit.validateArguments(opt, 'actual');
      UtgsUnit.assert(opt.comment, isNaN(opt.actual), 'Expected NaN');
    },

    /**
    * Checks that a value is not NaN (i.e. is a number)
    * @param {String} comment optional, displayed in the case of failure
    * @param {Number} value the value
    * @throws UtgsUnit.Failure if the value is not a number
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    notNaN: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        UtgsUnit.assert(opt.comment, !isNaN(opt.actual), 'Expected not NaN');
    },

    /**
    * Checks that an object is equal to another using === for primitives and their object counterparts but also desceding
    * into collections and calling objectEquals for each element
    * @param {Object} opt
    * @throws UtgsUnit.Failure if the actual value does not equal the expected value
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    objectEquals: function (opt) {
        UtgsUnit.validateArguments(opt, 'expected actual');
        if (opt.expected === opt.actual)
            return;

        var isEqual = false;

        var typeOfVar1 = UtgsUnit.trueTypeOf(opt.expected);
        var typeOfVar2 = UtgsUnit.trueTypeOf(opt.actual);

        if (typeOfVar1 == typeOfVar2) {
            var primitiveEqualityPredicate = UtgsUnit.PRIMITIVE_EQUALITY_PREDICATES[typeOfVar1];
            if (primitiveEqualityPredicate) {
                isEqual = primitiveEqualityPredicate(opt.expected, opt.actual);
            } else {
                var expectedKeys = UtgsUnit.Util.getKeys(opt.expected).sort().join(", ");
                var actualKeys = UtgsUnit.Util.getKeys(opt.actual).sort().join(", ");
                if (expectedKeys != actualKeys) {
                    UtgsUnit.assert(opt.comment, false, 'Expected keys "' + expectedKeys + '" but found "' + actualKeys + '"');
                }
                for (var i in opt.expected) {
                  this.objectEquals({comment: opt.comment + ' found nested ' + typeOfVar1 + '@' + i + '\n',
                                           expected:opt.expected[i],
                                           actual:opt.actual[i]});
                }
                isEqual = true;
            }
        }
        UtgsUnit.assert(opt.comment, isEqual, 'Expected ' + UtgsUnit.displayStringForValue(opt.expected) + ' but was ' + UtgsUnit.displayStringForValue(opt.actual));
    },

    /**
    * Checks that an array is equal to another by checking that both are arrays and then comparing their elements using objectEquals
    * @param {Object}
    *        {Object.expected} value the expected array
    *        {Object.actual} value the actual array
    * @throws UtgsUnit.Failure if the actual value does not equal the expected value
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    arrayEquals: function (opt) {
        UtgsUnit.validateArguments(opt, 'expected actual');
        if (UtgsUnit.trueTypeOf(opt.expected) != 'Array' || UtgsUnit.trueTypeOf(opt.actual) != 'Array') {
            throw new UtgsUnit.AssertionArgumentError('Non-array passed to arrayEquals');
        }
        this.objectEquals(opt);
    },

    /**
    * Checks that a value evaluates to true in the sense that value == true
    * @param {String} comment optional, displayed in the case of failure
    * @param {Value} value the value
    * @throws UtgsUnit.Failure if the actual value does not evaluate to true
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    evaluatesToTrue: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        if (!opt.actual)
            this.fail(opt.comment);
    },

    /**
    * Checks that a value evaluates to false in the sense that value == false
    * @param {String} comment optional, displayed in the case of failure
    * @param {Value} value the value
    * @throws UtgsUnit.Failure if the actual value does not evaluate to true
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    evaluatesToFalse: function (opt) {
        UtgsUnit.validateArguments(opt, 'actual');
        if (opt.actual)
            this.fail(opt.comment);
    },

    /**
    * Checks that a hash is has the same contents as another by iterating over the expected hash and checking that each
    * key's value is present in the actual hash and calling equals on the two values, and then checking that there is
    * no key in the actual hash that isn't present in the expected hash.
    * @param {String} comment optional, displayed in the case of failure
    * @param {Object} value the expected hash
    * @param {Object} value the actual hash
    * @throws UtgsUnit.Failure if the actual hash does not evaluate to true
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    hashEquals: function (opt) {
      UtgsUnit.validateArguments(opt, 'actual expected');
      for (var key in opt.expected) {
        this.notUndefined({comment: "Expected hash had key " + key + " that was not found in actual",
                                 actual:opt.actual[key]});
        this.equals({comment:"Value for key " + key + " mismatch - expected = " + opt.expected[key] + ", actual = " + opt.actual[key],
                           expected:opt.expected[key],
                           actual:opt.actual[key]}
                         );
      }
      for (var key in opt.actual) {
        this.notUndefined({comment:"Actual hash had key " + key + " that was not expected", actual:opt.expected[key]});
      }
    },

    /**
    * Checks that two value are within a tolerance of one another
    * @param {String} comment optional, displayed in the case of failure
    * @param {Number} value1 a value
    * @param {Number} value1 another value
    * @param {Number} tolerance the tolerance
    * @throws UtgsUnit.Failure if the two values are not within tolerance of each other
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments is passed
    */
    roughlyEquals: function (opt) {
      UtgsUnit.validateArguments(opt, 'actual expected tolerance');
      this.true_({comment: "Expected " + opt.expected + ", but got " + opt.actual + " which was more than " + opt.tolerance + " away",
                       actual:Math.abs(opt.expected - opt.actual) < opt.tolerance});
    },

    /**
    * Checks that a collection contains a value by checking that collection.indexOf(value) is not -1
    * @param {Object}
    * @param {Object.collection}
    * @param {Object.value}
    * @throws UtgsUnit.Failure if the collection does not contain the value
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments are passed
    */
    contains: function (opt) {
      UtgsUnit.validateArguments(opt, 'value collection');
      this.true_({comment: "Expected '{0.collection}' to contain '{0.value}'".__format__(opt),
                       actual: opt.collection.indexOf(opt.value) != -1});
    },

    /**
    * Checks that two arrays have the same contents, ignoring the order of the contents
    * @param {Object}
    * @param {Object.expected} array1 first array
    * @param {Object.actual} second array
    * @throws UtgsUnit.Failure if the two arrays contain different contents
    * @throws UtgsUnitInvalidAssertionArgument if an incorrect number of arguments are passed
    */
    arrayEqualsIgnoringOrder: function(opt) {
        UtgsUnit.validateArguments(opt, 'expected actual');

        var notEqualsMessage = "Expected arrays {0.expected} and {0.actual} to be equal (ignoring order)".__format__(opt);
        var notArraysMessage = "Expected arguments {0.expected} and {0.actual} to be arrays".__format__(opt);

        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotNull(opt.expected), notEqualsMessage);
        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotNull(opt.actual), notEqualsMessage);

        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotUndefined(opt.expected.length), notArraysMessage);
        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotUndefined(opt.expected.join), notArraysMessage);
        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotUndefined(opt.actual.length), notArraysMessage);
        UtgsUnit.assert(opt.comment, UtgsUnit.checkNotUndefined(opt.actual.join), notArraysMessage);

        UtgsUnit.assert(opt.comment, UtgsUnit.checkEquals(opt.expected.length, opt.actual.length), notEqualsMessage);

        for (var i = 0; i < opt.expected.length; i++) {
            var found = false;
            for (var j = 0; j < opt.actual.length; j++) {
                try {
                  this.objectEquals({comment: notEqualsMessage,
                                           expected:opt.expected[i],
                                           actual: opt.actual[j]});
                    found = true;
                } catch (ignored) {
                }
            }
            UtgsUnit.assert(opt.comment, found, notEqualsMessage);
        }
    },

    throws: function (opt, func) {
      UtgsUnit.validateArguments(opt, 'expectedError');
      if (typeof(func) !== 'function') throw UtgsUnit.Failure("Must have function");
      var caughtError = false;

      try {
        func.call();
      } catch (err) {
        caughtError = true;
        UtgsUnit.assert(opt.comment, err instanceof opt.expectedError, "Expected thrown error to be of type " + (opt.expectedError.name || opt.expectedError.toString()));
      }

      if (!caughtError)
        throw UtgsUnit.Failure("No error was thrown, expecting error of type '" + opt.expectedError.name);
    },

    doesNotThrow: function (opt, func) {
      UtgsUnit.validateArguments(opt, 'unexpectedError');
      if (typeof(func) !== 'function') throw UtgsUnit.Failure("Must have function");

      try {
        func.call();
      } catch (err) {
        UtgsUnit.assert(opt.comment, err instanceof opt.unexpectedError, "Did not expect to throw error of type " + opt.unexpectedError.name);
      }
    },

    throwsError: function (comment, func) {
      var saved, ret;
      saved = assert.result;

      if (arguments.length == 1) {
        func = comment;
        comment = '';
      }
      ret = this.throws.call(this, {expectedError:Error}, func);
      if (assert.result == false && saved == true) {
        assert.result = true;
      }
      return ret;
    },

    doesNotThrowError: function (comment, func) {
      if (arguments.length == 1) {
        func = comment;
        comment = '';
      }
      return this.doesNotThrow.call(this, {unexpectedError: Error}, func);
    },

    throwsTypeError: function (comment, func) {
      if (arguments.length == 1) {
        func = comment;
        comment = '';
      }
      return this.throws.call(this, {expectedError: TypeError}, func);
    },

    throwsRangeError: function (comment, func) {
      if (arguments.length == 1) {
        func = comment;
        comment = '';
      }
      return this.throws.call(this, {expectedError: RangeError,
                                           comment:comment}, func);
    },

    throwsReferenceError: function (comment, func) {
      if (arguments.length == 1) {
        func = comment;
        comment = '';
      }
      return this.throws.call(this, {comment: comment,
                                           expectedError: ReferenceError}, func);
    },

    describe: function (description, body) {
      let ctx = new UtgsUnit.Util.ContextManager();
      ctx.enter = () => { _log = ['\n\n' + description]; };
      ctx.exit = () => {
        _log.push('\n');
        Logger.log(_log.join('\n'));
        _log = [];
      };
      ctx.with(body);
    },

    withContext: function (body, options) {
      let ctx = new UtgsUnit.Util.ContextManager(options);
      ctw.with(body);
    },

    it: function (shouldMessage, body) {
      let ctx = new UtgsUnit.Util.ContextManager();
      ctx.enter  = function () {
        this.result = "\t✔ " + shouldMessage;
      };
      ctx.error = function (err, obj) {
        this.result = '\t✘ ' + shouldMessage + '\n\t\t' + err + (err.stack ? err.stack : err.toString());
        return null;
      };
      ctx.exit = function (obj) {
        log(this.result);
      };
      ctx.params = {};
      //go
      ctx.with(body);
    },

    skip: function (shouldMessage, body) {
      log("\t☛ " + shouldMessage + '... SKIPPED');
    },

    /**
    * Causes a failure
    * @param failureMessage the message for the failure
    */
    fail: function (failureMessage) {
        throw new UtgsUnit.Failure("Call to fail()", failureMessage);
    },
   }

   __g__.describe = assert.describe;
   __g__.it = assert.it;

   let _result_ = Symbol('result');

   class UnitTesting {
     static set result (value) {
       this[_result_] = value;
     }

     static get result () {
       return this[_result_];
     }

     static init () {
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
               var value = lookup(args, key.split('.'));
               if (xf == null) {
                 return '<' + value + '> (' + typeof value + ')';
               } else if (Object.prototype.hasOwnProperty.call({}, xf)) {
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

       if (typeof String.prototype.__format__ === 'undefined') {

         Object.defineProperty(String.prototype, '__format__', {
           get: function () {
             var $format = create({});
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
     }
   }

   __g__.UnitTesting = UnitTesting;

})(this);
