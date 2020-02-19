/*
 * Drop-in replacement for Logger.log that uses a spreadsheet backend instead.
 * Copyrite Adam Morris classroomtechtools.ctt@gmail.com
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 * To use:
   // Copy and paste code into project. (Why not make it a proper library? Because to make it a drop-in replacement, needs to have access to global scope, which a library doesn't)
   ReplaceLogger()
   // use Logger.log as normal
   Logger.log('Outputs to spreadsheet');
   // use Logger as a string literal template
   Logger`Outputs to spreadsheet`;
   // objects passed to Logger.log are pretty printed
   Logger.log({hi: 'hi', arr: ['wow', 234343]});
   // optionally, use Logger as template tag
   const where = 'spreadsheet';
   Logger`this will also output to ${where}`;

 */

(function (__g__) {

  class SS {
    constructor (id=null, sheetName) {
      this.id = id;
      this.sheetName = sheetName;
      this.spreadsheet = null;
      if (this.id === null)
        this.create();
      else
        this.open();
    }
    
    create() {
      const [rows, cols] = [3, 2];
      this.spreadsheet = SpreadsheetApp.create('Logger', rows, cols);
      this.sheet = this.spreadsheet.getSheetByName(this.sheetName);
      this.id = this.spreadsheet.getId();
      this.sheet.getRange(1, 1, 1, 2).setValues([['Output', 'Date']]);
    }
    
    open() {
      this.spreadsheet = SpreadsheetApp.openById(this.id);
      this.sheet = this.spreadsheet.getSheetByName(this.sheetName);
      this.id = this.spreadsheet.getId();
    }
    
    prepend(text) {
      const data = [
        [JSON.stringify(text, null, 4), (new Date()).toISOString()]
      ];
      this.sheet.insertRowsAfter(1, data.length);
      this.sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    }
    
    get url () {
      return this.spreadsheet.getUrl();
    }
    
  }

  let ssObj = null;
  const state = {};
  
  const __Logger__ = __g__.Logger;

  Logger_ = function (strings, ...values) {
    const text = strings.map( (string, index) => `${string}${values[index] ? values[index] : ''}` );
    ssObj.prepend(text.join(''));
  };
  Logger_.log = function (text) {
    ssObj.prepend(text);
  };
  
  __g__.ReplaceLogger = function (config={}) {
    [state.id = null, state.sheet = 'Sheet1'] = [config.id, config.sheet];
    
    if (state.id === null) {
      // pull in from properties, if avialable, remains null if not
      const props = PropertiesService.getUserProperties();
      state.id = props.getProperty('__getLogger__.id');      
    }

    // either opens existing or creates new
    ssObj = new SS(state.id, state.sheet);

    if (state.id === null) {
      state.id = ssObj.id;
      const props = PropertiesService.getUserProperties();
      props.setProperty('__getLogger__.id', state.id);
    }

    // Output with link
    Logger.log("Find logs at the following url:");
    Logger.log(`\n${ssObj.url}\n`);
    __g__.Logger = Logger_;
  };
  
  __g__.UnreplaceLogger = function () {
    __g__.Logger = __Logger__;
  };
})(this);
