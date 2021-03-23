/**
 * Name: KenSoni
 * Author: KenSoni (ngvcanh)
 * Repository: https://github.com/ngvcanh/kensoni.git
 * Version: 0.0.1
 * 
 * Inspiration from jQuery:
 * https://jquery.com/
 * 
 * Compress and Decompress by LZW:
 * http://rosettacode.org/wiki/LZW_compression
 */

function KenSoni(selector){
  return new KenSoni.fn.init(selector);
};

KenSoni.fn = KenSoni.prototype = {

  constructor: KenSoni,

  length: 0

};

var KenSoniInit = KenSoni.fn.init = function(selector){
  var selectors = [], me = this;
  this.constructor = KenSoni;

  if (selector instanceof Document || selector instanceof HTMLElement || selector instanceof Node){
    selectors.push(selector);
  }
  else if (selector instanceof NodeList || selector instanceof HTMLCollection){
    selectors = Array.from(selector);
  }
  else if (typeof selector === 'string' && selector.length){
    selectors = Array.from(document.querySelectorAll(selector));
  }

  KenSoni.each(selectors, function(i){
    me[i] = this;
  });

  this.length = selectors.length;
  return this;
};

KenSoniInit.prototype = KenSoni.fn;

var KenSoniExtends = {
  isUndefined: function(obj){
    return typeof obj === 'undefined';
  },

  isArray: function(obj){
    return Array.isArray(obj);
  },

  isFunction: function(obj){
    return typeof obj === 'function';
  },

  isString: function(obj){
    return typeof obj === 'string' || obj instanceof String;
  },

  isNumber: function(obj){
    return !isNaN(obj);
  },

  isNull: function(obj){
    return obj === null;
  },

  isObject: function(obj){
    return typeof obj === 'object' && !this.isArray(obj) && !this.isNull(obj)
  },

  isEmpty: function(obj){
    switch(typeof obj){
      case 'string': return !obj.length;
      case 'bigint':
      case 'number': return obj === 0;
      case 'function': return false;
      case 'undefined': return true;
      case 'boolean': return !obj;
    }
  
    if (this.isArray(obj)) return !obj.length;
    if (this.isNull(obj)) return true;
  
    for (var _name in obj){
      return false;
    }
  
    return true;
  },

  inArray: function(element, arr){
    if (!this.isArray(arr)) return false;
    return arr.indexOf(element) > -1;
  },

  toString: function(obj){
    if (this.isString(obj)){
      return obj.toString(obj);
    }
    if (this.isArray(obj)){
      return obj.join();
    }
    if (this.isNumber(obj) && !this.isNull(obj)){
      return obj.toString()
    }
    
    return typeof obj;
  },

  queryToJson: function(queryString){
    if (!this.isString(queryString)) return queryString;
    var result = [];
  
    queryString.replace(/^\?/g, '').replace(/"/g, '\\"').split('&').map(function(param){
      var arr = param.split('='), param = arr.shift(), value = decodeURIComponent(arr.join('='));
      if (this.isEmpty(param)) return;
  
      param = param.replace(/\[/g, '":{"').replace(/\]/g, '').replace(/{"":/g, '[').replace(/{"$/g, '[');
      param += param.match(/\[$/g) ? '"' + value + '"]' : '":"' + value + '"}';
      var pos = 0, i = length = param.length, closeEnd = '';
  
      for(;i > 0;){
        var char = param[i--];
        this.inArray(char, ['{', '[']) && !this.isEmpty(pos++) && (closeEnd += char === '{' ? '}' : ']')
      }
  
      this.isEmpty(pos) && (param = param.replace(/}$/g, ''));
      param += closeEnd;
      result.push('"' + param);
    });
  
    return JSON.parse('{' + result.join(',') + '}');
  },
  
  each: function(obj, callback){
    if (!this.isFunction(callback)) return obj;
    var length, i = 0;

    if (this.isArray(obj) || obj instanceof KenSoni){
      length = obj.length;
      for (; i < length; ++i){
        if (callback.call(obj[i], i, obj[i], obj) === false){
          break;
        }
      }
    }
    else{
      for (i in obj){
        if (callback.call(obj[i], i, obj[i], obj) === false){
          break;
        }
      }
    }

    return obj;
  },

  makeSlug: function(str){
    if (!str) return '';
    
    str += '';
    str = str.toLowerCase();

    var slugChar = {
      a: /á|à|ả|ã|ạ|ă|ắ|ằ|ẵ|ẳ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi,
      d: /đ|Đ/gi,
      e: /é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi,
      i: /í|ì|ỉ|ĩ|ị/gi,
      o: /ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ợ|ỡ/gi,
      u: /ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi,
      y: /ý|ỳ|ỷ|ỹ|ỵ/gi,
      '-': /\s+/gi
    }

    Object.keys(slugChar).map(function(char){
      str = str.replace(slugChar[char], char);
    });

    return str.replace(/[^a-z\d\-]/gi, '').replace(/^\-+/gi, '').replace(/\-+$/gi, '');
  },

  addEventListener: function(obj, eventName, callback){
    if (!obj) return this;
    this.removeEventListener(obj, eventName, callback);

    if (this.isFunction(obj.addEventListener)){
      obj.addEventListener(eventName, callback);
    }
    else if (this.isFunction(obj.attachEvent)){
      obj.attachEvent('on' + eventName, callback);
    }
    else{
      obj['on' + eventName] = callback;
    }

    return this;
  },

  removeEventListener: function(obj, eventName, callback){
    if (!obj) return this;
    
    if (this.isFunction(obj.removeEventListener)){
      obj.removeEventListener(eventName, callback);
    }
    else if (this.isFunction(obj.detachEvent)){
      obj.detachEvent('on' + eventName, callback);
    }
    else{
      obj['on' + eventName] = null;
    }

    return this;
  },

  createXhr: function(){
    return 'XMLHttpRequest' in window ? new XMLHttpRequest : new ActiveXObject('Microsoft.XMLHTTP');
  },

  ajax: function(params){
    if (!this.isObject(params) || this.isEmpty(params)) return;
  
    var url = params.url || location.href || ''
    , method = params.method || 'GET'
    , data = params.data
    , username = params.username
    , password = params.password
    , headers = params.headers
    , beforeSend = this.isFunction(params.beforeSend) ? params.beforeSend : function(){}
    , success = this.isFunction(params.success) ? params.success : function() {}
    , error = this.isFunction(params.error) ? params.error : function(){}
    , done = this.isFunction(params.done) ? params.done : function(){}
    , abort = this.isFunction(params.abort) ? params.abort : function(){}
    , progress = this.isFunction(params.progress) ? params.progress : function(){}
    , xhr = this.createXhr();

    xhr.onreadystatechange = function(){
      this.readyState === 4 && (xhr.status === 200 ? 
      success(this.response, this) : error(this));
    };

    xhr.addEventListener('load', done);
    xhr.addEventListener('error', error);
    xhr.addEventListener('abort', abort);
    xhr.addEventListener('progress', progress);

    xhr.open(method, url, true, username, password);
    beforeSend(xhr, data);
    
    if (this.isObject(headers)){
      for (var key in headers) xhr.setRequestHeader(key, headers[key]);
    } 
    
    beforeSend(xhr, data) === false ? xhr.abort() : xhr.send(data);
  },

  compress: function(uncompressed){
    uncompressed = JSON.stringify(uncompressed);

    var i = 0, dictionary = {}, c, wc, w = '', result = [], dictSize = 256;
    for (;i < 256;) dictionary[String.fromCharCode(i)] = i++;

    for (i = 0; i < uncompressed.length;){
      c = uncompressed.charAt(i++);
      wc = w + c;

      if (dictionary.hasOwnProperty(wc)){
        w = wc;
      } 
      else{
        result.push(dictionary[w]);
        dictionary[wc] = dictSize++;
        w = String(c);
      }
    }

    w === '' || result.push(dictionary[w]);
    return result;
  },


  decompress: function(compressed){
    var i = 0, dictionary = [], w, result, k, entry = "", dictSize = 256;
    for (;i < 256;) dictionary[i] = String.fromCharCode(i++);

    w = String.fromCharCode(compressed[0]);
    result = w;
      
    for (i = 1; i < compressed.length;){
      k = compressed[i++];
      
      if (dictionary[k]){
        entry = dictionary[k];
      } 
      else if (k === dictSize){
          entry = w + w.charAt(0);
      } 
      else {
        return null;
      }

      result += entry;
      dictionary[dictSize++] = w + entry.charAt(0);
      w = entry;
    }
    
    return result;
  }
};

Object.assign(KenSoni, KenSoniExtends);
Object.assign(KenSoni.fn, KenSoniExtends);

KenSoni.fn.each = function(callback){
  return KenSoni.each(this, callback);
};

KenSoni.fn.find = function(selector){
  var selectors = [], me = this;

  if (this.isString(selector) && selector.length){
    me.each(function(){
      if (me.isFunction(this.querySelectorAll)){
        selectors = selectors.concat(Array.from(this.querySelectorAll(me.toString(selector))));
      }
    });
  
    KenSoni.each(selectors, function(i){
      me[i] = this;
    });
  }
  
  me.length = selectors.length;
  return me;
};

KenSoni.fn.hasClass = function(className){
  className = this.toString(className);
  var i = 0;

  while((el = this[i++])){
    if (el.classList && el.classList.contains(className)){
      return true;
    }
  }

  return false;
};

KenSoni.fn.addClass = function(className){
  if (this.isFunction(className)){
    return this.each(function(i){
      KenSoni(this).addClass(className.call(this, i, this.className || ''));
    });
  }

  className = this.isArray(className) ? className : this.toString(className).split(' ');

  if (className.length){
    var i = 0, j;
    while((el = this[i++])){
      if (el.classList){
        j = 0;
        while((classes = className[j++])){
          classes.length && !el.classList.contains(classes) && el.classList.add(classes);
        }
      }
    }
  }

  return this;
};

KenSoni.fn.removeClass = function(className){
  if (this.isFunction(className)){
    return this.each(function(i){
      KenSoni(this).removeClass(className.call(this, i, this.className || ''));
    });
  }

  className = this.isArray(className) ? className : this.toString(className).split(' ');

  if (className.length){
    var i = 0, j;
    while((el = this[i++])){
      if (el.classList){
        j = 0;
        while((classes = className[j++])){
          classes.length && el.classList.contains(classes) && el.classList.remove(classes);
        }
      }
    }
  }

  return this;
};

KenSoni.fn.toggleClass = function(className, state){
  var isClasses = this.isString(className) || this.isArray(className);

  if (isClasses && typeof state === 'boolean'){
    return state ? this.addClass(className) : this.removeClass(className);
  }

  if (this.isFunction(className)){
    return this.each(function(i){
      KenSoni(this).toggleClass(className.call(this, i, this.className || ''), state);
    });
  }

  return this.each(function(){
    if (isClasses){
      className = this.isArray(className) ? className : this.toString(className).split(' ');
      var i = 0, self = KenSoni(this);

      while((classes = className[i++])){
        self.hasClass(classes) ? self.removeClass(classes) : self.addClass(classes);
      }
    }
  });
};

KenSoni.fn.addEventListener = function(eventName, callback){
  this.each(function(){
    KenSoni.addEventListener(this, eventName, callback);
  });

  return this;
};

KenSoni.fn.removeEventListener = function(eventName, callback){
  this.each(function(){
    KenSoni.removeEventListener(this, eventName, callback);
  });

  return this;
};

KenSoni.fn.filter = function(callback){
  var i = 0,  result = KenSoni();
  
  this.each(function(index){
    (!KenSoni.isFunction(callback) || callback.call(this, index)) && (result[i++] = this);
  });

  result.length = i;
  return result;
};

KenSoni.fn.attr = function(name, value = undefined){
  if (this.isUndefined(value)){
    var result = null;

    this.each(function(){
      var val = KenSoni.isFunction(this.getAttribute) ? this.getAttribute(name) || null : null;
      KenSoni.isNull(val) || (result = val);
    });

    if (this.isNull(result)) return null;

    if (!isNaN(+result)){
      result = +result;
    }
    else if (this.inArray(result.toLowerCase(), [ 'true', 'false' ])){
      result = (result.toLowerCase() === 'true');
    }
    else{
      var oldResult = result;

      try{
        result = JSON.parse(result);
      }
      catch(e){
        result = oldResult;
      }
    }

    return result;
  }
  else if (this.isNull(value)){
    this.each(function(){
      if (KenSoni.isFunction(this.hasAttribute)){
        this.hasAttribute(name) && this.removeAttribute(name);
      }
      else if (name in this){
        delete this[name];
      }
    });
  }
  else{
    this.each(function(){
      KenSoni.isFunction(this.setAttribute) ? this.setAttribute(name, value) : this[name] = value;
    });
  }

  return this;
};

KenSoni.fn.prop = function(name, value){
  if (value === undefined){
    var result = null;

    this.each(function(){
      if (name in this) result = this[name];
    });

    return result;
  }
  else{
    return this.each(function(){
      this[name] = value;
    });
  }
};

KenSoni.fn.val = function(value){
  if (this.isUndefined(value)){
    var val = '';
    this.each(function(){
      val = this.val;
    });
    return val;
  }
  else{
    this.each(function(){
      this.value = value;
    });
  }
  return this;
};

KenSoni.fn.Slug = function(){
  var callback = function(){
    var target = KenSoni(this).attr('ks-slug')
    , slug = KenSoni.makeSlug(this.value);

    if (target === '_self'){
      this.value = slug;
    }
    else{
      KenSoni(target).val(slug);
    }
  };

  this.each(function(){
    var target = KenSoni(this).attr('ks-slug');
    this.addEventListener('change', callback);

    if (target !== '_self'){
      this.addEventListener('keyup', callback);
      this.addEventListener('paste', callback);
    }
  });
};

KenSoni.fn.Summernote = function(options){
  options = options || {};
  Object.assign(options, {
    onImageUpload: function(file, editor, welEditable){
      var data = new FormData;
      data.append('file', file);
    }
  });

  this.each(function(){
    $(this).summernote({
      
    });
  });
};

KenSoni.KSGallery = KenSoni.KSGallery || {};
KenSoni.KSGallery.Opener = {};
KenSoni.KSGallery.ReceiveListened = false;

KenSoni.KSGallery.ReceivedData = function(){
  if (KenSoni.KSGallery.ReceiveListened) return;
  KenSoni.KSGallery.ReceiveListened = true;

  window.addEventListener('message', function(ev){
    var ksgData = ev.data;
    if (!('type' in ksgData) || typeof ksgData.type !== 'string' || !ksgData.type.match(/^KENSONI_GALLERY_.+/g)) return;

    var i = ksgData.query.i;

    if (ksgData.type === 'KENSONI_GALLERY_INSERT_AND_CLOSE'){
      if (typeof i !== 'string') return;
      var id = KenSoni('[ksgallery-id="' + i + '"]').attr('ksg-target');
      id && typeof id === 'string' && KenSoni('#' + id).val(ksgData.chose);
    }

    if (i && KenSoni.KSGallery.Opener[i]){
      KenSoni.KSGallery.Opener[i].close();
      delete KenSoni.KSGallery.Opener[i];
    }
  });
}

KenSoni.fn.gallery = function(){

  this.each(function(){
    this.setAttribute('ksgallery-id', (Math.random() + new Date().getTime()).toFixed(0));
  });

  var self = this;

  this.addEventListener('click', function(){
    var id = KenSoni(this).attr('ksgallery-id');
console.log(KenSoni.KSGallery);
    if (KenSoni.KSGallery.Opener[id] && !KenSoni.KSGallery.Opener[id].closed){
      KenSoni.KSGallery.Opener[id].focus();
    }
    else{
      var type = self.attr('ksg-type') || '';
      var url = KenSoni.KSGallery.Config.PluginPath + '?t=' + type + '&i=' + id;
      KenSoni.KSGallery.Opener[id] = window.open(url, '_blank', KenSoni.KSGallery.getToolbars().join(','));
    }
  });

  KenSoni.KSGallery.ReceivedData();
};

KenSoni.Summernote = function KenSoniSummernote(){};

KenSoni.Summernote.prototype.name = 'ksgallery';

KenSoni.Summernote.prototype.buttonLabel = '<i class="fa fa-file-image-o"></i>';

KenSoni.Summernote.prototype.tooltip = 'KSGallery';

KenSoni.Summernote.prototype.saveLastFocusedElement = function(context){
  var focused_element = window.getSelection().focusNode;
  var parent = $(context.layoutInfo.editable).get(0);
  if ($.contains(parent, focused_element)) {
    $(context.layoutInfo.note).data('last_focused_element', focused_element)
  }
}

KenSoni.Summernote.prototype.getPlugin = function(){
  var kensoni_summernote_plugin = {};
  var _this = this;

  kensoni_summernote_plugin[this.name] = function(context){
    context.memo('button.' + _this.name, _this.createButton());
    this.events = {
      'summernote.keyup': function(we, e){
        _this.saveLastFocusedElement(context);
      }
    }
    this.initialize = function(){

    };
  };

  return kensoni_summernote_plugin;
};

KenSoni.Summernote.prototype.openGallery = function(){

};

KenSoni.Summernote.prototype.createButton = function(){
  var _this = this;
  var button = $.summernote.ui.button({
    contents: this.buttonLabel,
    tooltip: this.tooltip,
    click: function() {
      _this.openGallery();
    }
  });

  return button.render();
}

KenSoni.summernoteGallery = function(){
  //$.extend($.summernote.plugins, new KenSoni.Summernote().getPlugin());
};

KenSoni.ValidateAttribute = function KenSoniValidateAttribute(KS, options){
  return new KenSoni.ValidateAttribute.fn.init(KS, options);
};

KenSoni.fn.validateAttribute = function(options){
  return KenSoni.ValidateAttribute(this, options).listen();
}

KenSoni.ValidateAttribute.ATTRS = {
  ACTION: 'action',
  ELEMENT: 'element',
  EMPTY: 'empty',
  EMPTYMSG: 'empty-msg',
  ENCTYPE: 'enctype',
  EXTS: 'exts',
  EXTSMSG: 'exts-msg',
  IN: 'in',
  INMSG: 'in-msg',
  INTMSG: 'int-msg',
  MAPCHECKED: 'map-checked',
  MAX: 'max',
  MAXMSG: 'max-msg',
  MAXSIZE: 'max-size',
  MAXSIZEMSG: 'max-size-msg',
  METHOD: 'method',
  MIMES: 'mimes',
  MIMESMSG: 'mimes-msg',
  MIN: 'min',
  MINMSG: 'min-msg',
  MINSIZE: 'min-size',
  MINSIZEMSG: 'min-size-msg',
  NAME: 'name',
  NOTIN: 'notin',
  NOTINMSG: 'notin-msg',
  REGEX: 'regex',
  REGEXMSG: 'regex-msg',
  RMAX: 'rmax',
  RMAXMSG: 'rmax-msg',
  RMAXSIZE: 'rmax-size',
  RMAXSIZEMSG: 'rmax-size-msg',
  RMIN: 'rmin',
  RMINMSG: 'rmin-msg',
  RMINSIZE: 'rmin-size',
  RMINSIZEMSG: 'rmin-size-msg',
  SEND: 'send',
  TYPE: 'type',
  TYPEMSG: 'type-msg',
  VALUEAT: 'value-at'
};

KenSoni.ValidateAttribute.TYPES = {
  CHECKED: 'checked',
  EMAIL: 'email',
  INTEGER: 'integer',
  MCHECKED: 'mchecked',
  NUMBER: 'number',
  STRING: 'string',
  FILE: 'file'
};

KenSoni.ValidateAttribute.CODES = {
  EMPTY: 'KSVA_EMPTY',
  IN: 'KSVA_IN',
  INTEGER: 'KSVA_INTEGER_TYPE',
  MAX: 'KSVA_MAX',
  MIN: 'KSVA_MIN',
  NUMBER: 'KSVA_NUMBER_TYPE',
  NOTIN: 'KSVA_NOT_IN',
  REGEX: 'KSVA_REGEX',
  RMAX: 'KSVA_RATHER_MAX',
  RMIN: 'KSVA_RATHER_MIN',
  SAME: 'KSVA_SAME',
  TYPE: 'KSVA_TYPE'
};

KenSoni.ValidateAttribute.VALUEAT = {
  FILE: 'file',
  HTML: 'html',
  MAPELEMENT: 'map-element',
  TEXT: 'text',
  VALUE: 'value'
};

KenSoni.ValidateAttribute.RULENAMES = [
  'Empty',
  'Number',
  'Integer',
  'Regex',
  'Min',
  'RatherMin',
  'Max',
  'RatherMax',
  'In',
  'NotIn',
  'Same'
];

KenSoni.ValidateAttribute.fn = KenSoni.ValidateAttribute.prototype = {

  constructor: KenSoni.ValidateAttribute,

  KenSoni: KenSoni,

  events: {},

  options: {},

  section: null,

  elements: {},

  element: null

};

var KenSoniInitValidateAttribute = KenSoni.ValidateAttribute.fn.init = function(KS, options){
  if (KS instanceof KenSoni){
    this.KenSoni = KS;
  }
  else if (typeof KS === 'object'){
    this.KenSoni = KenSoni();
    options = KS;
  }
  else if (typeof KS === 'string'){
    this.KenSoni = KenSoni(KS);
  }
  
  this.options = {
    ajax: true,
    method: 'GET',
    prefix: 'ksva',
    removeSubmit: true,
    enctype: 'multipart/form-data'
  };

  Object.assign(this.options, options);

  this.events = {
    BeforeValidate: function(){},
    ElementInvalid: function(){},
    ValidateInvalid: function(){},
    ValidateSuccess: function(){},
    BeforeSend: function(){},
    AjaxError: function(){},
    AjaxSuccess: function(){},
    Done: function(){}
  };

  this.section = null;
  this.elements = {};
  this.element = null;
};

KenSoniInitValidateAttribute.prototype = KenSoni.ValidateAttribute.fn;

KenSoni.ValidateAttribute.fn.on = function(name, callback){
  KenSoni.isString(name) && KenSoni.isFunction(callback) && 
  name in this.events && (this.events[name] = callback);
  return this;
};

KenSoni.ValidateAttribute.fn.ruleEmpty = function(){
  var value = this.attr(KenSoni.ValidateAttribute.ATTRS.EMPTY);
  var validate = (value === false);

  value = !validate;

  var valElement = this.val();
  var valid = (!validate || value) || !!valElement && (valElement instanceof File || !!valElement.length);

  return {
    validate, value, valid, 
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    code: KenSoni.ValidateAttribute.CODES.EMPTY,
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.EMPTYMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleNumber = function(){
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var validate = type === KenSoni.ValidateAttribute.TYPES.NUMBER;
  var valid = !validate || !!this.val().match(/^[\+\-]?(0|([1-9]\d*))(\.\d+)?$/g);
  
  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value: null, valid,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    code: KenSoni.ValidateAttribute.CODES.TYPE,
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPEMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleInteger = function(){
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var validate = type === KenSoni.ValidateAttribute.TYPES.INTEGER;
  var valid = !validate || !!this.val().match(/^[\+\-]?(0|([1-9]\d*))$/g);

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;
  
  return {
    validate, value: null, valid,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    code: KenSoni.ValidateAttribute.CODES.INTEGER,
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.INTMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleRegex = function(){
  var regex = this.attr(KenSoni.ValidateAttribute.ATTRS.REGEX);
  var validate = KenSoni.isArray(regex);
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var self = this;

  if (type === KenSoni.ValidateAttribute.TYPES.EMAIL){
    validate = true;
    regex = [ "^[a-zA-Z\\d\\-_]+@([a-zA-Z\\d\\-_]+\\.){1,2}[a-zA-Z]{2,}$" ];
  }

  var valid = !validate || !regex.length || !!regex.filter(function(reg){
    return self.val().match(new RegExp(reg));
  }).length;

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value: regex, valid,
    code: KenSoni.ValidateAttribute.CODES.REGEX,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.REGEXMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleMin = function(){
  var minValue = this.attr(KenSoni.ValidateAttribute.ATTRS.MIN);
  var validate = !KenSoni.isNull(minValue) && KenSoni.isNumber(minValue);
  var value = validate? +minValue : null;
  var valid = !validate || KenSoni.isNull(value);
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var elValue = this.val();

  if (type === KenSoni.ValidateAttribute.TYPES.INTEGER){
    type = KenSoni.ValidateAttribute.TYPES.NUMBER;
  }

  if (type === KenSoni.ValidateAttribute.TYPES.STRING){
    valid = valid || elValue.length >= value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.NUMBER){
    valid = valid || +elValue >= value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.FILE){
    if (elValue instanceof FileList || elValue instanceof File){
      valid = valid || elValue instanceof FileList ? elValue.length : 1 >= value;
    }
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.CHECKED){
    var name = this.attr(KenSoni.ValidateAttribute.ATTRS.NAME);

    if (!name.match(/\[\]$/g)){
      value = 1;
      validate = minValue === '' || +minValue > 0;
      valid = !validate || KenSoni.isNull(value);
    }

    var checked = this.elements[name].filter(function(elParam){
      return elParam.element.checked;
    });

    valid = valid || checked.length >= value;
  }

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.MIN,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.MINMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleRatherMin = function(){
  var minValue = this.attr(KenSoni.ValidateAttribute.ATTRS.RMIN);
  var validate = !KenSoni.isNull(minValue) && KenSoni.isNumber(minValue);
  var value = validate? +minValue : null;
  var valid = !validate || KenSoni.isNull(value);
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var elValue = this.val();

  if (type === KenSoni.ValidateAttribute.TYPES.INTEGER){
    type = KenSoni.ValidateAttribute.TYPES.NUMBER;
  }

  if (type === KenSoni.ValidateAttribute.TYPES.STRING){
    valid = valid || elValue.length > value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.NUMBER){
    valid = valid || +elValue > value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.FILE){
    if (elValue instanceof FileList || elValue instanceof File){
      valid = valid || elValue instanceof FileList ? elValue.length : 1 > value;
    }
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.CHECKED){
    var name = this.attr(KenSoni.ValidateAttribute.ATTRS.NAME);

    if (!name.match(/\[\]$/g)){
      value = 1;
      validate = minValue === '' || +minValue > 0;
      valid = !validate || KenSoni.isNull(value);
    }

    var checked = this.elements[name].filter(function(elParam){
      return elParam.element.checked;
    });

    valid = valid || checked.length > value;
  }

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.RMIN,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.RMINMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleMax = function(){
  var maxValue = this.attr(KenSoni.ValidateAttribute.ATTRS.MAX);
  var validate = !KenSoni.isNull(maxValue) && KenSoni.isNumber(maxValue);
  var value = validate? +maxValue : null;
  var valid = !validate || KenSoni.isNull(value);
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var elValue = this.val();

  if (type === KenSoni.ValidateAttribute.TYPES.INTEGER){
    type = KenSoni.ValidateAttribute.TYPES.NUMBER;
  }

  if (type === KenSoni.ValidateAttribute.TYPES.STRING){
    valid = valid || elValue.length <= value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.NUMBER){
    valid = valid || +elValue <= value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.FILE){
    if (elValue instanceof FileList || elValue instanceof File){
      valid = valid || elValue instanceof FileList ? elValue.length : 1 <= value;
    }
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.CHECKED){
    var name = this.attr(KenSoni.ValidateAttribute.ATTRS.NAME);

    if (!name.match(/\[\]$/g)){
      value = 1;
      validate = maxValue === '' || +maxValue > 0;
      valid = !validate || KenSoni.isNull(value);
    }

    var checked = this.elements[name].filter(function(elParam){
      return elParam.element.checked;
    });

    valid = valid || checked.length <= value;
  }

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.MAX,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.MAXMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleRatherMax = function(){
  var maxValue = this.attr(KenSoni.ValidateAttribute.ATTRS.RMAX);
  var validate = !KenSoni.isNull(maxValue) && KenSoni.isNumber(maxValue);
  var value = validate? +maxValue : null;
  var valid = !validate || KenSoni.isNull(value);
  var type = this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE);
  var elValue = this.val();

  if (type === KenSoni.ValidateAttribute.TYPES.INTEGER){
    type = KenSoni.ValidateAttribute.TYPES.NUMBER;
  }

  if (type === KenSoni.ValidateAttribute.TYPES.STRING){
    valid = valid || elValue.length < value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.NUMBER){
    valid = valid || +elValue < value;
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.FILE){
    if (elValue instanceof FileList || elValue instanceof File){
      valid = valid || elValue instanceof FileList ? elValue.length : 1 < value;
    }
  }
  else if (type === KenSoni.ValidateAttribute.TYPES.CHECKED){
    var name = this.attr(KenSoni.ValidateAttribute.ATTRS.NAME);

    if (!name.match(/\[\]$/g)){
      value = 1;
      validate = maxValue === '' || +maxValue > 0;
      valid = !validate || KenSoni.isNull(value);
    }

    var checked = this.elements[name].filter(function(elParam){
      return elParam.element.checked;
    });

    valid = valid || checked.length < value;
  }

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.RMAX,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.TYPE),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.RMAXMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleIn = function(){
  var value = this.attr(KenSoni.ValidateAttribute.ATTRS.IN);
  var validate = !KenSoni.isNull(value);

  if (validate){
    try{
      value && (value = JSON.parse(value));
      value = KenSoni.isArray(value) ? value : [];
    }
    catch(e){
      value = [];
    }
  }

  var valid = !validate || !!~value.indexOf(this.val());

  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.IN,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.IN),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.INMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleNotIn = function(){
  var value = this.attr(KenSoni.ValidateAttribute.ATTRS.NOTIN);
  var validate = !KenSoni.isNull(value);

  if (validate){
    try{
      value && (value = JSON.parse(value));
      value = KenSoni.isArray(value) ? value : [];
    }
    catch(e){
      value = [];
    }
  }

  var valid = !validate || !~value.indexOf(this.val());
  if (this.ruleEmpty().value && this.val().length === 0) valid = true;

  return {
    validate, value, valid,
    code: KenSoni.ValidateAttribute.CODES.NOTIN,
    type: this.attr(KenSoni.ValidateAttribute.ATTRS.NOTIN),
    message: this.attr(KenSoni.ValidateAttribute.ATTRS.NOTINMSG)
  };
};

KenSoni.ValidateAttribute.fn.ruleSame = function(){
  return {
    validate: false,
    value: null,
    valid: true,
    code: KenSoni.ValidateAttribute.CODES.SAME,
    message: null
  };
};

KenSoni.ValidateAttribute.fn.getRules = function(){
  return [
    this.ruleEmpty(),
    this.ruleNumber(),
    this.ruleInteger(),
    this.ruleRegex(),
    this.ruleMin(),
    this.ruleRatherMin(),
    this.ruleMax(),
    this.ruleRatherMax(),
    this.ruleIn(),
    this.ruleNotIn(),
    this.ruleSame()
  ];
};

KenSoni.ValidateAttribute.fn.validator = function(){
  if (!this.element) return [];

  var mapChecked = this.attr(KenSoni.ValidateAttribute.ATTRS.MAPCHECKED);
  if (!KenSoni.isNull(mapChecked) && !KenSoni(mapChecked).prop('checked')) return [];
  
  return this.getRules();
};

KenSoni.ValidateAttribute.fn.attr = function(name, value = undefined){
  var isUn = KenSoni.isUndefined(value);
  if (!this.element) return isUn ? null : this;

  if (isUn){
    var el = KenSoni(this.element)
    , attr = el.attr(this.options.prefix + '-' + name);
    return KenSoni.isNull(attr) ? el.attr(name) : attr;
  }
  else{
    KenSoni(this.element).attr(name, value);
    return this;
  }
};

KenSoni.ValidateAttribute.fn.val = function(){
  if (!this.element) return '';

  var name = this.attr(KenSoni.ValidateAttribute.ATTRS.NAME);
  var isMulti = !!name.match(/\[\]$/g);

  if ('file' === this.element.type){
    return isMulti ? element.files : element.files[0];
  }

  var valueAt = this.attr(KenSoni.ValidateAttribute.ATTRS.VALUEAT);

  switch(valueAt){

    case KenSoni.ValidateAttribute.VALUEAT.TEXT:
      return 'innerText' in this.element ? this.element.innerText : '';

    case KenSoni.ValidateAttribute.VALUEAT.HTML:
      return 'innerHTML' in this.element ? this.element.innerHTML : '';

    case KenSoni.ValidateAttribute.VALUEAT.FILE:
      return 'files' in this.element ? this.element.files : new FileList;

    case KenSoni.ValidateAttribute.VALUEAT.MAPELEMENT:
      var selector = this.attr(KenSoni.ValidateAttribute.ATTRS.ELEMENT);
      if (!selector) return '';

      var elements = KenSoni(this.section).find(selector);
      if (!elements.length) return '';

      if (isMulti){
        var result = [];

        elements.each(function(){
          if ('file' === this.type){
            result = result.concat(Array.from(this.element.files));
          }
          else{
            result.push('value' in this ? this.value : this.innerHTML);
          }
        });

        return result;
      }
      else if ('file' === elements[0].type){
        return elements[0].files[0];
      }
      else{
        return 'value' in elements[0] ? elements[0].value : '';
      }

    default:
      return 'value' in this.element ? this.element.value : '';

  }
};

KenSoni.ValidateAttribute.fn.findElements = function(){
  var attrName = this.options.prefix + '-' + KenSoni.ValidateAttribute.ATTRS.NAME;
  return KenSoni(this.section).find('[name], [' + attrName + ']').filter(function(){
    return !!(KenSoni(this).attr(attrName) || KenSoni(this).attr('name'));
  });
};

KenSoni.ValidateAttribute.fn.appendElements = function(){
  var me = this;
  return this.findElements().each(function(){
    me.element = this;
    var name = me.attr(KenSoni.ValidateAttribute.ATTRS.NAME);
    name in me.elements || (me.elements[name] = []);
    
    me.elements[name].push({ 
      element: this, 
      value: me.val(), 
      validator: []
    });
  });
};

KenSoni.ValidateAttribute.fn.mapSend = function(callback){
  if (!KenSoni.isFunction(callback)) return;

  for (var name in this.elements){
    var lisElements = this.elements[name], numElement = lisElements.length, i = 0;

    for (;i < numElement;){
      var elements = lisElements[i++];
      this.element = elements.element;

      if (
        this.attr(KenSoni.ValidateAttribute.ATTRS.SEND) === false || 
        (KenSoni.inArray(this.element.type, ['checkbox', 'radio']) && 
        !KenSoni(this.element).prop('checked'))
      ) continue;

      callback(elements.value, name);
    }
  }
};

KenSoni.ValidateAttribute.fn.getData = function(){
  if (!this.section) return null;
  this.element = this.section;
  
  var type =this.attr(KenSoni.ValidateAttribute.ATTRS.ENCTYPE) || this.options.enctype;
  KenSoni.isString(type) || (type = 'multipart/form-data');

  if (type.match(/^application\/json(\s*;.*)?/gi)){
    this.options.enctype = 'application/json';
    return this.getDataAsJson()
  }
  
  if (type.match(/^application\/x\-www\-form\-urlencoded(\s*;.*)?/gi)){
    this.options.enctype = 'application/x-www-form-urlencoded';
    return this.getDataAsUrlEncoded()
  }

  this.options.enctype = 'multipart/form-data; charset=utf-8; boundary=' + Math.random().toString().substr(2);
  return this.getDataAsFormData()
};

KenSoni.ValidateAttribute.fn.getDataAsFormData = function(){
  if (!this.section) return null;
  var form = new FormData;
  
  form.contentType = false;
  form.processData = false;

  this.mapSend(function(value, name){
    KenSoni.isArray(value) || value instanceof FileList ? Array.from(value).map(function(val){
      form.append(name, val)
    }) : form.append(name, value)
  });

  return form;
};

KenSoni.ValidateAttribute.fn.getDataAsUrlEncoded = function(){
  if (!this.section) return '';
  var form = [];

  this.mapSend(function(value, name){
    if (KenSoni.isString(value)){
      value = value.replace('&', '&amp;');
      form.push(name + '=' + value);
    }
  });

  return form.join('&');
};

KenSoni.ValidateAttribute.fn.getDataAsJson = function(){
  if (!this.section) return {};
  var form = {};

  var makeJson = function(obj, value){
    if (KenSoni.isArray(obj)){
      obj = [ makeJson(obj[0], value) ];
    }
    else if (obj === '@'){
      obj = value;
    }
    else{
      for (var name in obj){
        obj[name] = makeJson(obj[name], value);
        break;
      }
    }
  
    return obj;
  };

  this.mapSend(function(value, name){
    var json = KenSoni.queryToJson(name + '=@');
    Object.assign(form, makeJson(json, value));
  });

  return form;
};

KenSoni.ValidateAttribute.fn.action = function(KS, options, section = null){
  if (KS instanceof KenSoni){
    this.KenSoni = KS;
  }
  else if (typeof KS === 'object'){
    this.KenSoni = KenSoni();
    options = KS;
  }
  else if (typeof KS === 'string'){
    this.KenSoni = KenSoni(KS);
  }

  section instanceof HTMLElement && (this.section = section);
  
  options = options || {};
  Object.assign(this.options, options);
  
  this.elements = {};
  this.element = null;

  if (!this.section){
    this.events.Done(false, this);
    return -1;
  }

  var numElement = this.appendElements().length;

  if (this.events.BeforeValidate(this.section, this.elements, this) === false){
    this.events.Done(this, false);
    return 0;
  }

  var elementValid = true
  , ruleName = KenSoni.ValidateAttribute.RULENAMES
  , numRule = ruleName.length
  , name;

  if (numElement){
    var continueError = true;

    for (name in this.elements){
      if (!continueError) break;
      
      var lengthOfName = this.elements[name].length, i = 0;
      var nameValid = true;
      
      for (; i < lengthOfName; ++i){
        if (!nameValid) break;
       
        this.element = this.elements[name][i].element;
        var ruleValid = true;

        for (var j = 0; j < numRule;){
          if (!ruleValid) break;

          var rule = this['rule' + ruleName[j++]]();
          this.elements[name][i].validator.push(JSON.parse(JSON.stringify(rule)));

          if (rule.valid) continue;
          elementValid = false;
          
          if (this.events.ElementInvalid(this.element, rule, this.section, this) === false){
            continueError = nameValid = ruleValid = false;
            break;
          }
        }
      }
    }
  }

  if (!elementValid){
    this.events.ValidateInvalid(this.section, this);
    this.events.Done(false, this);
    return -1;
  }

  if (this.options.ajax !== true){
    this.events.ValidateSuccess(this.section, this);
    this.events.Done(true, this);
    return this.options.removeSubmit === true ? 0 : 1;
  }

  var data = this.getData(), me = this;

  if (this.events.BeforeSend(this.section, data, this) === false){
    this.events.Done(true, this);
    return 0;
  }

  this.element = this.section;

  KenSoni.ajax({
    url: this.options.url || this.attr(KenSoni.ValidateAttribute.ATTRS.ACTION),
    method: options.method || this.attr(KenSoni.ValidateAttribute.ATTRS.METHOD) || this.options.method,
    enctype: this.options.enctype || this.attr(KenSoni.ValidateAttribute.ATTRS.ENCTYPE),
    data,
    success: function(response, xhr){
      me.events.AjaxSuccess(response, me.section, xhr, me)
    },
    error: function(error, xhr){
      me.events.AjaxError(error, me.section, xhr, me);
    },
    done: function(xhr){
      me.events.Done(true, me);
    }
  });

  return 0;
};

KenSoni.ValidateAttribute.fn.listen = function(options){
  if (!this.KenSoni.length) return this;
  Object.assign(this.options, options);

  var self = this;

  this.KenSoni.each(function(){
    if (KenSoni(this).hasClass('ksvaListened')) return;
    KenSoni(this).addClass('ksvaListened');

    KenSoni(this).addEventListener('submit', function(event){
      document.activeElement.blur();
      self.action(self.KenSoni, options, this) === 1 || event.preventDefault();
    });
  });

  return this;
};

if (typeof module === 'object' && typeof module.exports === 'object'){
  module.exports = KenSoni;
  module.exports.default = KenSoni;
}