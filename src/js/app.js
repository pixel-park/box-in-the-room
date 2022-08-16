import { Viewer } from './viewer.js';

const genInfo = document.getElementById('general-info');
const linkInfo = document.getElementById('discripe');

const adrs = ['https://plnup.com/configurator/', 'https://github.com/pixel-park/box-in-the-room', 'https://pixel-park.github.io/', 'https://angry-goldberg-208d05.netlify.app/'];

const info = [
  `This was a quick challenge to prove the possibility of having a high-performance and photorealistic configurator for the web.
  It took around 12 days for the whole thing. From taking some pictures as a base for 3d modeling to deploying the code \n The configurator itself has nothing special but there are two solutions that make this app different from the others:

  1_ Environment based on the real pictures (I used pictures of the room we are living in at the moment). The better-looking place would look more attractive. This particular room changes its height based on the height of the closet.
  2_ Different method of camera control (not three-js OrbitControls) which avoids the user going to unwanted spots (inside of geometries such as walls or bed in this example) and at the same time keeps the variety and freedom to move the camera in all directions. As the result, you keep everything you need the focus avoiding surprises.
  
  I used a little PHP doing some back-end so you can save your projects and load them after via hash keys in the link.
  Also, you can download a 3d model of what you made, and each time you press the save button a list of an object will appear in the console just to show the source from which the object is made.
  There is no problem to create a list of details for real production based on the geometries dimensions used in the scene as they are 100% accurate.
  I made everything on plain js and threejs just for learning purposes. I didn't take care of the design part. Used standard buttons etc. as the design wasn't the main goal.`,

  `This is the GitHub repository for this particular task`,

  `My online cv :)`,

  `This is a kind of menu but it looks like a double floor small city. Each room act like a menu item. So clicking on it you will go to the proper page or click on the elevator to travel between floors (In this demo, you will just zoom in to the selected room without any transition to the page because I just wanted to share this part, which is fully done by me). You can try it on mobile phones to have different navigation experiments. \n
  The tricky part for this project was to have all those tiny animations (curtains, birds, clouds animations) with high performance and to save the source 2d look of everything as the client asked.
  This project was implemented to "Vue.js".`,

]
let index = 0;

const viewer = new Viewer({
    dom: ".viewer",
    cb: ()=>{
      window.open(adrs[index],'popup','width=840,height=600');
      genInfo.innerText = `oppening  "${adrs[index]}"...  ${(adrs.length - 1 - index)} addresses are left.`;
      linkInfo.innerText = info[index];
      index = index >= adrs.length - 1 ? 0 : index + 1;
    }
  });
  viewer.run();
  viewer.render()

  