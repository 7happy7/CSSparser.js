import CSS3_COLOR_KEYWORDS as C_KEY from 'keywords.js';

var section = max => (n => n
  ? !isNaN(n) && 0 < n && n <= max
  : n === 0);

// "73.5%" -> 0.735, 0.5 -> 0.5
var per2dec = s => {
  var _ = String(s).match(/^([\d\.]+?)%$/);
  var f = _ && _[1].match(/^\d+?(?:\.\d+?|)$/);
  return f
    ? Number(f[0])
    : section(1)(s)
      ? Number(s)
      : null;
};

var hex = s => {
  var x = {},
      m = s && s.match(/^#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})|$/);
  return m && (
    x.ary_row = (m[1].length <= 4
      ? m[1].split('')
        .filter(v => v)
        .map(v => v + v)
      : m[1].split(/([0-9a-f]{2})/)
        .filter(v => v)),
    x.ary = x.ary_row.map(v => parseInt(v, 16)),
    m[1].length % 4 == 0
      ? (x.ary[3] = x.ary[3] / 255)
      : x.ary.push(1),
    x
  );
};

var hsla = (H, S, L, A) => {
  var [h, s, l, a] = [H % 360, S, L, (A == 0 || A == '0') ? 0 : A ? A : 1],
      _ = s * (1 - Math.abs((2 * l) - 1)) / 2,
      [min, max] = [l - _, l + _],
      i = parseInt(h / 60) % 6,
      r = [
    [max, min + (max - min) * (h / 60), min],
    [min + (max - min) * (120 - h / 60), max, min],
    [min, max, min + (max - min) * (h - 120 / 60)],
    [min, min + (max - min) * (240 - h / 60), max],
    [min + (max - min) * (h - 240 / 60), min, max],
    [max, min, min + (max - min) * (360 - h / 60)]
  ][i].map(v => v * 255);
  r.push(a);
  return r;
};

// inner class: Convert.from
var RGBAConverter = class {
  constructor(self) {
    this.self = self;
  }
  HEX(str) {
    var h = hex(str);
    [this.self.R, this.self.G, this.self.B, this.self.A] = h.ary;
    return this.self;
  }
  HSL(H, S, L, A=1) {
    [this.self.R, this.self.G, this.self.B, this.self.A] = hsla(H, S, L, A);
    return this.self;
  }
  KEYWORD(CSS3_COLOR_KEYWORD) {
    var k = C_KEY[CSS3_COLOR_KEYWORD];
    if(!k) throw new Error(`invalid keyword: "${CSS3_COLOR_KEYWORD}"`);
    [this.self.R, this.self.G, this.self.B] = k;
    return this.self;
  }
}

var RGBAObject = class {
  constructor(R, G, B, A=1) {
    [this.R, this.G, this.B, this.A] = [R, G, B, A];
  }
  get from() {
    return new RGBAConverter(this);
  }
  toString() {
    return `rgba(${this.R}, ${this.G}, ${this.B}, ${this.A})`;
  }
};

// var rgb1 = new RGBAObject().from.HEX('#b01a');

// var rgb2 = (new RGBAObject).from.HSL(20.104, 0.749, 0.5);

// var rgb3 = new RGBAObject(100, 30, 180, 0.5);

// console.log(rgb1, rgb2);
// RGBAObject {R: 187, G: 0, B: 17, A: 0.6666666666666666}, RGBAObject {R: 222.9975, G: 95.998558, B: 32.0025, A: 1}

// console.log(rgb1+'', rgb2+'');
// "rgba(187, 0, 17, 0.6666666666666666)", "rgba(222.9975, 95.998558, 32.0025, 1)"

export {RGBObject};
