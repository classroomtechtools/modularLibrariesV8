/*
Imported via dev.gs
 */

function testing_utgs() {
  UnitTesting.init();

  /*
    Under the hood, the describe and it functions, as well as the assert.throws* methods,
    are implemented with a context manager, whose functionality is tested here
    (With describe and it methods!)
  */
  (function ContextManagerTests () {

      describe("Context manager", function () {

        it(".state saves and is available after execution", function () {
          let ctx = new ContextManager();
          ctx.with(function () {
            this.hi = 'hi'
          });
          let actual = ctx.state;
          let expected = {hi: 'hi'};
          assert.objectEquals({actual, expected});
        });

        it("subclassing to get different defaultObject", function () {
          class MyContextManager extends ContextManager {
            defaultObject () { return []; };
          }
          let ctx = new MyContextManager();
          ctx.with(function () {
            this.push('hi');
          });
          let actual = ctx.state;
          let expected = ['hi'];
          assert.arrayEquals({actual, expected});
        });

        it("error handler receives error and can swallow error", function () {
          let ctx = new ContextManager();
          ctx.error = function (err) {
            this.errorMessage = err.toString();
            return null;
          };
          ctx.with(function () {
            throw Error("message");
          });
          let actual = ctx.state;
          let expected = {errorMessage: "Error: message"};
          assert.objectEquals({actual:actual, expected:expected});
        });

        it("Saves state between enter and exit calls, return this", function () {
          let ctx = new ContextManager();
          ctx.enter = function () {
            this.log = [];
            this.log.push('entering');
          };
          ctx.exit = function () {
            this.log.push('exiting');
          };

          let actual = ctx.with(function () {
            this.log.push('inside body');
            return this;
          });
          let expected = {log:['entering', 'inside body', 'exiting']};
          assert.objectEquals({actual: actual, expected:expected});
        });

        it("Can be passed a parameter", function () {
          let ctx = new ContextManager();
          const param = "param";
          ctx.param = param;
          ctx.with(function  (param) {
            this.param = param;
          });
          let actual = ctx.state;
          let expected = {param:param};
          assert.objectEquals({actual:actual, expected:expected});
        });

      });

  })();


  /*
    Tests the assert* range of functions
  */
  (function AssertionTests () {

    describe("Pass when actual meets expected", function () {
      it("assertTrue", function () {
        assert.true_({actual:true});
      });

      it("assertFalse", function () {
        assert.false_({actual:false});
      });

      it("assertEquals", function () {
        assert.equals({actual:true,expected:true});
      });

      it("assertNotEquals", function () {
        assert.notEqual({expected:true,actual:false});
      });

      it("assertNull", function () {
        assert.null_({actual:null});
      });

      it("assertNotNull", function () {
        assert.notNull({actual:undefined});
        assert.notNull({actual:0});
      });

      it("assertUndefined", function () {
        assert.undefined_({actual:undefined});
      });

      it("assertNotUndefined", function () {
        assert.notUndefined({actual:null});
      });

      it("assertNaN", function () {
        assert.NaN_({actual:NaN});
      });

      it("assetNotNaN", function () {
        assert.notNaN({actual:0});
      });

      it("assertObjectEquals", function () {
        assert.objectEquals({expected:{hi:'hi'}, actual:{hi:'hi'}});
      });

      it("assertObjectEquals with date", function () {
        const date = new Date();
        assert.objectEquals({expected:{date:date}, actual:{date:date}, comment: "date embedded in object"});
        assert.objectEquals({expected:date, actual:date, comment: "date on its own"});
      });

      it("assertArrayEquals", function () {
        assert.arrayEquals({expected: ['hello', 'world'], actual: ['hello', 'world']});
      });

      it("assertEvaluatesToTrue", function () {
        assert.evaluatesToTrue({actual:1});
        assert.evaluatesToTrue({actual:true});
        assert.evaluatesToTrue({actual:'hi'});
      });

      it("assertEvaluatesToFalse", function () {
        assert.evaluatesToFalse({actual:0});
        assert.evaluatesToFalse({actual:false});
        assert.evaluatesToFalse({actual:''});
      });

      it("assertHashEquals", function () {
        assert.hashEquals({expected:{hi:'hi'}, actual:{hi:'hi'}});
      });

      it("assertRoughlyEquals", function () {
        assert.roughlyEquals({expected:1,actual:1.5,tolerance:1});
      });

      it("assertContains", function () {
        assert.contains({value: 1, collection:[1, 2]});
      });

      it("assertArrayEqualsIgnoringOrder", function () {
        assert.arrayEqualsIgnoringOrder({expected: [2, 1], actual:[1, 2]});
      });

      it("assertThrowsError", function () {
        assert.throwsError(function () {
          throw new TypeError("expected error thrown");
        });
      });

      it("assertDoesNotThrowError", function () {
        assert.doesNotThrowError(function () {
          "do nothing";
        });
      });

      it("assertThrowsTypeError", function () {
        assert.throwsTypeError(function () {
          throw new TypeError("error thrown!");
        });
      });

      it("assertThrowsTypeError", function () {
        assert.throwsTypeError(function () {
          throw new TypeError("error thrown!");
        });
      });

      it("assertThrowsRangeError", function () {
        assert.throwsRangeError(function () {
          throw new RangeError("error thrown!");
        });
      });

    });


    describe("Fail when actual does not match expected", function () {
      it("assertTrue fails", function () {
        assert.throwsError(function () {
          assert.true_(false);
        });
      });

      it("assertFalse fails", function () {
        assert.throwsError(function () {
          assert.false_(true);
        });
      });

      it("assertEquals fails", function () {
        assert.throwsError(function () {
          assert.equals(true, false);
        });
      });

      it("assertNotEquals fails", function () {
        assert.throwsError(function () {
          assert.notEqual(true, true);
        });
      });

      it("assertNull fails", function () {
        assert.throwsError(function () {
          assert.null_('');
        });
      });

      it("assertNotNull", function () {
        assert.throwsError(function () {
          assert.notNull(null);
        });
      });

      it("assertUndefined", function () {
        assert.throwsError(function () {
          assert.undefined_(null);
        });
      });

      it("assertNotUndefined", function () {
        assert.throwsError(function () {
          assert.notUndefined(undefined);
        });
      });

      it("assertNaN", function () {
        assert.throwsError(function () {
          assert.NaN_(0);
        });
      });

      it("assetNotNaN", function () {
        assert.throwsError(function () {
          assert.notNaN(NaN);
        });
      });

      it("assertObjectEquals", function () {
        assert.throwsError(function () {
          assert.objectEquals({hi:'hi'}, {hi:'hi', something:'hi'});
        });
      });

      it("assertArrayEquals", function () {
        assert.throwsError(function () {
          assert.arrayEquals(['hello', 'world'], ['hello']);
        });
      });

      it("assertEvaluatesToTrue", function () {
        assert.throwsError(function () {
          assert.evaluatesToTrue(false);
        });
      });

      it("assertEvaluatesToFalse", function () {
        assert.throwsError(function () {
          assert.evaluatesToFalse(true);
        });
      });

      it("assertHashEquals", function () {
        assert.throwsError(function () {
          assert.hashEquals({expected: {hi:'hi'}, actual:{hi:'hello'}});
        });
      });

      it("assertRoughlyEquals", function () {
        assert.throwsError(function () {
          assert.roughlyEquals({expected: 1,
                                  actual:2,
                                  tolerance:1});
        });
      });

      it("assertContains", function () {
        assert.throwsError(function () {
          assert.contains(1, [0, 2]);
        });
      });

      it("assertArrayEqualsIgnoringOrder", function () {
        assert.throwsError(function () {
          assert.arrayEqualsIgnoringOrder([2, 1], [1, 2, 3]);
        });
      });

      it("assertThrowsError fails when non-Error thrown", function () {
        assert.throwsError(function () {
          throw new TypeError("expected error thrown");
        });
      });

      it("assertThrowsTypeError fails when non-TypeError thrown", function () {
        assert.throwsError("I am prepared", function () {
          assert.throwsTypeError("throws error", function () {
            throw new Error("wrong error thrown!");
          });
        });
      });

      it("assertThrowsTypeError fails when non-ReferenceError thrown", function () {
        assert.throwsError(function () {
          assert.throwsReferenceError(function () {
            throw new TypeError("wrong error thrown!");
          });
        });
      });

      it("assertThrowsRangeError fails when non-RangeError thrown", function () {
        assert.throwsError(function () {
          assert.throwsRangeError(function () {
            throw new Error("wrong error thrown!");
          });
        });
      });
    });

  })();

}
