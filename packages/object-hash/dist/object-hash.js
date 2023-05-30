const f = (n) => {
  let t = 1, r = 0;
  n = new Uint8Array(n);
  for (let o = 0; o < n.length; o++)
    t += n[o], r += t;
  return t %= 65521, r %= 65521, s((r << 16 | t) >>> 0, 8);
}, y = (n) => {
  if (n.length === 2) {
    const t = n.charCodeAt(0), r = n.charCodeAt(1);
    if (t >= 55296 && t < 56320 && r >= 56320 && r < 57344)
      return (t - 55296) * 1024 + r - 56320 + 65536;
  }
  return n.charCodeAt(0);
}, s = (n, t = 2) => (n = typeof n == "string" ? y(n) : n, n.toString(16).padStart(t, "0")), l = [];
for (let n = 0; n < 256; ++n)
  l.push((n + 256).toString(16).slice(1));
typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const a = (n) => {
  const t = new TextEncoder(), r = typeof n != "string" ? JSON.stringify(n) : n, o = t.encode(r);
  return f(o);
}, d = {
  Object,
  Array,
  Number,
  Boolean,
  String
}, b = (n) => {
  try {
    if (!n)
      throw new Error("source is undefined");
    const t = {};
    return i(t, n), a(t);
  } catch (t) {
    console.error(t);
  }
}, c = (n) => {
  const t = n == null ? void 0 : n.constructor.name;
  return d[t]();
}, i = (n, t) => {
  if (t == null)
    throw new Error("objectHash: value cannot be undefined");
  return Array.isArray(t) ? t = p(n, t) : typeof t == "object" ? t = h(n, t) : typeof t == "function" && (t = t.toString()), t;
}, p = (n, t) => {
  t = t.slice();
  for (let r = 0; r < t.length; r++) {
    const o = t[r];
    n = c(o), t[r] = i(n, o);
  }
  return t;
}, h = (n, t) => {
  const r = Object.keys(t);
  r.sort();
  for (let o = 0; o < r.length; o++) {
    const e = r[o];
    n[e] = c(t[e]), n[e] = i(n[e], t[e]);
  }
  return n;
};
export {
  b as default
};
//# sourceMappingURL=object-hash.js.map
