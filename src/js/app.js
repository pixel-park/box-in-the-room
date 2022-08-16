import { Viewer } from './viewer.js';
const adrs = ['https://plnup.com/configurator/', 'https://pixel-park.github.io/'];
let index = 0;
let direction = 1;
const viewer = new Viewer({
    dom: ".viewer",
    cb: ()=>{
      window.open(adrs[index],'popup','width=840,height=600');
      console.log('oppening ' + adrs[index])
      if(index >= adrs.length - 1){
        direction = -1;
      }
      if(index <= 0){
        direction = 1
      }
      index += direction;
    }
  });
  viewer.run();
  viewer.render()