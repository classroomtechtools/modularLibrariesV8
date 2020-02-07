(function (__g__) {
  // private stuff
  const _settings_ = Symbol('settings');

  let parseSettings = function (opt) {
    opt = opt || {};
    opt.param = opt.param || null;
    opt.enter = opt.enter || function () {};
    opt.exit = opt.exit || function () {};
    opt.error = opt.error || function () {};
    opt.proxy = opt.proxy || false;
    return opt;
  }

  class ContextManager {

    constructor () {
      // default settings
      this[_settings_] = parseSettings();
    }

    get settings () {
      return this[_settings_];
    }

    set enter (func) {
      this[_settings_].enter = func;
    }

    set exit (func) {
      this[_settings_].exit = func;
    }

    set error (func) {
      this[_settings_].error = func;
    }

    set param (obj) {
      this[_settings_].param = obj;
    }

    defaultObject () {
      return {};
    }

    with (func) {
      var param, result;

      // Create the obj that can be used as `this` throughout
      let obj = this.defaultObject();
      this[_settings_].enter = this[_settings_].enter.bind(obj);
      this[_settings_].exit = this[_settings_].exit.bind(obj);
      this[_settings_].error = this[_settings_].error.bind(obj);
      func = func.bind(obj);

      // get the parameter
      param = this[_settings_].param;

      // execute the enter function
      this[_settings_].enter();

      try {

        // bind it so we can access via `this`        // execute the body
        result = func(param);

      } catch (err) {
        // execute the error handler
        // error handler can return null to indicate it should be swallowed
        let swallow = this[_settings_].error(err) === null;

        // if error happened, call error function
        // if it returns null swallow it, otherwise reraise
        if (!swallow)
          throw (err);

      } finally {

        // execute the exit
        this[_settings_].exit();
      }

      return result;
    }
  }

  // export
  __g__.ContextManager = ContextManager;
})(this);
