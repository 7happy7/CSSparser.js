(Global => {
  var OPT = {
    STR: {
      SYMBOL: '\\s*[>~\\+\\.#]\\s*|\\[[^\\]]+\\]|\\s+',// combinator, class, id, attribute
      SEPARATE: '\\s*,\\s*'
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
  /* main */
  var CSSSelector = class {
    constructor(selector) {
      this.order = new OPT.REG['SEPARATE'](selector).split().map(s => {
        var e = new OPT.REG['SYMBOL'](s).exec(), i = 0;
        var n = e.map(_ => {
          var r = s.substring(i, _.index).trim();
          i = _.index + _.len;
          return [r, _[0].trim()];
        }).flat();
        n.push(s.substring(i));
        n = n.filter((v, i, a) => v !== '' || !(SYM_CHAR.COM[a[i + 1]]));
        var x = [], y, z = {tag: '', id: null, class: null, atr: [], next: {}}, _;
        while((y = n.shift()) || y == '') {
          (y == '' || y == '>' || y == '~' || y == '+')
            ? (x.push(z), z = {tag: '', id: null, class: null, atr: [], next: {type: SYM_CHAR.COM[y]}})
            : (_
              ? (z[_] = y, _ = void(0))
              : (y.match(/\[[^\]]+\]/)
                ? z.atr.push(y)
                : (_ = SYM_CHAR.ATR[y], _ || (z.tag = y))
              ))
        }
        x.push(z);
        return x.reverse();
      });
    }
    toString() {
      // toString
    }
  };

  Global.CSSSelector = CSSSelector;
})(this);

// new CSSSelector('div#content a[href$="/main"] > span + i, form input[type="checkbox"] ~ i.sub').order;
/*
[
  0: [
    0: {
      tag: "i",
      id: null,
      class: null,
      atr: [],
      next: {type: "adjacent"}
    }
    1: {
      tag: "span",
      id: null,
      class: null,
      atr: [],
      next: {type: "child"}
    }
    2: {
      tag: "a",
      id: null,
      class: null,
      atr: ['[href$="/main"]'],
      next: {type: "descendant"}
    }
    3: {
      tag: "div",
      id: "content",
      class: null,
      atr: [],
      next: {}
    }
    length: 4
    __proto__: Array(0)
  ],
  1: (3) [{…}, {…}, {…}]
]
*/
