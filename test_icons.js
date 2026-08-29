const icons = require('payments-icons-library');
const apps = ['bhim', 'bharatpe', 'kotak', 'payzapp', 'freecharge', 'mobikwik'];
for (const a of apps) {
  console.log(a, icons.getIcon(a, 'svg').icon_name);
}
