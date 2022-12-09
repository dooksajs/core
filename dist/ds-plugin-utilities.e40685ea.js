let i = (e) => crypto.getRandomValues(new Uint8Array(e)), s = (e, t, a) => {
  let n = (2 << Math.log(e.length - 1) / Math.LN2) - 1, l = -~(1.6 * n * t / e.length);
  return (g = t) => {
    let r = "";
    for (; ; ) {
      let h = a(l), o = l;
      for (; o--; )
        if (r += e[h[o] & n] || "", r.length === g)
          return r;
    }
  };
}, d = (e, t = 21) => s(e, t, i);
const u = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$", f = d(u, 22), m = {
  name: "dsUtilities",
  version: 1,
  methods: {
    generateId() {
      return "_" + f();
    }
  }
};
export {
  m as default
};
