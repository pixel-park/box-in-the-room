import { Viewer } from './viewer.js';

const genInfo = document.getElementById('general-info');

const adrs = ['https://plnup.com/configurator/', 'https://github.com/pixel-park/box-in-the-room', 'https://pixel-park.github.io/', 'https://angry-goldberg-208d05.netlify.app/', 'https://stupendous-dusk-cc1d16.netlify.app/', 'https://jovial-shaw-084749.netlify.app/'];
let index = 0;

const viewer = new Viewer({
    dom: ".viewer",
    cb: ()=>{
      window.open(adrs[index],'popup','width=840,height=600');
      genInfo.innerText = `oppening  "${adrs[index]}"...  ${(adrs.length - 1 - index)} addresses are left.`
      index = index >= adrs.length - 1 ? 0 : index + 1;
    }
  });
  viewer.run();
  viewer.render()

  