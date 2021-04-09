(Global => {
  var CSSStyleError = class extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'CSSStyleError';
    }
  }
  var OPT = {
    STR: {
      BRACKET_REV: '[\\{\\}](?!\\\\)'
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
  var REV = s => s.split('').reverse().join('');

  var CSSObject = class {
    constructor(css) {
      this.css = css.trim();
    }
    get map() {
      var css = REV(this.css);
      var bracket = new OPT.REG['BRACKET_REV']( css ).exec(), _ = bracket.map(v => v[0]), _a = _.filter(v => v == '}'), _b = _.filter(v => v == '{');
      var map = [], a = 0, b = 0, c, d, e, i = 0;
      while((c = bracket.shift())) {
        i && map.push( {str: REV(css.substring(i + 1, c.index)).trim(), sel: d} );
        i = c.index;
        c == '}' ? (a++, d = false) : (b++, d = true);
      }
      i && map.push( {str: REV(css.substring(i + 1)).trim(), sel: d} );
      var res = map.reverse();
      if(!res[0].sel || res[res.length - 1].sel || _.length !== (_a.length + _b.length) || _a.length !== _b.length) {
        throw new CSSStyleError('Invalid Style');
      }
      return res;
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
console.log(c.map);
*/

/*
[
  0: {str: "a[href*="\{"]",       sel: true  }
  1: {str: "animation: anim 1s;", sel: false }
  2: {str: "@keyframes anim",     sel: true  }
  3: {str: "0%",                  sel: true  }
  4: {str: "color: red;",         sel: false }
  5: {str: "100%",                sel: true  }
  6: {str: "color: blue;",        sel: false }
]
*/
