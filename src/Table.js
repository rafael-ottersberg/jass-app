import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import './Table.css'
import jassteppich from "./img/jassteppich.png";
import schieferTafel from "./img/schiefertafel.png";

const initialHandCards = [];
const initialPlayedCards = {"": null};

// fake data generator
function getCards(cards, nm) {
  let items = cards.map((v, k) => ({
    id: `${nm}-${k}`,
    content: v,
  }));

  return items
}

function getCard(card, nm) {
  let items = [{
    id: `${nm}-${0}`,
    content: card
  }];

  return items
}
  

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};


const imageAspectRatio = 247/161;
var imageHeight = 'min(20vh, 247px, 30vw)';
var imageWidth = `calc(${1/imageAspectRatio} * ${imageHeight})`;

const getItemStyle = (isDragging, draggableStyle, numberOfCards, imageHeight, imageWidth) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // change background colour if dragging
  background: isDragging ? 'transparent' : 'transparent',
  width: `min(calc((90vw - ${imageWidth}) / ${numberOfCards-1}), ${imageWidth})`,
  // styles we need to apply on draggables
  height: imageHeight,
  ...draggableStyle,
});

const getListStyle = (isDraggingOver, numberOfCards, imageWidth) => ({
  background: isDraggingOver ? '#0000002e': 'transparent',
  display: 'flex',
  width: (numberOfCards === 1) ? imageWidth : `min(90vw, (min(calc((90vw - ${imageWidth}) / ${numberOfCards-1}), ${imageWidth}) * ${numberOfCards-1}) + ${imageWidth})`,
});

const getPlayedStyle = (isDraggingOver) => ({
  background: isDraggingOver ? '#0000002e': 'transparent',
  display: 'flex'
});

const Table = React.memo(function Table(props) {
  const [played, setPlayed] = useState(getCard(initialPlayedCards[""], "played"));
  const [hand, setHand] = useState(getCards(initialHandCards, "hand"));

  
  const id2List = {
    droppable: hand,
    droppable2: played
  };

  useEffect(() =>{
    setHand(getCards(props.table.handCards, "hand"));
    setPlayed(getCard(props.table.playedCards[props.player], "played"));
  }, [props.table.handCards, props.table.playedCards, props.player]);

  const getList = id => id2List[id];

  const onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
        return;
    }

    if (source.droppableId === destination.droppableId) {
        const items = reorder(
            getList(source.droppableId),
            source.index,
            destination.index
        );

        if (source.droppableId === 'droppable') {
          setHand(items);
          props.onReorder(items.map(item => item.content));
        }
        if (source.droppableId === 'droppable2') {
          setPlayed(items);
        }

    } else if (destination.droppableId === 'droppable2') {
        const result = move(
            getList(source.droppableId),
            getList(destination.droppableId),
            source,
            destination
        );
        console.log(JSON.stringify(result.droppable2))

        console.log(result.droppable2[0].content, result.droppable.map(item => item.content));
        if (result.droppable2[0].content !== "") {
          setHand(result.droppable);
          setPlayed([result.droppable2[0]]);
          props.onPlay(result.droppable2[0].content);         
        }

    } else {
      return;
    }
  };

  var bonus = false;
  if ((props.mode === "sidi") || (props.mode === "zweier")) {
    bonus = true;
  }

  return (
    
    <DragDropContext className="dnd" onDragEnd={onDragEnd}>
      <div className="carpet-section">
        <div 
          className="carpet-container" 
          style={{
            backgroundImage: `url(${jassteppich})`,
            backgroundSize: "cover"
          }}
          onDoubleClick={() => props.onSort()}
        >
        {((props.table.roundState === "stich_finished") || ((props.table.roundState === "play"))) &&
          <CarpetContent
            roundState={props.table.roundState}
            player={props.player}
            orderedPlayers={props.table.orderedPlayers}
            trump={props.table.trump}
            score={props.score}
            lastCardStack={props.table.lastCardStack}
            playedCards={props.table.playedCards}
            playedCard={played}
            onClickStichButton={() => {props.onClickStichButton()}}
          />
        }
        {(props.table.roundState === "define_trump") &&
          <DefineTrump
            onClick={(trump) => {props.onDefineTrump(trump)}}
          />
        }


        {((props.table.roundState === "round_finished") && !bonus) &&
          <RoundScore
            onNextRound={() => {props.onNextRound()}}
            score={props.table.scoreLastRound}
          />
        }
        {((props.table.roundState === "round_finished") && bonus) &&
          <RoundScoreBonus
            onAddBonus={(pointsPerTeam) => props.onAddBonus(pointsPerTeam)}
            onNextRound={() => {props.onNextRound()}}
            score={props.table.scoreLastRound}
          />
        }

        </div>
      </div>
      <hr></hr>
      <Hand 
        hand={hand}
        onPlay={(cards) => props.onPlay(cards)}
        onSort={() => props.onSort()}
      />
      
    </DragDropContext>
  
    
  );
}, rerenderNeeded);

function rerenderNeeded(prevProps, nextProps) {
  //console.log(nextProps)
  let preventRerender = true;

  if (JSON.stringify(prevProps.table.handCards) !== JSON.stringify(nextProps.table.handCards)) {
    preventRerender = false
  }
  else if (JSON.stringify(prevProps.table.playedCards) !== JSON.stringify(nextProps.table.playedCards)) {
    preventRerender = false
  }
  else if (JSON.stringify(prevProps.table.roundState) !== JSON.stringify(nextProps.table.roundState)) {
    preventRerender = false
  }
  else if (JSON.stringify(prevProps.player) !== JSON.stringify(nextProps.player)) {
    preventRerender = false
  }

  else if (nextProps.table.forceRerender) {
    preventRerender = false
  }
  
  return preventRerender
}


function Hand(props) {

  return (
    <div className="hand-container">
    <Droppable droppableId="droppable" direction="horizontal">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(
            snapshot.isDraggingOver,
            props.hand.length,
            imageWidth
          )}
        >
          {props.hand.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style,
                    props.hand.length,
                    imageHeight,
                    imageWidth
                  )}
                >
                  <Card 
                    value={item.content}
                    handleClick={(card) => props.onPlay(card)}
                  />

                </div>
            )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
  )
}

function CarpetContent(props) {
  var players = props.orderedPlayers;
  var playerIndex = players.indexOf(props.player);

  var playerPosition = {
    left: undefined,
    opposite: undefined,
    right: undefined
  };

  switch (players.length) {
    case 2:
      playerPosition = {
        opposite: players[(playerIndex + 1) % 2]
      };
      break;
    case 3:
      playerPosition = {
        right: players[(playerIndex + 1) % 3],
        left: players[(playerIndex + 2) % 3]
      };
      break;
    case 4:
      playerPosition = {
        right: players[(playerIndex + 1) % 4],
        opposite: players[(playerIndex + 2) % 4],
        left: players[(playerIndex + 3) % 4]
      };
      break;

    default:
      break;
  }

  if (props.roundState === "play") {
    var cardType = "french"
    var trumpOptions = {
      'E': cardType + '_e.jpg',
      'H': cardType + '_h.jpg',
      'K': cardType + '_k.jpg',
      'P': cardType + '_p.jpg',
      'unde': 'unde.jpg',
      'obe': 'obe.jpg',
      'slalom_unde': 'slalom_unde.jpg',
      'slalom_obe': 'slalom_obe.jpg',
    }

    var trumpIcon = <img 
      className="trump-icon select-disable" 
      src={"./trump/" + trumpOptions[props.trump]} 
      alt={props.trump + "_icon"}
    />
  }

  return (
    <div className="table-cards wrapper">
      <div className="square"></div>
      <div className="square">
        { (playerPosition.opposite !== undefined) &&
          <div>
            <div className="table-card table-card-vertical">
              <Card value={props.playedCards[playerPosition.opposite]} handleClick={(card) => null}/>
            </div>

            <div className="player-name-container player-name-container-top">
              <p className="player-name vertical">{playerPosition.opposite}</p>
            </div>
          </div>
        }
          
                   
      </div>
      <div className="square">
        <SchieferScore
          score={props.score}
        />
      </div>
      <div className="square">
        
        { (playerPosition.left !== undefined) &&
          <div>
            <div className="player-name-container player-name-container-left">
              <p className="player-name">{playerPosition.left}</p>
            </div>
            <div className="table-card table-card-horizontal">
              <Card value={props.playedCards[playerPosition.left]} handleClick={(card) => null}/>
            </div>
          </div>
        }
        
      </div>
      <div className="square stich-button-container">
        {props.roundState === "stich_finished" &&
          <button className="stich-button" onClick={() => props.onClickStichButton()}>
            Stich abräumen
          </button>
        }
      </div>
      <div className="square">
        { (playerPosition.right !== undefined) &&
          <div>
            <div className="player-name-container player-name-container-right">
              <p className="player-name">{playerPosition.right}</p>
            </div>
            <div className="table-card table-card-horizontal">
              <Card value={props.playedCards[playerPosition.right]} handleClick={(card) => null}/>
            </div>
          </div>
        }
      </div>
      <div className="square"></div>
      <div className="square">
        <div className="player-name-container player-name-container-bot">
          <p className="player-name vertical flip">{props.player}</p>
        </div>
        
        <Droppable droppableId="droppable2" direction="horizontal">
          {(provided, snapshot) => (
            <div
              className="table-card table-card-vertical"
              ref={provided.innerRef}
              style={getPlayedStyle(
                snapshot.isDraggingOver
              )}
            >
              {props.playedCard.map((item, index) => (
                item.content !== null &&
                <Draggable 
                  key={item.id} 
                  draggableId={item.id} 
                  index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style,
                        props.playedCard.length,
                        imageHeight,
                        imageWidth
                      )}
                    >
                      <Card 
                        value={item.content}
                        handleClick={(card) => null}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div className="square trump-icon-container">
        {trumpIcon}
      </div>
    </div>
  )
}

function DefineTrump(props) {
  var cardType = "french"
  var trumpOptions = {
    'E': cardType + '_e.jpg',
    'H': cardType + '_h.jpg',
    'K': cardType + '_k.jpg',
    'P': cardType + '_p.jpg',
    'unde': 'unde.jpg',
    'obe': 'obe.jpg',
    'slalom_unde': 'slalom_unde.jpg',
    'slalom_obe': 'slalom_obe.jpg',
  }

  var trumpChoice = Object.keys(trumpOptions).map((key) => 
    <img
      src={"./trump/" + trumpOptions[key]}
      alt={key}
      className="trump-image select-disable"
      onClick={() => props.onClick(key)}
    />
  );
  
  return (

    <div className="define-trump">
      <div className="trump-container">
      {trumpChoice}
      </div>
    </div>
  )
}

function SchieferScore (props) {
  var score = [];
  for (const [key, value] of Object.entries(props.score)) {
    score.push(<p style={{'padding': '0', 'margin': 0}}><b>{key}</b>: {value}</p>)
  }

  return (
    <div 
      className="schiefer-outer-container"
      style={{
        backgroundImage: `url(${schieferTafel})`,
        backgroundSize: "cover"
      }}>
      <div className="schiefer-inner-container">
        <div className="schiefer-score">
          {score}
        </div>
      </div>
        
    </div>
  )
  
}

function RoundScore(props) {

  var score = [];
  for (const [key, value] of Object.entries(props.score)) {
    score.push(<p className="score-element"><b>{key}</b>: {value}</p>)
  }
  return (
    <div className="score-container">
      <div className="score">
        <p className="score-title"><b>Score last round:</b></p>
        {score}

        <button className="continue-button" onClick={() => props.onNextRound()}>Continue</button>
      </div>
    </div>
    )
}

function RoundScoreBonus(props) {

  const [bonusValue1, setBonusValue1] = useState(0);
  const [bonusValue2, setBonusValue2] = useState(0);

  var pointsTeam = [bonusValue1, bonusValue2];
  var teams = Object.keys(props.score);

  function handleChange1(event) {
    setBonusValue1(Number(event.target.value));
  }
  function handleChange2(event) {
    setBonusValue2(Number(event.target.value));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    var pointsPerTeam = {};
    teams.forEach((key, i) => pointsPerTeam[key] = pointsTeam[i]);

    props.onAddBonus(pointsPerTeam);
    props.onNextRound();
  }


  var title = [<th></th>]
  var points = [<td>Points</td>];
  var bonusRow = <tr>
      <td>Bonus</td>
      <td>
        <input 
          className="bonus-input" 
          value={bonusValue1} 
          type="number" 
          onChange={handleChange1}/>
      </td>
      <td>
        <input 
          className="bonus-input" 
          value={bonusValue2} 
          type="number" 
          onChange={handleChange2}/>
      </td>
    </tr>


  for (const [key, value] of Object.entries(props.score)) {
    title.push(<th>{key}</th>)
    points.push(<td>{value}</td>)
  }

  var table = <table>
    <tr>{title}</tr>
    <tr>{points}</tr>
    {bonusRow}
  </table>
  return (
    <div className="score-container">
      <div className="score">
        <p className="score-title"><b>Score last round:</b></p>
        <form onSubmit={handleSubmit} >
          {table}
          <button className="continue-button" type="submit">Continue</button>
        </form>
      </div>
    </div>
    )
}

export default Table;
