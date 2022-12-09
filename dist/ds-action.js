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
    dispatch({ dsActionId: o, payload: e }) {
      const t = this.sequence[o];
      !t || this._dispatch({
        sequenceId: o,
        actions: t.actions,
        conditions: t.conditions || {},
        payload: e
      });
    },
    set({ dsActionItems: o, dsActionConditions: e, dsActionSequence: t }) {
      o && (this.actions = { ...this.actions, ...o }), e && (this.conditions = { ...this.conditions, ...e }), t && (this.sequence[t.id] = {
        actions: t.actions
      }, t.conditions && (this.sequence[t.id].conditions = t.conditions));
    },
    _action({
      instance: o,
      name: e,
      type: t,
      computedParams: s,
      paramType: r,
      params: d,
      callback: a = {},
      entry: n,
      parentEntry: c
    }) {
      return s && (d = this.$method("dsParameter/process", {
        dsActionInstance: o,
        dsActionEntry: n,
        dsActionEntryParent: c,
        dsParameterType: r,
        dsParameterItem: d
      })), this["_process/" + t]({ name: e, params: d, callback: a });
    },
    _createActions(o, e) {
      return { entry: o, ...e };
    },
    _compare(o, { instanceId: e, parentItemId: t, data: s }) {
      let r = !1, d = !1, a = [];
      for (let n = 0; n < o.length; n++) {
        const c = o[n], l = c.name;
        if (l === "&&" || l === "||")
          a = [...a, l], d = !0;
        else {
          const i = [], h = c.values.length - 1;
          for (let m = 0; m < c.values.length; m++) {
            const u = c.values[m];
            let f = u.value;
            Object.hasOwnProperty.call(u, "entry") && (f = this._action({
              instanceId: e,
              entry: u.entry,
              parentItemId: t,
              paramItems: c.params,
              data: s,
              lastItem: h === m,
              ...c.items[u.entry]
            })), i.push(f);
          }
          const p = this.$method("dsOperators/eval", { name: l, values: i });
          a.push(p);
        }
      }
      if (d)
        r = this.$method("dsOperators/compare", a);
      else
        for (let n = 0; n < a.length; n++)
          if (r = !0, !a[n]) {
            r = !1;
            break;
          }
      return r;
    },
    _dispatch({
      sequenceId: o,
      instance: e = {
        iteration: {},
        results: {}
      },
      parentEntry: t,
      actions: s = {},
      conditions: r = {},
      payload: d,
      results: a = {}
    }) {
      let n = !0;
      e.payload = d, t && (e.results[t] = a), r.length && (n = this._compare(r, {
        parentEntry: t,
        instance: e
      }));
      for (let c = 0; c < s.entry.length; c++) {
        const l = s.entry[c], i = s[l];
        let h = i;
        if (i._$id && (h = this.actions[i._$id]), i.conditions && (n = this._compare(i.conditions, {
          parentEntry: t,
          instance: e
        })), Object.hasOwnProperty.call(h, "when") && n !== h.when)
          return;
        if (Object.hasOwnProperty.call(h, "value"))
          return [h.value];
        const p = {
          onSuccess: null,
          onError: null
        };
        Object.hasOwnProperty.call(i, "onSuccess") && (p.onSuccess = {
          params: {
            parentEntry: l,
            actions: {
              entry: i.onSuccess,
              ...s
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        }), Object.hasOwnProperty.call(i, "onError") && (p.onError = {
          params: {
            parentEntry: l,
            actions: {
              entry: i.onError,
              ...s
            },
            instance: e
          },
          method: this._dispatch.bind(this)
        });
        const m = this._action({
          instance: e,
          entry: l,
          actions: s,
          conditions: i.conditions,
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
    _onEvent(o, e, t) {
      let s = t;
      e && (s = { ...e, result: t }), o(s);
    },
    "_process/value"({ params: o, callback: e }) {
      const t = e.onSuccess, s = e.onError, r = o;
      return t && this._onEvent(t.method || t, t.params, r), s && this._onEvent(s.method || s, s.params), r;
    },
    "_process/action"({ name: o, params: e, callback: t }) {
      this.$action(o, e, t);
    },
    "_process/method"({ name: o, params: e, callback: t }) {
      const s = t.onSuccess, r = this.$method(o, e);
      s && this._onEvent(s.method || s, s.params, r);
    }
  }
};
export {
  _ as default
};
