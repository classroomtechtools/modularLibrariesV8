function test_Properties() {
  UnitTesting.init();
  FormatLogger.init();

  describe("initializaion via static methods", function () {

    it("initialize via three modes: script, user, and document stores", function () {
      var actual;
      actual = Properties.userStore();
      assert.notUndefined({actual: actual});
      actual = Properties.documentStore();
      assert.notUndefined({actual: actual});
      actual = Properties.scriptStore();
      assert.notUndefined({actual: actual});
    });

    it("utils.serialize and utils.deseralize persists dates correctly", function () {
      const expected = {date: new Date()};
      const serialized = Properties.utils.serialize(expected);
      const actual = Properties.utils.deserialize(serialized);
      assert.objectEquals({actual: actual, expected: expected});
    });

  });

  describe("getting and setting values", function () {

    it("get and set persists jsons by default", function () {
      const lib = Properties.scriptStore(/* no params */);
      const expected = {key: 'value'};
      lib.set('key', expected);
      const actual = lib.get('key');
      assert.objectEquals({actual: actual, expected: expected});
    });

    it("get and set persists strings with jsons = false", function () {
      const lib = Properties.scriptStore({jsons:false});
      const expected = 'string';
      lib.set('key', expected);
      const actual = lib.get('key');
      assert.equals({actual: actual, expected: expected});
    });

    it("trying to persist non-strings with jsons = false throws error", function () {
      const lib = Properties.scriptStore({jsons:false});
      const expected = {obj:'obj'};
      lib.remove('key');
      assert.throwsTypeError(_ => lib.set('key', expected));
      const actual = lib.get('key');
      assert.null_({actual: actual});
    });

    it(".setProperties with an nested object with nested arrays, primitives, objects, and dates, and persists", function () {
      const lib = Properties.scriptStore({});
      const expected = {arr: [1, 2, 4.3343433, "five"], obj: {prop:'prop', date: new Date()}};
      lib.removeAll();
      lib.setProperties(expected);
      const keys = lib.getKeys();
      var actual = {};
      for (let key of keys) {
        actual[key] = lib.get(key);
      }
      assert.objectEquals({actual: actual, expected:expected});
    });

  });



}

