import React from "react";
import '../App.css';
import 'semantic-ui-css/semantic.min.css'
import { Clickable } from 'react-clickable';
import Highlighter from "react-highlight-words";



function formatTime(time) {
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

function align_segment(time, segment_starts) {
  time = Math.round(time);
  time = !time ? 0 : time;
  var closest_past = Math.max.apply(Math, segment_starts.filter(function(x, index){return x <= time}));
  var closest_index = segment_starts.findIndex( x => x == closest_past );
  return  closest_index;
}


export default class Segments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverPreview: false,
            starts: []
        };

        this.showPreview = this.showPreview.bind(this);
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
      this.setState({starts: starts, contents:  contents});
    }


    showPreview = (index) => {
        this.setState({hoverPreview: index});
    }



    render() {
        const { videoID, videoTime, option_indexes, content_options, time_options, closest_past} = this.props;
        const { starts, contents } = this.state;
        var current_idx = align_segment(videoTime, starts);
        return (
            <div className="segments-container">
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
                        {time === closest_past ?
                        <div className="past-option-item">
                          {time <= closest_past ?
                          <div style={{border: '2px solid #3889c9'}}></div>: 
                          <div style={{border: '2px solid lightgrey'}}></div>}
                          <div className="gallery-preview-wrapper">
                          </div>
                          <div className="text-option-text">
                            <div className="text-option-meta">
                              <div className="time-option">
                              {formatTime(time)} 
                              </div>
                            </div>
                            <div className="text-option">
                            </div>
                          </div>
                        </div>
                        : 
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
                        </div>}
                        </Clickable> ) })}
            </div>
        );
    }};