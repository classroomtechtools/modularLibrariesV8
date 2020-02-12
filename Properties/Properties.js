(function(__g__) {

  const _config_ = Symbol('config');
  function configure(config) {
    config = config || {jsons:true};
    config.jsons = config.jsons == undefined ? true : config.jsons;
    config.dates = config.dates == undefined ? false : config.dates;
    if (config.dates && !config.jsons) throw Error("jsons needs to be true for dates: true to be meaningful");
    if (Object.keys(config).length > 2) throw Error(`Unknown property: ${Object.keys(config)}`);
    return config;
  }

  class Utils {

    constructor (dates=true) {
      this.dates = dates;
    }

    static isSerializedDate(dateValue) {
      // Dates are serialized in TZ format, example: '1981-12-20T04:00:14.000Z'.
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      return Utils.isString(dateValue) && datePattern.test(dateValue);
    }

    static isString(value) {
      return typeof value === 'string' || value instanceof String;
    }

    static dateReviver(key, value) {
      if (Utils.isSerializedDate(value)) {
        return new Date(value);
      }
      return value;
    }

    static dateReplacer(key, value) {
      if (value instanceof Date) {
        const timezoneOffsetInHours = -(this.getTimezoneOffset() / 60); //UTC minus local time
        const sign = timezoneOffsetInHours >= 0 ? '+' : '-';
        const leadingZero = (Math.abs(timezoneOffsetInHours) < 10) ? '0' : '';

        //It's a bit unfortunate that we need to construct a new Date instance
        //(we don't want _this_ Date instance to be modified)
        let correctedDate = new Date(this.getFullYear(), this.getMonth(),
            this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(),
            this.getMilliseconds());
        correctedDate.setHours(this.getHours() + timezoneOffsetInHours);
        const iso = correctedDate.toISOString().replace('Z', '');

        return iso + sign + leadingZero + Math.abs(timezoneOffsetInHours).toString() + ':00';
      }
      return value;
    }

    static serialize(value, dates=true) {
      /*
      if (dates)
        return JSON.stringify(value, Utils.dateReplacer);  // replacer not strictly required and is faster without
      */
      return JSON.stringify(value);
    }

    static deserialize(value, dates=true) {
      if (dates)
        return JSON.parse(value, Utils.dateReviver);
      return JSON.parse(value);
    }

  }

  class Properties {

    constructor (instance, config) {
      this[_config_] = configure(config);
      this.instance = instance;
    }

    static scriptStore (config={}) {
      return new Properties(PropertiesService.getScriptProperties(), config);
    }

    static documentStore (config={}) {
      return new Properties(PropertiesService.getDocumentProperties(), config);
    }

    static userStore (config={}) {
      return new Properties(PropertiesService.getUserProperties(), config);
    }

    static get utils () {
      // return serialiser who knows what to do with dates, if on
      return Utils;
    }

    set (key, value) {
      if (this[_config_].jsons) value = Properties.utils.serialize(value, this[_config_].dates);
      else if (typeof value !== 'string') throw TypeError("non-string passed, turn on jsons?");
      return this.instance.setProperty(key, value);
    }

    get (key) {
      let value = this.instance.getProperty(key);
      if (value === null || value === undefined) return null;  // always return null when not present (or undefined?)
      if (this[_config_].jsons) {
        value = Properties.utils.deserialize(value, this[_config_].dates);
      }
      return value;
    }

    getKeys () {
      return this.instance.getKeys();
    }

    getAll () {
      const keys = this.getKeys();
      let properties = {};
      for (let key of keys) {
        properties[key] = this.get(key);
      }
      return properties;
    }

    setProperties (properties) {
      // make a copy of properties
      var copied = {};
      if (this[_config_].jsons) {
        for (let key in properties) {
          copied[key] = Properties.utils.serialize(properties[key], this[_config_].dates);
        }
      }
      return this.instance.setProperties(copied);
    }

    remove (key) {
      return this.instance.deleteProperty(key);
    }

    removeAll () {
      return this.instance.deleteAllProperties();
    }

  }

  __g__.Properties = Properties;

})(this);

