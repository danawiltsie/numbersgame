import React, { Component } from 'react'
import _ from 'lodash'
import './App.css'


const possibleCombinationSum = (array, target) => {

  if(array.indexOf(target) >= 0) return true //target is in the array
  if(array[0] > target || array.length === 1) return false //all numbers are too large or the only element is not the solution
  for(let i = array.length -1; i >= 0; i--){
    if(array[i] < target) break
    if(array[i] > target){
      array.pop()
    }
  }// pop elements that are too large from the end of the array
  for(let x = 0; x < (1 << array.length); x++){
    let sum = 0;
    for(let y = 0; y < array.length; y++){
      if(x & (1 << y)) sum += array[y]
    }
    if(sum === target) return true
  }
  return false 
  // this last for loop is something I don't yet understand and should review

}

const Stars = (props) => {

  return (
    <div className="col-xs-5">
      {_.range(props.numberOfStars).map((star, i) => 
        <i key={i} className="fa fa-star"></i>
      )}
    </div>
  )

}

const Time = (props) => {

  return(
    <div classname="well">
      {props.seconds}
    </div>
  )
}

class Numbers extends Component { 

  numberClassName = (number) => {
    if(this.props.selectedNumbers.indexOf(number) >= 0) {
      return 'selected'
    }
    if(this.props.usedNumbers.indexOf(number) >= 0) {
      return 'used'
    }
  }

  handleClick = (number) => {
    this.props.selectNumber(number)
  }

  render(){

    return(
      <div className="card text-center">
        <div>
          {Numbers.list.map((number, i) => 
            <span className={this.numberClassName(number)} 
              key={i} 
              onClick={() => this.handleClick(number)}>
              {number}
            </span>
          )}
        </div>
      </div>
    )
  }

}

Numbers.list = _.range(1,10)


const Button = (props) => {

  let button;
  let redrawButton;

  switch(props.answerIsCorrect) {

    case true:
      button = 
        <button className="btn btn-success answer" onClick={props.acceptAnswer}>
          <i className="fa fa-check"></i>
        </button>
      break;

    case false:
      button = 
        <button className="btn btn-danger answer">
          <i className="fa fa-times"></i>
        </button>
      break;

    default:
      button = 
        <button className="btn btn-default answer" onClick={props.checkAnswer} disabled={!props.selectedNumbers.length}>
          =
        </button>
      break;
  }

  if(props.redraws > 0){
    redrawButton =
      <button onClick={props.redrawStars} className="btn btn-primary btn-sm redraw">
        <i className="fa fa-refresh"></i> {props.redraws}
      </button>
  } else {
    redrawButton =
      <button className="btn btn-sm redraw" disabled>
        <i className="fa fa-refresh"></i> {props.redraws}
      </button>
  }

  return (
    <div className="col-xs-2">
      <div>{button}</div>
      <div>{redrawButton}</div>
    </div>
  )

}

const Answer = (props) => {

  return (
    <div className="col-xs-5">
      {props.selectedNumbers.map((number, i) => 
        <span key={i} 
          onClick={()=> props.revokeNumber(number)} 
          className="selected">{number}
        </span>
      )}
    </div>
  )

}

const DoneFrame = (props) => {

  return(
    <div className="DoneFrame text-center">
      <div>
        <h2>{props.doneStatus}</h2>
      </div>
      <button onClick={props.resetGame} className="btn btn-primary">
        <i className="fa fa-refresh"></i>
      </button>
    </div>
  )

}

class Game extends Component {

  static randomStars = () => Math.ceil(Math.random()*9)

  static initialState = () => ({
    selectedNumbers: [],
    usedNumbers: [],
    numberOfStars: Game.randomStars(),
    answerIsCorrect: null,
    redraws: 5,
    doneStatus: null,
    timesUp: false,
    seconds: 60
  })

  state = Game.initialState()

 

  resetGame = () => this.setState(Game.initialState)

  updateDoneStatus = () => {
    this.setState(prevState => {
      if(prevState.usedNumbers.length === 9) {
        clearInterval(this.interval)
        this.interval = null
        return{ doneStatus: 'You Win!' }
      }
      if(prevState.redraws === 0 && !this.possibleSolutions(prevState)){
        clearInterval(this.interval)
        this.interval = null
        return{ doneStatus: 'GameOver!'}
      }
      if(this.state.timesUp === true){
        clearInterval(this.interval)
        this.interval = null
        return{ doneStatus: "Time's Up!"}
      }
    })
  }

  updateTimesUp = () => {
    this.setState({
      timesUp: true
    }, this.updateDoneStatus)
  }

  possibleSolutions = ({numberOfStars, usedNumbers}) => {
    const possibleNumbers = _.range(1,10).filter(number =>
     usedNumbers.indexOf(number) === -1
    )
    return possibleCombinationSum(possibleNumbers, numberOfStars)
  }

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.numberOfStars === prevState.selectedNumbers.reduce((number, n) => number + n, 0)
    }))
  }

  selectNumber = (clickedNumber) => {
    if(this.state.selectedNumbers.indexOf(clickedNumber) < 0){
      this.setState(prevState => ({
        answerIsCorrect: null,
        selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
      }))
    } 
  }

  acceptAnswer = () => {
    this.setState(prevState =>({
      usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      numberOfStars: Game.randomStars()
    }), this.updateDoneStatus)
    
  }

  revokeNumber = (clickedNumber) => {
    let index = this.state.selectedNumbers.indexOf(clickedNumber)
    if(index >= 0){
      this.setState(prevState => ({
        answerIsCorrect: null,
        selectedNumbers: prevState.selectedNumbers
          .filter((number) => number !== clickedNumber)
      }), this.updateDoneStatus)
    }
  }

  redrawStars = () => {
    this.setState(prevState => ({
      numberOfStars: Game.randomStars(),
      redraws: prevState.redraws - 1,
      answerIsCorrect: null
    }))
    this.updateDoneStatus()
  }

  startTimer = () => {
    this.interval = setInterval(this.timer, 1000)
  }

  timer = () => {
    if(!this.state.doneStatus && this.state.seconds > 0){
      this.setState(prevState => ({
        seconds: prevState.seconds - 1
      }), () => {
        if(this.state.seconds === 0 || this.state.doneStatus){
          this.updateTimesUp()
        }
      })
    }
  }

  handleClick = () => {
    if(this.interval === null){
      this.startTimer()
    }
  }

  render(){
    return (
      <div className="container fluid">
        <h3>Stars Game</h3>
        <hr></hr>
        <div className="row">
          <Stars numberOfStars={this.state.numberOfStars} />
          <Button selectedNumbers={this.state.selectedNumbers}
                  checkAnswer={this.checkAnswer}
                  answerIsCorrect={this.state.answerIsCorrect} 
                  acceptAnswer={this.acceptAnswer}
                  redraws={this.state.redraws}
                  redrawStars={this.redrawStars}
          />
          <Answer selectedNumbers={this.state.selectedNumbers} 
            revokeNumber={this.revokeNumber}
          />
        </div>
        <br />
        {this.state.doneStatus ?
          <DoneFrame doneStatus={this.state.doneStatus}
            resetGame={this.resetGame}/> :
          <Numbers 
            selectedNumbers={this.state.selectedNumbers}
            selectNumber={this.selectNumber} 
            usedNumbers={this.state.usedNumbers}
            doneStatus={this.state.doneStatus}
          />
        } 
        <Time />
      </div>
    )
  }

}

Game.interval = null

class App extends Component {

  render() {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }

}

export default App;
