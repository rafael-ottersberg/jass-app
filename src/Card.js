import React from 'react';
import './Card.css';

function Card(props) {

  const path = "./cards/french/"

  var colors = {
    "P": "pik",
    "H": "herz",
    "E": "karo",
    "K": "kreuz"
  }

  function getImage() {
    //console.log(props.value)

    var cardSplit = props.value.split("/");
    var colorName = colors[cardSplit[0]];
    var value = 14 - parseInt(cardSplit[1]);

    return path + colorName + value.toString() + "$.gif";

  }

  return (
    <div>
      {(props.value !== undefined) && (props.value !== null) && (props.value !== "")?
      <img 
      className="card" 
      alt={`Card: ${props.value}`} 
      src={getImage()} 
      onClick={() => {
        props.handleClick(props.value);
      }}
      onDbl
      />
      :
      <div/>}
    </div>
    
  );
}


export default Card;
