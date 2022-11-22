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
    dispatch({ sequenceId: s, payload: e }) {
      const t = this.sequence[s];
      !t || this._dispatch({
        sequenceId: s,
        actions: t.actions,
        conditions: t.conditions || {},
        payload: e
      });
    },
    _getEntryId(s) {
      return s.entry.map((e) => s[e]);
    },
    set({ actions: s, conditions: e, sequence: t }) {
      s && (this.actions = { ...this.actions, ...s }), e && (this.conditions = { ...this.conditions, ...e }), t && (this.sequence[t.id] = {
        actions: t.actions
      }, t.conditions && (this.sequence[t.id].conditions = t.conditions));
    },
    setConditions(s) {
      this.conditions = { ...this.conditions, ...s };
    },
    _dispatch({
      sequenceId: s,
      instance: e = {
        iteration: {},
        results: {}
      },
      parentEntry: t,
      actions: o = {},
      conditions: n = {},
      payload: d,
      results: a = {}
    }) {
      let i = !0;
      e.payload = d, t && (e.results[t] = a), n.length && (i = this._compare(n, {
        parentEntry: t,
        instance: e
      }));
      for (let c = 0; c < o.entry.length; c++) {
        const l = o.entry[c], r = o[l];
        let h = r;
        if (r._$id && (h = this.actions[r._$id]), r.conditions && (i = this._compare(r.conditions, {
          parentEntry: t,
          instance: e
        })), Object.hasOwnProperty.call(h, "when") && i !== h.when)
          return;
        if (Object.hasOwnProperty.call(h, "value"))
          return [h.value];
        const u = {
          onSuccess: null,
          onError: null
        };
        Object.hasOwnProperty.call(r, "onSuccess") && (u.onSuccess = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onSuccess,
              ...o
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        }), Object.hasOwnProperty.call(r, "onError") && (u.onError = {
          params: {
            parentEntry: l,
            actions: {
              entry: r.onError,
              ...o
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        });
        const p = this._action({
          instance: e,
          entry: l,
          actions: o,
          conditions: r.conditions,
          parentEntry: t,
          name: h.name,
          type: h.type,
          computedParams: h._$computedParams,
          paramType: h.paramType,
          params: h.params,
          callback: u
        });
        p && (a[l] = p);
      }
      return a;
    },
    _createActions(s, e) {
      return { entry: s, ...e };
    },
    _action({
      instance: s,
      name: e,
      type: t,
      computedParams: o,
      paramType: n,
      params: d,
      callback: a = {},
      entry: i,
      parentEntry: c
    }) {
      return o && (d = this.$method("dsParameter/process", {
        instance: s,
        entry: i,
        parentEntry: c,
        paramType: n,
        params: d
      })), this["_process/" + t]({ name: e, params: d, callback: a });
    },
    _onEvent(s, e, t) {
      let o = t;
      e && (o = { ...e, result: t }), s(o);
    },
    _compare(s, { instanceId: e, parentItemId: t, data: o }) {
      let n = !1, d = !1, a = [];
      for (let i = 0; i < s.length; i++) {
        const c = s[i], l = c.name;
        if (l === "&&" || l === "||")
          a = [...a, l], d = !0;
        else {
          const r = [], h = c.values.length - 1;
          for (let p = 0; p < c.values.length; p++) {
            const m = c.values[p];
            let f = m.value;
            Object.hasOwnProperty.call(m, "entry") && (f = this._action({
              instanceId: e,
              entry: m.entry,
              parentItemId: t,
              paramItems: c.params,
              data: o,
              lastItem: h === p,
              ...c.items[m.entry]
            })), r.push(f);
          }
          const u = this.$method("dsOperators/eval", { name: l, values: r });
          a.push(u);
        }
      }
      if (d)
        n = this.$method("dsOperators/compare", a);
      else
        for (let i = 0; i < a.length; i++)
          if (n = !0, !a[i]) {
            n = !1;
            break;
          }
      return n;
    },
    "_process/getProcessValue"({ params: s, callback: e }) {
      const t = e.onSuccess, o = e.onError, n = s;
      return t && this._onEvent(t.method || t, t.params, n), o && this._onEvent(o.method || o, o.params), n;
    },
    "_process/pluginAction"({ name: s, params: e, callback: t }) {
      this.$action(s, e, t);
    },
    "_process/pluginMethod"({ name: s, params: e, callback: t }) {
      const o = t.onSuccess, n = this.$method(s, e);
      o && this._onEvent(o.method || o, o.params, n);
    }
  }
};
export {
  _ as default
};
