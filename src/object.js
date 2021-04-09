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

  var StyleComponent = class {
    constructor(name, type) {
      this.name = name;
      this.type = type;
      this.value = [];
      this.child = [];
      this.original = [this];
    }
    set(value) {
      this.value.push(value);
      return this;
    }
    append(child) {
      this.child.push(child);
      this.original.push(child, ...child.original);
      this.original = this.original.filter((v, i, a) => a.indexOf(v) == i);;
      child.original = this.original;
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
      var com = new StyleComponent(null, '_parent'), cur, res = com, base = {}, offset = -1, flg = true;
      base[offset++] = res;
      this.entry.forEach(e => {
        e.sel
          ? (cur = new StyleComponent(e.str, 'default'), flg ? com.append(cur) : (base[e.offset - 1].append(cur), base[e.offset] = cur), com = cur)
          : com.set(e.str);
        flg = e.sel;
      });
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
console.log(c.entry, c.map);
*/

/* c.entry:
[
  0: {str: "a[href*="\{"]",        sel: true,   offset: 0}
  1: {str: "animation: anim 1s;",  sel: false,  offset: 1}
  2: {str: "@keyframes anim",      sel: true,   offset: 0}
  3: {str: "0%",                   sel: true,   offset: 1}
  4: {str: "color: red;",          sel: false,  offset: 2}
  5: {str: "100%",                 sel: true,   offset: 1}
  6: {str: "color: blue;",         sel: false,  offset: 2}
]
*/
/* c.map:
StyleComponent {
  child: [
    0: StyleComponent {name: "a[href*="\{"]", type: "default", value: Array(1), child: Array(0), original: Array(4)}
    1: StyleComponent
      child: [
        0: StyleComponent {name: "0%", type: "default", value: Array(1), child: Array(0), original: Array(6)}
        1: StyleComponent
          child: []
          name: "100%"
          original: (5) [StyleComponent, StyleComponent, StyleComponent, StyleComponent, StyleComponent]
          type: "default"
          value: ["color: blue;"]
      ]
      name: "@keyframes anim"
      original: (5) [StyleComponent, StyleComponent, StyleComponent, StyleComponent, StyleComponent]
      type: "default"
      value: []
  ]
  name: null
  original: (5) [StyleComponent, StyleComponent, StyleComponent, StyleComponent, StyleComponent]
  type: "_parent"
  value: []
}
*/
