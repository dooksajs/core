const h = {
  name: "dsOperators",
  version: 1,
  data: {
    operators: {
      "==": (e) => e[0] === e[1],
      "!=": (e) => e[0] !== e[1],
      ">": (e) => e[0] > e[1],
      ">=": (e) => e[0] >= e[1],
      "<": (e) => e[0] < e[1],
      "<=": (e) => e[0] <= e[1],
      "!": (e) => !e[0],
      "!!": (e) => !!e[0],
      "%": (e) => e[0] % e[1],
      "++x": (e) => ++e[0],
      "x++": (e) => e[0]++,
      "--x": (e) => --e[0],
      "x--": (e) => e[0]--,
      "-": (e) => e[0] - e[1],
      "+": (e) => e[0] + e[1],
      "*": (e) => e[0] * e[1],
      "**": (e) => e[0] ** e[1]
    }
  },
  methods: {
    eval({ name: e, values: r }) {
      return this.operators[e](r);
    },
    compare(e) {
      let r = !1;
      for (let t = 0; t < e.length; t++) {
        const o = e[t];
        if (o === "&&")
          if (e[t - 1] && e[t + 1])
            r = !0;
          else
            break;
        if (o === "||")
          if (e[t - 1] || e[t + 1])
            r = !0;
          else
            break;
      }
      return r;
    },
    arrayRemove({ list: e, items: r }) {
      const t = [];
      for (let o = 0; o < e.length; o++) {
        let n = !1;
        for (let a = 0; a < r.length; a++)
          if (o === r[a]) {
            n = !0;
            break;
          }
        n || t.push(e[o]);
      }
      return t;
    },
    arrayNextKeyValue({ list: e, key: r, index: t = 0 }) {
      const o = e[t][r];
      for (let n = t; n < e.length; n++)
        if (e[n][r] !== o)
          return [e[n][r], n];
      return [o, t];
    },
    arrayPrevKeyValue({ list: e, key: r, index: t = 0 }) {
      const o = e[t][r];
      for (let n = t; n >= 0; n--)
        if (e[n][r] !== o)
          return [e[n][r], n];
      return [o, t];
    },
    arrayFindByKeyValue({ list: e, key: r, valueIndex: t }) {
      const o = t[0], n = t[1] || 0, a = (f) => e[f] && e[f][r] === o, l = [];
      for (let f = n; f < e.length; f++)
        if (e[f][r] === o) {
          const u = f + 1;
          if (l.length) {
            if (!a(u))
              return l.push(f), l;
          } else {
            let c = f - 1;
            if (n && a(c)) {
              for (; a(c); )
                c--;
              if (l.push(c + 1), !a(u))
                return l.push(f), l;
            } else if (l.push(f), !a(u) || u === e.length)
              return l.push(f), l;
          }
        }
    },
    arrayMove({ list: e, items: r, index: t }) {
      const o = r.length;
      let n = t - (o - 1);
      if (n > e.length - 1 || n < 0 && t < 0)
        return;
      n <= 0 && t >= 0 && (n = t);
      const a = [];
      for (let u = 0; u < o; u++)
        a.push(e[r[u]]);
      r.sort((u, c) => u - c);
      const l = e;
      let f = 1;
      for (let u = 0; u < o; u++) {
        l.splice(r[u], 1);
        const c = u + 1;
        c < o && (r[c] = r[c] - f, ++f);
      }
      const s = l.splice(n);
      return l.concat(a, s);
    },
    arrayMerge({ list: e, items: r, flat: t }) {
      let o = 0;
      r.sort((n, a) => n._$index - a._$index);
      for (let n = 0; n < r.length; n++) {
        const a = r[n], l = a._$index + o;
        delete a._$index;
        const f = [a], s = e.splice(l);
        e = e.concat(f, s), ++o;
      }
      return t && (e = e.flat(t)), e;
    }
  }
};
export {
  h as default
};
