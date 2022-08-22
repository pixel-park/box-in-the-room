import { Viewer } from './viewer.js';

const genInfo = document.getElementById('general-info');
const linkInfo = document.getElementById('discripe');

const adrs = ['https://pixel-park.github.io/', 'https://liveclock.net/fullScreen.php'];

const info = [  
  `My online cv :)`,

  `I am not really sure what you mean by a "window within the same 3D window", hopefully, this one is what you need. `
]
let index = 0;

const viewer = new Viewer({
    dom: ".viewer",
    cb: ()=>{
      
      const mom = viewer.cssRenderer.domElement.firstChild.firstChild;
      if(mom.firstChild){
        mom.firstChild.classList.add('frame_close');
      } 
        viewer.cameraToOpen();
        winModal(mom);
      
      genInfo.innerText = `oppening  "${adrs[index]}"...  ${(adrs.length - 1 - index)} addresses are left.`;
      linkInfo.innerText = info[index];
    }
  });
  viewer.run()
  


  const winModal = (mother) => {
    let delay = 2000;
    const childish = mother.firstChild;
    if(childish){
      delay = 1000;
      setTimeout(()=>{mother.removeChild(childish)},delay);
    }
    
    const dimention = [mother.offsetWidth, mother.offsetHeight];
    const wrapper = document.createElement('div');
    wrapper.classList.add('iframe__wrapper');
    const frame = document.createElement('iframe');
    Object.assign(frame,{
      src: adrs[index],
      width: dimention[0],
      height: dimention[1],
    });
    frame.style.border = 'none';
    setTimeout(()=>{
      wrapper.style.backgroundColor = 'white';
      wrapper.classList.add('frame_open');
      index = index >= adrs.length - 1 ? 0 : index + 1;
    },delay)

    wrapper.appendChild(frame);
    mother.appendChild(wrapper);
  }
  