'use strict'

let vue = new Vue({
  el: '#vue',
  data: {
    updated: false,
    locked: false,
    collapsed: false,
    combatants: null,
    hide: false,
  },
  mounted: function () {
    this.$nextTick(function () {
      window.addOverlayListener('EnmityAggroList', this.update);
      document.addEventListener('onOverlayStateUpdate', this.updateState);
      window.startOverlayEvents();
    });
  },
  destroyed: function () {
    this.$nextTick(function () {
      window.removeOverlayListener('EnmityAggroList', this.update);
      document.removeEventListener('onOverlayStateUpdate', this.updateState);
    });
  },
  methods: {
    update: function (enmity) {
      this.updated = true;
      this.combatants = enmity.AggroList || [];

      // Sort by aggro, descending.
      this.combatants.sort((a, b) => b.HateRate - a.HateRate);
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
