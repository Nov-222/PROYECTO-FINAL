import Block from './core/Block';
import { renderDOM } from './core/renderDOM';

class Button extends Block {
  protected template = `<button id="test-btn">{{text}}</button>`;
}

const myBtn = new Button({ 
  text: "Haz clic en Vanilla JS",
  events: { click: () => alert("¡El motor funciona!") } 
});

renderDOM('#app', myBtn);