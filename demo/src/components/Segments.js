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
            current_level: 0,
            test_idx: 0,
            key_count: 0,
            cur_count: 0,
            timestamp: 0
        };

        this.handleKey = this.handleKey.bind(this);
        this.align_segment = this.align_segment.bind(this);
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
                     console.log("Event voiceschanged", voices)
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

        var closest_past = Math.max.apply(Math, props.starts.filter(function(x, index){return x <= props.entered_time}));
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
      console.log(key, current_idx, this.state.current_level);
      var new_idx;
      if(this.state.current_level === 1){
        switch (key) {
          case 'left':
            new_idx = current_idx <= 0? 0 : current_idx-1;
            var time = this.props.starts[this.props.mid_indexes[new_idx]];
            jumpVideo(time, true);
            break;
          case 'right':
            new_idx = current_idx === len? current_idx : current_idx+1;
            var len = this.props.mid_indexes.length;
            var time = this.props.starts[this.props.mid_indexes[new_idx]];
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
                text: "Go back" + (this.props.starts[current_idx] - time).toString() +"seconds"
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
            jumpVideo(time, true);
            current_idx = new_idx;
            break;
          case 'right':
            //new_idx = current_idx + 1;
            //Home.setState({playing: false});
            var date = new Date();
            var cur_timestamp=date.getTime();
            new_idx = this.state.test_idx + 1;
            var time = this.props.starts[new_idx];
            //key_count === 0
            this.status.cur_count = this.state.key_count + 1;
            if (this.status.cur_count ===1 && this.state.key_count ===0 && this.state.timestamp ===0){
              this.state.timestamp = cur_timestamp;
              //this.state.speech.speak({text: "wait"})
              this.state.key_count = 1;
            }
            if (this.status.cur_count === 2 && this.state.key_count ===1){
              if(cur_timestamp - this.state.timestamp < 1000){
                this.state.speech.speak({text: "Keywords"});
                this.state.key_count = 0;
                this.state.cur_count = 0;
                this.status.timestamp = 0;
              }
            }

            if (this.status.cur_count === 2 && this.state.key_count ===1){
              if(cur_timestamp - this.state.timestamp >= 1000){
                this.state.speech.speak({text: "Sentences"});
                this.state.timestamp = cur_timestamp;
                this.status.cur_count = 1;
                this.state.key_count = 1;
              }
            }

            //break;
            
            //this.state.speech.stop();
            //console.log("Stop the speech !")

            // this.state.speech.speak({
            //     text: "Skipped" + (this.props.starts[new_idx] - this.props.starts[current_idx]).toString() + "seconds"
            // }).then(() => {
            //     console.log("Success !")
            // }).catch(e => {
            //     console.error("An error occurred :", e)
            // })
            // this.state.speech.speak({
            //     text: this.props.dynamic[new_idx].toString()
            // }).then(() => {
            //     console.log("Success !")
            // }).catch(e => {
            //     console.error("An error occurred :", e)
            // })
            jumpVideo(time, true);
            current_idx = new_idx;
            this.state.test_idx = current_idx;
            // //Home.setState({playing: true});
            break;
          case 'up':
            this.state.speech.speak({
                text: "scene level"
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
            this.setState({current_level: 1});
            return;
        }
      }
    }

    align_segment(time, segment_starts, mid_indexes) {
      time = Math.round(time);
      time = !time ? 0 : time;
      var closest_past = Math.max.apply(Math, segment_starts.filter(function(x, index){return x <= time}));
      var closest_index = segment_starts.findIndex( x => x == closest_past );
      var closest_mid_past = Math.max.apply(Math, mid_indexes.filter(function(x){return x <= closest_index + 1}));
      var closest_mid_index = mid_indexes.findIndex( x => x == closest_mid_past );
      console.log(closest_mid_past,  closest_mid_index);
      closest_index = closest_index < 0? 0 : closest_index;
      closest_mid_index = closest_mid_index < 0? 0: closest_mid_index;
      return [closest_index, closest_mid_index];
    }


    render() {
        const { videoID, videoTime, jumpVideo, starts, contents, mid_indexes, mid_contents, dynamic} = this.props;
        const { current_level } = this.state;
        const [current_idx, current_mid_idx] = this.align_segment(videoTime, starts, mid_indexes);
        if (current_level === 1){
          return(
            <div className="segments-container">
              <KeyboardEventHandler
                handleKeys={['left', 'up', 'right', 'down']}
                onKeyEvent={(key, e) => this.handleKey(key, jumpVideo, current_mid_idx)} />
                {mid_indexes.slice(current_mid_idx, current_mid_idx + 4).map((mid_index, idx) => {
                    var keywords = []
                    return(
                      <Clickable onClick={() => this.onClick(mid_index-1)}>
                      <div className="mid-text-option-item">
                        <div className="text-option-text">
                          <div className="text-option-meta">
                            <div className="time-option">
                            {formatTime(starts[mid_index-1])} 
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
                      </Clickable>  )
                     })}
                    
            </div>)
        }
        
        return (
            <div className="segments-container">
              <KeyboardEventHandler
                handleKeys={['left', 'up', 'right', 'down']}
                onKeyEvent={(key, e) => this.handleKey(key, jumpVideo, current_idx)} />
                {starts.slice(current_idx, current_idx + 4).map((time, idx) => {
                    var index = current_idx + idx;
                    var keywords = []
                    var tokenized_subtitle = contents[index].split(" ")
                    var i = tokenized_subtitle.indexOf("");
                    if (i !== -1) tokenized_subtitle.splice(i, 1);
                    if (contents[index].length > 160 && !contents[index].includes('...') ){
                      var joined = tokenized_subtitle.join(' ');
                      contents[index] = joined;
                    }
                    return(
                      <Clickable onClick={() => this.onClick(index)}>
                      <div className="text-option-item">
                        <div className="text-option-text">
                          <div className="text-option-meta">
                            <div className="time-option">
                            {formatTime(time)} 
                            </div>
                          </div>
                          <div className="text-option">
                          <Highlighter
                              searchWords={keywords}
                              autoEscape={true}
                              textToHighlight={contents[index]}
                          />
                          </div>
                        </div>
                      </div>
                      </Clickable> )
                     })}
            </div>
        );
    }};