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
let aggrolist = new Vue({
  el: '#aggrolist',
  data: {
    updated: false,
    locked: false,
    collapsed: false,
    combatants: null,
    hide: false,
  },
  attached: function () {
    window.addOverlayListener('EnmityAggroList', this.update);
    document.addEventListener('onOverlayStateUpdate', this.updateState);
    window.startOverlayEvents();
  },
  detached: function () {
    window.removeOverlayListener('EnmityAggroList', this.update);
    document.removeEventListener('onOverlayStateUpdate', this.updateState);
  },
  methods: {
    update: function (enmity) {
      this.updated = true;

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
            if(a.isOwner == true && b.isOwner == false) return -1
            if(a.isOwner == false && b.isOwner == true) return 1
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
      this.combatants.sort((a, b) => b.HateRate - a.HateRate);
    },
    updateState: function (e) {
      this.locked = e.detail.isLocked;
    },
    toggleCollapse: function () {
      this.collapsed = !this.collapsed;
    },
  },
});
