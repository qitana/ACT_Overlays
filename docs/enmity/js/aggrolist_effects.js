'use strict'

var effectsDatabase = [];
var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    if (this.response) {
      effectsDatabase = this.response;
      console.log('Loaded: effects.json');
    }
  }
}
xmlHttpRequest.open('GET', '../data/json/effects.json', true);
xmlHttpRequest.responseType = 'json';
xmlHttpRequest.send(null);

// init Vue
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
      if (enmity && enmity.AggroList) {
        enmity.AggroList.forEach(aggro => {
          aggro.Effects.forEach(effect => {
            if (effect.BuffID > 0) {

              if (effect.Stack == 0) {
                effect.Icon = '../data/' + effectsDatabase.find(x => x.id == effect.BuffID).icon;
              } else {
                let stackIcons = effectsDatabase.find(x => x.id == effect.BuffID).stackIcons;
                if (stackIcons.length == 0) {
                  effect.Icon = '../data/' + effectsDatabase.find(x => x.id == effect.BuffID).icon;
                } else {
                  effect.Icon = '../data/' + effectsDatabase.find(x => x.id == effect.BuffID).stackIcons.find(x => x.stack == effect.Stack).icon;
                }
              }
            }
          })
          aggro.Effects.sort((a, b) => {
            if (a.isOwner == true && b.isOwner == false) return -1
            if (a.isOwner == false && b.isOwner == true) return 1
            return b.Timer - a.Timer
          })
        })
      }

      // hide if no AggroList
      this.combatants = enmity.AggroList || [];
      if (this.combatants.length == 0) {
        this.hide = true;
      } else {
        this.hide = false;
      }

      // Sort by aggro, descending.
      this.combatants.sort((a, b) => {
        if (enmity.EnmityHudList) {
          let a1 = enmity.EnmityHudList.map(x => x.ID).includes(a.ID);
          let b1 = enmity.EnmityHudList.map(x => x.ID).includes(b.ID);
          if (a1 && b1) {
            let a2 = enmity.EnmityHudList.find(x => x.ID == a.ID);
            let b2 = enmity.EnmityHudList.find(x => x.ID == b.ID);
            return a2.Order - b2.Order;
          } else if (a1) {
            return -1;
          } else if (b1) {
            return 1;
          }
        }
        return b.HateRate - a.HateRate
      });

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
