import React from "react";
import '../App.css';
import 'semantic-ui-css/semantic.min.css'
import { Clickable } from 'react-clickable';
import Highlighter from "react-highlight-words";
import KeyboardEventHandler from 'react-keyboard-event-handler';



function formatTime(time) {
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

function align_segment(time, segment_starts, mid_indexes) {
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



export default class Segments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverPreview: false,
            starts: [], 
            mid_indexes: [],
            current_level: 0,
        };

        this.state.handleKey = this.handleKey.bind(this);
    }

    componentDidMount() {
      var json = require('../GMVbQ1UsMP8.json');
      var starts = [];
      var contents = [];
      for (var i = 0, l = json.length; i < l; i++) {
        var node = json[i];
        starts.push(node['start']);
        contents.push(node['content']);
      }

      json = require('../mid_level.json');
      var mid_indexes = [];
      var mid_contents = [];
      for (var i = 0, l = json.length; i < l; i++) {
        node = json[i];
        mid_indexes.push(node['index']);
        mid_contents.push(node['content']);
      }
      console.log("here", mid_indexes);
      this.setState({starts: starts, contents:  contents, mid_indexes: mid_indexes, mid_contents: mid_contents});
    }


    handleKey = (key, jumpVideo, current_idx) => {
      console.log(key, current_idx);
      if(this.state.current_level === 1){
        switch (key) {
          case 'left':
            var time = this.state.starts[this.state.mid_indexes[current_idx <= 0? 0 : current_idx-1]]
            console.log("should jump  to time", time);
            jumpVideo(time, true);
            break;
          case 'right':
            var len = this.state.mid_indexes.length;
            var time = this.state.starts[this.state.mid_indexes[current_idx === len? current_idx : current_idx+1]]

            jumpVideo(time, true);
            break;
          case 'down':
            this.setState({current_level: 0});
            break;
        }
      }
      else{
        switch (key) {
          case 'left':
            var time = this.state.starts[current_idx-1]
            console.log("should jump  to time", time);
            jumpVideo(time, true);
            break;
          case 'right':
            var len = this.state.starts.length;
            var time = this.state.starts[current_idx+1]

            console.log("should jump  to time", time);
            jumpVideo(time, true);
            break;
          case 'up':
            this.setState({current_level: 1});
            break;
        }
      }
    }


    render() {
        const { videoID, videoTime, jumpVideo} = this.props;
        const { current_level, starts, contents, mid_indexes, mid_contents} = this.state;
        const [current_idx, current_mid_idx] = align_segment(videoTime, starts, mid_indexes);
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
                      <div className="text-option-item">
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