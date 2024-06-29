import { THREE } from './threeImport.js';

 const colors = [
     0xFF0000, // Red
     0x00FF00, // Green
     0x0000FF, // Blue
     0xFFFF00, // Yellow
     0xFF00FF, // Magenta
     0x00FFFF, // Cyan
     0xFFA500, // Orange
     0x800080, // Purple
     0xFFFFFF, // White
     0x000000  // Black
 ];

 let selectedColorIndex = 0;

 export function createColorSelector(container) {
     const selectorContainer = document.createElement('div');
     selectorContainer.style.position = 'absolute';
     selectorContainer.style.top = '10px';
     selectorContainer.style.left = '10px';
     selectorContainer.style.display = 'flex';
     selectorContainer.style.flexWrap = 'wrap';
     selectorContainer.style.maxWidth = '200px';

     colors.forEach((color, index) => {
         const colorButton = document.createElement('div');
         colorButton.style.width = '40px';
         colorButton.style.height = '40px';
         colorButton.style.backgroundColor = '#' + color.toString(16).padStart(6, '0');
         colorButton.style.margin = '5px';
         colorButton.style.cursor = 'pointer';
         colorButton.style.border = '2px solid black';

         colorButton.addEventListener('click', () => {
             selectedColorIndex = index;
             updateSelectedColor();
         });

         selectorContainer.appendChild(colorButton);
     });

     container.appendChild(selectorContainer);
     updateSelectedColor();
 }

 function updateSelectedColor() {
     const colorButtons = document.querySelectorAll('#lobby-container > div > div');
     colorButtons.forEach((button, index) => {
         if (index === selectedColorIndex) {
             button.style.border = '2px solid white';
         } else {
             button.style.border = '2px solid black';
         }
     });
 }

 export function getSelectedColor() {
     return colors[selectedColorIndex];
 }