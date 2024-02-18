const myButton = document.createElement('astro-dev-toolbar-button');
myButton.textContent = 'Click me!';
myButton.buttonStyle = "purple";
myButton.size = "medium";

myButton.addEventListener('click', () => {
  console.log('Clicked!');
});