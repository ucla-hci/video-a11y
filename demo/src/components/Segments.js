import React from "react";
import '../App.css';
import 'semantic-ui-css/semantic.min.css'
import { Clickable } from 'react-clickable';
import Highlighter from "react-highlight-words";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Speech from "speak-tts";




function formatTime(time) {
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}




export default class Segments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverPreview: false,
        };

        this.handleKey = this.handleKey.bind(this);
    }

    componentDidMount() {
      const speech = new Speech();
        if(speech.hasBrowserSupport()) { // returns a boolean
            console.log("speech synthesis supported")
        }
        speech.init({
            'volume': 1,
             'lang': 'en-GB',
             'rate': 1.3,
             'pitch': 1,
             'voice':'Google UK English Male',
             'splitSentences': true,
             'listeners': {
                 'onvoiceschanged': (voices) => {
                    //  console.log("Event voiceschanged", voices)
                 }
             }}).then((data) => {
            // The "data" object contains the list of available voices and the voice synthesis params
            console.log("Speech is ready, voices are available", data)
        }).catch(e => {
            console.error("An error occured while initializing : ", e)
        })
        this.setState({speech: speech});
    }
    static getDerivedStateFromProps(props, current_state) {
      if (current_state.entered_time !== props.entered_time) {
        if(!current_state.speech) return;

        var closest_past = Math.max.apply(Math, props.scene_starts.filter(function(x, index){return x <= props.entered_time}));
        var closest_index = props.starts.findIndex( x => x == closest_past );
        var closest_mid_past = Math.max.apply(Math, props.mid_indexes.filter(function(x){return x <= closest_index + 1}));
        var closest_mid_index = props.mid_indexes.findIndex( x => x == closest_mid_past );
        closest_mid_index = closest_mid_index < 0? 0: closest_mid_index;
        current_state.speech.speak({
            text: props.mid_contents[closest_mid_index]
        }).then(() => {
            console.log("Success !")
        }).catch(e => {
            console.error("An error occurred :", e)
        })
        current_state.entered_time = props.entered_time;
        current_state.current_level = 1;
      }
      return null
    }


    handleKey = (key, jumpVideo, current_idx) => {
      console.log(key, current_idx, this.props.current_level);
      var new_idx;
      if(this.state.current_level === 1){
        switch (key) {
          case 'left':
            new_idx = current_idx <= 0? 0 : current_idx-1;
            var time = this.props.scene_starts[this.props.mid_indexes[new_idx]];
            jumpVideo(time, true);
            break;
          case 'right':
            new_idx = current_idx === len? current_idx : current_idx+1;
            var len = this.props.mid_indexes.length;
            var time = this.props.scene_starts[this.props.mid_indexes[new_idx]];
            console.log(time);
            jumpVideo(time, true);
            break;
          case 'down':
            this.setState({current_level: 0});
            return;
        }
        this.state.speech.speak({
            text: this.props.mid_contents[new_idx].toString()
        }).then(() => {
            console.log("Success !")
        }).catch(e => {
            console.error("An error occurred :", e)
        })
      }
      else{
        switch (key) {
          case 'left':
            new_idx = current_idx-1;
            var time = this.props.starts[new_idx];
            this.state.speech.speak({
                text: "Go back" + (this.props.scene_starts[current_idx] - time).toString() +"seconds"
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
            jumpVideo(time, true);
            break;
          case 'right':
            new_idx = current_idx + 1;
            var time = this.props.scene_starts[new_idx];
            // this.state.speech.speak({
            //     text: "Skipped" + (this.props.scene_starts[new_idx] - this.props.scene_starts[current_idx]).toString() + "seconds"
            // }).then(() => {
            //     console.log("Success !")
            // }).catch(e => {
            //     console.error("An error occurred :", e)
            // })
            this.state.speech.speak({
                text: this.props.dynamic[new_idx].toString()
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
            jumpVideo(time, true);
            break;
          case 'up':
            this.setState({current_level: 1});
            return;
        }
      }
    }



    render() {
        const { videoID, videoTime, jumpVideo, scene_starts, scene_labels, mid_indexes, mid_contents, current_idx, current_mid_idx, current_level} = this.props;
        if (current_level === 1){
          return(
            <div className="segments-container">
                {mid_indexes.slice(current_mid_idx, current_mid_idx + 4).map((mid_index, idx) => {
                    var keywords = []
                    return(
                      <div onClick={() => this.onClick(mid_index-1)}>
                      <div className="mid-text-option-item">
                        <div className="text-option-text">
                          <div className="text-option-meta">
                            <div className="time-option">
                            {formatTime(scene_starts[mid_index-1])} 
                            </div>
                          </div>
                          <div className="text-option">
                          <Highlighter
                              searchWords={keywords}
                              autoEscape={true}
                              textToHighlight={mid_contents[current_mid_idx + idx]}
                          />
                          </div>
                        </div>
                      </div>
                      </div>  )
                     })}
                    
            </div>)
        }
        
        return (
            <div className="segments-container">
                {scene_starts.slice(current_idx, current_idx + 4).map((time, idx) => {
                    var index = current_idx + idx;
                    var keywords = []
                    return(
                      <div >
                      <div className="text-option-item">
                        <div className="text-option-text">
                          <div className="scene-number">
                            Scene #{scene_labels[index]} 
                          </div>
                          <div className="scene-time">
                           {formatTime(time)} 
                          </div>
                          <div className="text-option">

                          </div>
                        </div>
                      </div>
                      </div> )
                     })}
            </div>
        );
    }};