var CSS3_COLOR_KEYWORDS = {black:[0,0,0],silver:[192,192,192],gray:[128,128,128],white:[255,255,255],maroon:[128,0,0],red:[255,0,0],purple:[128,0,128],fuchsia:[255,0,255],green:[0,128,0],lime:[0,255,0],olive:[128,128,0],yellow:[255,255,0],navy:[0,0,128],blue:[0,0,255],teal:[0,128,128],aqua:[0,255,255],aliceblue:[240,248,255],antiquewhite:[250,235,215],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],blanchedalmond:[255,235,205],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],oldlace:[253,245,230],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],whitesmoke:[245,245,245],yellowgreen:[154,205,50]};

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


/**
 * @classdesc Inner class: RGBAObject.from
 * @constructor
 * @this {RGBAConverter}
 * @param {RGBAObject} self
 */
var RGBAConverter = class {
  constructor(self) {
    this.self = self;
  }
  /** @param {string} Hex #b01, #b01a, #bb0011, #bb0011aa*/
  HEX(Hex) {
    var h = hex(Hex);
    [this.self.R, this.self.G, this.self.B, this.self.A] = h.ary;
    return this.self;
  }
  /**
   * @param {number} H Hue
   * @param {number} S Saturation
   * @param {number} L Lightness
   * @param {number} A Alpha (default: 1)
   */
  HSL(H, S, L, A=1) {
    [this.self.R, this.self.G, this.self.B, this.self.A] = hsla(H, S, L, A);
    return this.self;
  }
  /** @param {string} CSS3_COLOR_KEYWORD */
  KEYWORD(CSS3_COLOR_KEYWORD) {
    var k = CSS3_COLOR_KEYWORDS[CSS3_COLOR_KEYWORD];
    if(!k) throw new Error(`invalid keyword: "${CSS3_COLOR_KEYWORD}"`);
    [this.self.R, this.self.G, this.self.B] = k;
    return this.self;
  }
}

/**
 * @constructor
 * @this {RGBAObject}
 * @param {number | undefined} R Red
 * @param {number | undefined} G Green
 * @param {number | undefined} B Blue
 * @param {number} A Alpha (default: 1)
 */
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

/*
var rgb1 = new RGBAObject().from.HEX('#b01a');

var rgb2 = (new RGBAObject).from.HSL(20.104, 0.749, 0.5);

var rgb3 = new RGBAObject(100, 30, 180, 0.5);

console.log(rgb1, rgb2, rgb3);
// RGBAObject {R: 187, G: 0, B: 17, A: 0.6666666666666666}
// RGBAObject {R: 222.9975, G: 95.998558, B: 32.0025, A: 1}
// RGBAObject {R: 100, G: 30, B: 180, A: 0.5}

console.log(rgb1+'', rgb2+'', rgb3+'');
// "rgba(187, 0, 17, 0.6666666666666666)"
// "rgba(222.9975, 95.998558, 32.0025, 1)"
// "rgba(100, 30, 180, 0.5)"
*/
