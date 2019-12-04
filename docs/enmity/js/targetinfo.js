'use strict'

let targets = ['Target', 'Focus', 'Hover', 'TargetOfTarget'];

let localeStrings = {
  'English': {
    target: 'Target',
    distance: 'Distance',
    titles: {
      Target: 'Target',
      Focus: 'Focus',
      Hover: 'Hover',
      TargetOfTarget: 'ToT',
    },
  },
  'Japanese': {
    target: 'ターゲット',
    distance: '距離',
    titles: {
      Target: 'ターゲット',
      Focus: 'フォーカス',
      Hover: 'ホバー',
      TargetOfTarget: 'TT',
    },
  },
};

let vue = new Vue({
  el: '#vue',
  data: {
    updated: false,
    hide: false,
    locked: false,
    collapsed: false,
    targets: [],
    strings: {},
  },
  mounted: function () {
    this.$nextTick(function () {
      window.callOverlayHandler({ call: 'getLanguage' }).then((msg) => {
        if (msg.language in localeStrings)
          this.strings = localeStrings[msg.language];
        else
          this.strings = localStrings['English'];

        window.addOverlayListener('EnmityTargetData', this.update);
        document.addEventListener('onOverlayStateUpdate', this.updateState);
        window.startOverlayEvents();
      });
    });
  },
  destroyed: function () {
    this.$nextTick(function () {
      window.addOverlayListener('EnmityTargetData', this.update);
      document.removeEventListener('onOverlayStateUpdate', this.updateState);
    });
  },
  methods: {
    update: function (enmity) {
      this.targets = [];
      for (let k of targets) {
        let t = enmity[k];
        if (t == null) {
          t = {
            Name: 'none',
            MaxHP: 0,
            CurrentHP: 0,
            Distance: 0,
          };
        }
        t.Key = this.strings.titles[k];
        this.targets.push(t);
      }
      this.updated = true;
    },
    updateState: function (e) {
      this.locked = e.detail.isLocked;
    },
    hppercent: function (entity) {
      if (!entity) return '--';
      if (entity.MaxHP <= 0) return '0.00';
      return (100.0 * entity.CurrentHP / entity.MaxHP).toFixed(2);
    },
    toggleCollapse: function () {
      this.collapsed = !this.collapsed;
    },
  },
});
