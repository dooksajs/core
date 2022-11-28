const _ = {
  name: "dsAction",
  version: 1,
  dependencies: [
    {
      name: "dsParameter",
      version: 1
    }
  ],
  data: {
    actions: {},
    sequence: {},
    conditions: {}
  },
  methods: {
    dispatch({ sequenceId: e, payload: s }) {
      const t = this.sequence[e];
      !t || this._dispatch({
        sequenceId: e,
        actions: t.actions,
        conditions: t.conditions || {},
        payload: s
      });
    },
    set({ actions: e, conditions: s, sequence: t }) {
      e && (this.actions = { ...this.actions, ...e }), s && (this.conditions = { ...this.conditions, ...s }), t && (this.sequence[t.id] = {
        actions: t.actions
      }, t.conditions && (this.sequence[t.id].conditions = t.conditions));
    },
    setConditions(e) {
      this.conditions = { ...this.conditions, ...e };
    },
    _action({
      instance: e,
      name: s,
      type: t,
      computedParams: o,
      paramType: i,
      params: d,
      callback: a = {},
      entry: n,
      parentEntry: c
    }) {
      return o && (d = this.$method("dsParameter/process", {
        instance: e,
        entry: n,
        parentEntry: c,
        paramType: i,
        params: d
      })), this["_process/" + t]({ name: s, params: d, callback: a });
    },
    _createActions(e, s) {
      return { entry: e, ...s };
    },
    _compare(e, { instanceId: s, parentItemId: t, data: o }) {
      let i = !1, d = !1, a = [];
      for (let n = 0; n < e.length; n++) {
        const c = e[n], l = c.name;
        if (l === "&&" || l === "||")
          a = [...a, l], d = !0;
        else {
          const r = [], h = c.values.length - 1;
          for (let m = 0; m < c.values.length; m++) {
            const u = c.values[m];
            let f = u.value;
            Object.hasOwnProperty.call(u, "entry") && (f = this._action({
              instanceId: s,
              entry: u.entry,
              parentItemId: t,
              paramItems: c.params,
              data: o,
              lastItem: h === m,
              ...c.items[u.entry]
            })), r.push(f);
          }
          const p = this.$method("dsOperators/eval", { name: l, values: r });
          a.push(p);
        }
      }
      if (d)
        i = this.$method("dsOperators/compare", a);
      else
        for (let n = 0; n < a.length; n++)
          if (i = !0, !a[n]) {
            i = !1;
            break;
          }
      return i;
    },
    _dispatch({
      sequenceId: e,
      instance: s = {
        iteration: {},
        results: {}
      },
      parentEntry: t,
      actions: o = {},
      conditions: i = {},
      payload: d,
      results: a = {}
    }) {
      let n = !0;
      s.payload = d, t && (s.results[t] = a), i.length && (n = this._compare(i, {
        parentEntry: t,
        instance: s
      }));
      for (let c = 0; c < o.entry.length; c++) {
        const l = o.entry[c], r = o[l];
        let h = r;
        if (r._$id && (h = this.actions[r._$id]), r.conditions && (n = this._compare(r.conditions, {
          parentEntry: t,
          instance: s
        })), Object.hasOwnProperty.call(h, "when") && n !== h.when)
          return;
        if (Object.hasOwnProperty.call(h, "value"))
          return [h.value];
        const p = {
          onSuccess: null,
          onError: null
        };
        Object.hasOwnProperty.call(r, "onSuccess") && (p.onSuccess = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onSuccess,
              ...o
            },
            instance: s
          },
          method: this._dispatch.bind(this)
        }), Object.hasOwnProperty.call(r, "onError") && (p.onError = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onError,
              ...o
            },
            instance: s
          },
          method: this._dispatch.bind(this)
        });
        const m = this._action({
          instance: s,
          entry: l,
          actions: o,
          conditions: r.conditions,
          parentEntry: t,
          name: h.name,
          type: h.type,
          computedParams: h._$computedParams,
          paramType: h.paramType,
          params: h.params,
          callback: p
        });
        m && (a[l] = m);
      }
      return a;
    },
    _onEvent(e, s, t) {
      let o = t;
      s && (o = { ...s, result: t }), e(o);
    },
    "_process/value"({ params: e, callback: s }) {
      const t = s.onSuccess, o = s.onError, i = e;
      return t && this._onEvent(t.method || t, t.params, i), o && this._onEvent(o.method || o, o.params), i;
    },
    "_process/action"({ name: e, params: s, callback: t }) {
      this.$action(e, s, t);
    },
    "_process/method"({ name: e, params: s, callback: t }) {
      const o = t.onSuccess, i = this.$method(e, s);
      o && this._onEvent(o.method || o, o.params, i);
    }
  }
};
export {
  _ as default
};
