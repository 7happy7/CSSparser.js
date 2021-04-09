(Global => {
  var CSSStyleError = class extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'CSSStyleError';
    }
  }
  var OPT = {
    STR: {
      SYMBOL: '\\s*[>~\\+\\.#]\\s*|\\[[^\\]]+\\]|\\s+',// combinator, class, id, attribute
      ATTRIBUTE: '^\\[(.+?)(?:(\\*|\\^|\\$)?\\=(.*?)|)\\]$',
      SEPARATE: '\\s*,\\s*',
      BRACKET_REV: '[\\{\\}](?!\\\\)',
      AT_RULES: '^@(\\S+?)(?:\\s(.*?)|)$',
      KEYFRAMES: '^(from|to|[\\d\\.]+?%)$'
    },
    BASE: class {
      constructor(str) {this.str = str; this.reg;}
      exec() {return [...this.str.matchAll(this.reg)].map(v => (v.len = v[0].length, v));}// instead of 'while((variable = RegEx.exec(String))) {...}'
      split() {return this.str.split(this.reg);}
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
    COM: {'': 'descendant', '>': 'child', '~': 'general', '+': 'adjacent'}
  };
  var CHAR_SYM = {};// reversing SYM_CHAR
  Object.keys(SYM_CHAR).forEach(s => {
    CHAR_SYM[s] = {};
    Object.keys(SYM_CHAR[s]).forEach(k => {
      CHAR_SYM[s][SYM_CHAR[s][k]] = k;
    })
  });
  var CSSSelector = class {
    constructor(selector) {
      this.selector = selector;
    }
    get order() {
      return new OPT.REG['SEPARATE'](this.selector.trim()).split().map(s => {
        var e = new OPT.REG['SYMBOL'](s).exec(), i = 0;
        var n = e.map(_ => {
          var r = s.substring(i, _.index).trim();
          i = _.index + _.len;
          return [r, _[0].trim()];
        }).flat();
        n.push(s.substring(i));
        n = n.filter((v, i, a) => v !== '' || !(SYM_CHAR.COM[a[i + 1]]));
        var w, x = [], y, z = {tag: '', id: null, class: null, attribute: [], next: {}}, _;
        while((y = n.shift()) || y == '') {
          (y == '' || y == '>' || y == '~' || y == '+')
            ? (x.push(z), z = {tag: '', id: null, class: null, attribute: [], next: {type: SYM_CHAR.COM[y]}})
            : (_
              ? (z[_] = y, _ = void(0))
              : ((w = new OPT.REG['ATTRIBUTE'](y).exec()).length
                ? z.attribute.push(w[0].slice(1, 4))
                : (_ = SYM_CHAR.ATR[y], _ || (z.tag = y))
              ))
        }
        x.push(z);
        return x.reverse();
      });
    }
  };
  var REV = s => s.split('').reverse().join('');
  var StyleComponent = class {
    constructor(key, type) {
      this.key = key;
      this.type = type;
      this.value = [];
      this.child = [];
      this.original = [this];
      this.parent = null;
    }
    set(value) {
      this.value.push(value);
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
      this.css = css.trim();
    }
    get entry() {
      var css = REV(this.css);
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
      return res;
    }
    get map() {
      var com = new StyleComponent(null, '__root__'), cur, base = {}, flg = true, reg;
      base[-1] = com;
      this.entry.forEach(e => {
        e.sel
          ? (
            reg = (
              new OPT.REG['AT_RULES'](e.str).exec()[0] || new OPT.REG['KEYFRAMES'](e.str).exec()[0] || []
            ).splice(1, 3),
            cur = new StyleComponent(
              reg.length ? reg : new CSSSelector(e.str),
              ['default', 'keyframes_duration', 'at_rule'][reg.length]
            ),
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


/*
var s = `
a[href*="\\{"] {
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
var c = new CSSObject(s);
console.log(c.entry, c.map);
*/
