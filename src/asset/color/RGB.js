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
  var x = {}, m = s && s.match(/^#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})|$/);
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
    x.ary
  );
};

var hsla = (H, S, L, A) => {
  var [h, s, l, a] = [H % 360, S, L, (A == 0 || A == '0') ? 0 : A ? A : 1];
  var _ = s * (1 - Math.abs((2 * l) - 1)) / 2;
  var [min, max] = [l - _, l + _];
  var i = parseInt(h / 60) % 6;
  return [
    [max, min + (max - min) * (h / 60), min],
    [min + (max - min) * (120 - h / 60), max, min],
    [min, max, min + (max - min) * (h - 120 / 60)],
    [min, min + (max - min) * (240 - h / 60), max],
    [min + (max - min) * (h - 240 / 60), min, max],
    [max, min, min + (max - min) * (360 - h / 60)]
  ][i].map(v => v * 255);
};
