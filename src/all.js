(Global => {
  var CSSStyleError = class extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'CSSStyleError';
    }
  }

  var NestParser = class {
    constructor(start, end) {
      this._start = start;
      this._end = end;
    }
    get start() {return new RegExp(this._start, 'igm')}
    get end() {return new RegExp(this._end, 'igm')}
    parse(string) {
      var n = 0, p = [], ps = [], r = [], i = 0;
      var a = [...string.matchAll(this.start)].map((v, i) => (v.type = true, v)), b = [...string.matchAll(this.end)].map((v, i, a) => (v.type = false, v));
      if(a.length !== b.length) throw new CSSStyleError('No!');
      var c = [...a, ...b].sort((x, y) => x.index - y.index);
      c.forEach(c => c.type ? (n++, p.push(c)) : (n == 0 || (n--, p.push(c), n == 0 && (ps.push(p), p = []))));
      ps.map(v => [v[0], v[v.length - 1]]).flat().forEach(e => (r.push(string.substring(i, e.index), e[0]), i = e.index + e[0].length));
      return c.length ? (r.push(string.substring(i)), r) : [string];
    }
  };

  var OPT = {
    STR: {
      SYMBOL: '\\s*[>~\\+\\.#]\\s*|\\[[^\\]]+\\]|\\s+',// combinator, class, id, attribute
      ATTRIBUTE: '^\\[(.+?)(?:(\\*|\\^|\\$)?\\=(.*?)|)\\]$',
      PSEUDO: '(\\:{1,2})([^\\:\\s]+)',
      SEPARATE: '\\s*,\\s*',
      BRACKET_REV: '[\\{\\}](?!\\\\)',
      AT_RULES: '^@(\\S+?)(?:\\s(.*?)|)$',
      AT_RULES_INLINE: '^@(\\S+?)(?:\\s([^\\{\\}]*?)|);',
      KEYFRAMES_DURATION: '^(from|to|[\\d\\.]+?%)$',
      SEMICOLON: '\\s*;\\s*',
      PROPERTY: '^(.+?)\\:\\s*(.+?)$'
    },
    BASE: class {
      constructor(str) {this.str = str; this.reg;}
      exec() {return [...this.str.matchAll(this.reg)].map(v => (v.len = v[0].length, v));}// instead of 'while((variable = RegEx.exec(String))) {...}'
      split() {return this.str.split(this.reg);}
      digest() {return this.str.replace(this.reg, '')}
    },
    REG: {}
  };
  Object.keys(OPT.STR).forEach(s => {
    OPT.REG[s] = class extends OPT.BASE {
      constructor(str) {super(str); this.reg = new RegExp(OPT.STR[s], 'igm');}
    }
  });
  
  var SYM_CHAR = {
    ATR: {'#': 'id', '.': 'class'},
    PSE: {':': 'class', '::': 'element'},
    COM: {'': 'descendant', '>': 'child', '~': 'general', '+': 'adjacent'}
  };
  var CHAR_SYM = {};// reversing SYM_CHAR
  Object.keys(SYM_CHAR).forEach(s => {
    CHAR_SYM[s] = {};
    Object.keys(SYM_CHAR[s]).forEach(k => {
      CHAR_SYM[s][SYM_CHAR[s][k]] = k;
    })
  });

  var CSSSelectorParts = class {
    constructor() {
      this.tag = null;
      this.id = null;
      this.class = [];
      this.pseudo = {class: [], element: []};
      this.attribute = [];
      this.next = {type: null};
    }
    isGreaterThan(parts) {
      if(!(parts instanceof CSSSelectorParts)) throw new CSSStyleError('Invalid argument.');
      return (this.id && !parts.id)
        || ([...this.class, ...this.attribute, ...this.pseudo.class].length > [...parts.class, ...parts.attribute, ...parts.pseudo.class].length)
        || ([...(this.tag ? [this.tag] : []), ...this.pseudo.element].length > [...(this.tag ? [this.tag] : []), ...this.pseudo.element].length);
    }
  }

  var CSSSelector = class {
    constructor(selector) {
      this.selector = selector;
    }
  };

  var CSSBasicSelector = class extends CSSSelector {
    constructor(selector) {
      super(selector);
      this.type = 'basic';
    }
    get order() {
      return new OPT.REG['SEPARATE'](this.selector.trim()).split().map(s => {// ooooooooooooooooooooooooooooooooooooooooooooooooooo

        var _not = new NestParser('\\:not\\(', '\\)').parse(s);
        var _s = _not.filter((v, i) => i % 4 !== 2).join('');
        var not_content = _not.filter((v, i) => i % 4 == 2);

        var e = new OPT.REG['SYMBOL'](_s).exec(), i = 0;
        var n = e.map(_ => {
          var r = _s.substring(i, _.index).trim();
          i = _.index + _.len;
          return [r, _[0].trim()];
        }).flat();
        n.push(_s.substring(i));
        n = n.filter((v, i, a) => v !== '' || !(SYM_CHAR.COM[a[i + 1]]));
        var w, x = [], y, z = new CSSSelectorParts, _;


        while((y = n.shift()) || y == '') {
          (y == '' || SYM_CHAR.COM[y])
            ? (x.push(z), z = new CSSSelectorParts, z.next.type = SYM_CHAR.COM[y])
            : (_
              ? (z[_] = y, _ = void(0))
              : ((w = new OPT.REG['ATTRIBUTE'](y).exec()).length
                ? z.attribute.push(w[0].slice(1, 4))
                : ((w = new OPT.REG['PSEUDO'](y)).exec().length
                  ? (w.exec().forEach(_w => z.pseudo[SYM_CHAR.PSE[_w[1]]].push(
                      (_w[1] == ':' && _w[2] == 'not()') ? (`not(${not_content.shift()})`) : _w[2] 
                    )), (w = w.digest()) && (z.tag = w))
                  : (_ = SYM_CHAR.ATR[y], _ || (z.tag = y))
              )));
        }
        x.push(z);
        return x.reverse().filter(v => JSON.stringify(v) !== JSON.stringify(new CSSSelectorParts));
      });
    }
  };
  var CSSAtRuleSelector = class extends CSSSelector {
    constructor(selector, rule, value = null) {
      super(selector);
      this.type = 'at_rule';
      this.rule = rule;
      this.value = value;
    }
  };
  var CSSKeyFramesDurationSelector = class extends CSSSelector {
    constructor(selector, ...duration) {
      super(selector);
      this.type = 'keyframes_duration';
      this.duration = duration.map(v => new OPT.REG['KEYFRAMES_DURATION'](v).exec()[0]);
      if(this.duration.find(v => !v)) throw new CSSStyleError(`The keyframes duration "${this.duration}" is not valid.`);
    }
  };

  var SelectorSwitcher = selector => {
    var sels = new OPT.REG['SEPARATE'](selector.trim()).split();
    var obj = {
      AT_RULES: (s, r) => new CSSAtRuleSelector(s, ...r),
      KEYFRAMES_DURATION: (s, r) => new CSSKeyFramesDurationSelector(s, ...r)
    }
    var opt = Object.keys(obj), o, r;
    while((o = opt.shift())) {
      r = new OPT.REG[o](sels[0]).exec()[0];
      if(r) break;
    }
    return r ? obj[o](selector, r.slice(1)) : new CSSBasicSelector(selector);
  }
  
  var CSSProperty = class extends Array {
    constructor(...args) {
      super(...args);
    }
  }

  var REV = s => s.split('').reverse().join('');
  var StyleComponent = class {
    constructor(key, type) {
      this.key = key;
      this.type = type;
      this.property = new CSSProperty;
      this.child = [];
      this.original = [this];
      this.parent = null;
    }
    set(value) {
      var vs = new OPT.REG['SEMICOLON'](value).split().filter(v => v);
      vs.forEach(v => {
        var es = new OPT.REG['PROPERTY'](v).exec();
        es.forEach(e => {
          this.property.push(`${e[1]}:${e[2]}`);
          this.property[e[1]] = e[2];
        });
      });
      this.property.sort();
      return this;
    }
    append(child) {
      this.child.push(child);
      this.original.push(child, ...child.original);
      this.original = this.original.filter((v, i, a) => a.indexOf(v) == i);
      child.original = this.original;
      child.parent = this;
      return this;
    }
  }

  var CSSObject = class {
    constructor(css) {
      this.css = css;
    }
    get entry() {
      var at = new OPT.REG['AT_RULES_INLINE'](this.css.trim());
      var css = REV(at.digest());
      var bracket = new OPT.REG['BRACKET_REV']( css ).exec(), _ = bracket.map(v => v[0]), _a = _.filter(v => v == '}'), _b = _.filter(v => v == '{');
      var map = [], a = 0, b = 0, c, d, e, i = 0;
      while((c = bracket.shift())) {
        i && map.push( {str: REV(css.substring(i + 1, c.index)).trim(), sel: d, offset: a - b} );
        i = c.index;
        c == '}' ? (a++, d = false) : (b++, d = true);
      }
      i && map.push( {str: REV(css.substring(i + 1)).trim(), sel: d, offset: a - b} );
      var res = map.reverse();
      if(!res[0].sel || res[res.length - 1].sel || _.length !== (_a.length + _b.length) || _a.length !== _b.length) {
        throw new CSSStyleError('The bracket pattern is not valid.');
      }
      return {entry: res, at_rules_inline: at.exec()};
    }
    get CSSOM() {
      var entry = this.entry, com = new StyleComponent(null, '__root__'), cur, base = {}, flg = true, reg;
      base[-1] = com;
      entry.at_rules_inline.forEach(a => {
        var o = new CSSAtRuleSelector(...a);
        com.append(new StyleComponent(o, o.type));
      });
      entry.entry.forEach(e => {
        e.sel
          ? (
            reg = SelectorSwitcher(e.str),
            cur = new StyleComponent(reg, reg.type),
            flg
              ? com.append(cur)
              : (base[e.offset - 1].append(cur), base[e.offset] = cur),
            com = cur
          )
          : (com.set(e.str));
        flg = e.sel;
      });
      return base[-1];
    }
  }

  Global.CSSObject = CSSObject;
})(this);



var s = `
@charset "utf-8";
#body > a[href*="\\{"]:first-child:last-child a:not(div:not(.x) > a:not([href])):not(.x)::before {
  content: "";
  animation: anim 1s;
}
@keyframes anim {
  0% {
    color: red;
  }
  100% {
    color: blue;
  }
}
`;
var obj = new CSSObject(s);
var c = obj.CSSOM;
var _ = c.child[1].key.order; // "#body > a[href*="\\{"]:first-child:last-child a:not(div:not(.x) > a:not([href])):not(.x)::before"
console.log(obj.entry, c, _);
