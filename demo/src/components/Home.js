import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import { Header, Button, Image, Message } from 'semantic-ui-react';
import classNames from 'classnames';
import '../App.css';
import Timeline from './Timeline';
import Segments from './Segments';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Divider from '@material-ui/core/Divider';
import {clips} from '../scripts';
import { Clickable } from 'react-clickable';
import Blink from 'react-blink-text';
import TimeField from 'react-simple-timefield';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Speech from "speak-tts";


function formatTime(time) {
    console.log(time);
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var time = minutes + ":" + seconds;
    if(time.length < 5)
        time = 0 + time;
    return time;
}

function deformatTime(string) {
    const arr = string.split(':');
    var minutes = parseInt(arr[0]) * 60;
    var seconds = parseInt(arr[1]);
    return minutes + seconds;
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            playbackRate: 1.0,
            modalOpen: true,
            hover: false,
            message: false,
            videoID: 'GMVbQ1UsMP8',
            listening: false,
            transcript:'',
            time: '00:00',
            starts: [], 
            mid_indexes: [],
        }
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.jumpVideo  = this.jumpVideo.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.inspectFrame = this.inspectFrame.bind(this);
    }


    componentDidMount() {
        const speech = new Speech();
        if(speech.hasBrowserSupport()) { // returns a boolean
            console.log("speech synthesis supported")
        }
        speech.init({
            'volume': 1,
             'lang': 'en-GB',
             'rate': 0.8,
             'pitch': 1,
             'voice':'Google US English',
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

        json =  require('../dynamic.json');
        var dynamic=[];
        for (var i = 0, l = json.length; i < l; i++) {
            node = json[i];
            dynamic.push(node['content']);
        }

        
        json = require('../frames_data.json');
        var sortable = [];
        for (var frame in json) {
            sortable.push([frame, json[frame]['time']]);
        }
        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        // console.log(sortable);
        var frame_indexes = []
        var frame_timestamps = []
        for (var i = 1, l = sortable.length; i < l; i++) {
            frame_indexes.push(sortable[i][0]);
            frame_timestamps.push(sortable[i][1]);
        }

        this.setState({starts: starts, contents:  contents, mid_indexes: mid_indexes, mid_contents: mid_contents,frame_indexes: frame_indexes, frame_timestamps:  frame_timestamps,  dynamic: dynamic});

    }


    handleProgress = state => {
      // We only want to update time slider if we are not currently seeking
      this.setState(state);
    }
  
    handleDuration = (duration) => {
      this.setState({ duration });
    }

    ref = player => {
        this.player = player;
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };
    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    handleSubmit(videoID) {
        this.setState({start: 0, videoID: videoID, url: '', navigations: [], bookmarks: [],
          current_query: '',
          playing: true,
          transcript: '',
          suggestions: [],
          option_suggestions: [],
          option_indexes: [],
          time_options: [],
          content_options: [],
          keyword_indexes: [],
        })
        console.log("changed the video", videoID);
        this.handleDrawerClose();
    }

    jumpVideo(time, abs=false){
        if(abs){
            this.player.seekTo(time);
        }
        else{
            this.player.seekTo(this.state.playedSeconds + time);
        }
       
    }

    onTimeChange(event, value) {
        const newTime = value.replace(/-/g, ':');
        const time = newTime.substr(0, 5);
        console.log(newTime, time);
    
        this.setState({time});
    }
    handleKey = (key) => {
        console.log(key, this.state.time);
        var time = deformatTime(this.state.time);
        switch (key) {
        case 'enter':
            this.jumpVideo(time, true);
            this.setState({entered_time: time});
            break;
        case 'space':
            this.setState({playing: !this.state.playing});
            break;
        case 'tab':
            this.inspectFrame();
        }
    }

    inspectFrame() {
        const {frame_indexes, frame_timestamps, playedSeconds} = this.state;
        var curr = frame_timestamps[0], diff = Math.abs(playedSeconds - curr);
        var index = 0;
        for (var i = 0; i < frame_timestamps.length; i++) {
            var newdiff = Math.abs(playedSeconds - frame_timestamps[i]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = frame_timestamps[i];
                index = i;
            }
        }
        var closest_frame_index = frame_indexes[index];
        var json = require('../frames_data.json');
        var objects = json[closest_frame_index]['objects'];
        console.log("here", objects);
        if (!Object.keys(objects).length){
            this.state.speech.speak({
                text: "No object detected"
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
        }
        else{
            var object_info =  ''
            for (var object in objects) {
                object_info = '  ' + object_info + object + '   width' + (Math.floor(objects[object]['width']*100/1920)).toString() + ' %' + ' height' + (Math.floor(objects[object]['height']*100/1080)).toString() + ' % at';
                var x = objects[object]['left_x'] + objects[object]['width']/2;
                var y = objects[object]['top_y'] + objects[object]['height']/2;
                if (y<360){
                    object_info = object_info + ' top'
                }
                else if (y<720){
                    if (x<1280){
                        object_info = object_info + 'center'
                        continue;
                    }
                    object_info = object_info + ' middle'
                }
                else{
                    object_info = object_info + ' bottom'
                }

                if (x<640){
                    object_info = object_info + 'left'
                }
                else if (x<1280){
                    object_info = object_info + 'middle'
                }
                else{
                    object_info = object_info + 'right'
                }
            }
        
            // this.state.speech.speak({
            //     text: "Detected" + object_info
            // }).then(() => {
            //     console.log("Success !")
            // }).catch(e => {
            //     console.error("An error occurred :", e)
            // })
            this.state.speech.speak({
                text: "Detected: Teacher Monica. On the left of screen. Banana plant. On the right to the Teacher Monica. Size is similar to the teacher monica."
            }).then(() => {
                console.log("Success !")
            }).catch(e => {
                console.error("An error occurred :", e)
            })
            // this.state.speech.speak({
            //     text: "Detected 7 books. Book 1. Bintou's braids. On the cover, are the birds and a girl. Book 2. The amazing octupus. Book 3. Plant. On the covr is a sunflower. Book 4. Penguin. On the cover is a penguin head. " 
            // }).then(() => {
            //     console.log("Success !")
            // }).catch(e => {
            //     console.error("An error occurred :", e)
            // })
        }
    }
    
    
    
    render() {
        const { videoID, playing, playbackRate, listening, transcript, } = this.state;

        return (
            <div className="Home">
                <KeyboardEventHandler
                    handleKeys={['space', 'tab']}
                    onKeyEvent={(key, e) => this.handleKey(key)}>
                </KeyboardEventHandler>
                <div className="header-bar">
                    <div className="header-title">
                        <Header as="h2">
                            Video A11y
                        </Header>
                    </div>   
                    <IconButton
                        aria-label="Open drawer"
                        onClick={this.handleDrawerOpen}>
                        <MenuIcon style={{ fontSize: '30px'}}/>
                    </IconButton>
                    <Drawer
                        classes={{
                            paper: classNames("drawerPaper", !this.state.open && "drawerPaperClose"),
                        }}
                        open={this.state.open} anchor="right" >
                        <div>
                            <IconButton onClick={this.handleDrawerClose}>
                            <ChevronRightIcon />
                            </IconButton>
                        </div>
                        <Divider />
                        {clips.map((clip, index) => (
                            <div key={index}>
                            <Button style={{ fontSize: '12px', width: '100%', paddingTop: '10%', paddingBottom: '12%' }} key={clip}
                                onClick={() => this.handleSubmit(clip.videoID)}>
                                <img src={clip.image} style={{width: '70%', height: '70%', }} />
                                <div style={{ position: 'absolute' }}>
                                {clip.title}
                                </div>
                            </Button>
                            </div>
                        ))}
                    </Drawer>
                </div>
                <Container className="upper-page">
                <div className="split-left"  tabIndex="1" >
                        <img src={"space-bar-icon-25.png"} style={{width: '50%', marginTop: '3vh'}} alt={"Icon of up, down, left, right keys from keyboard"}/>
                        <div className="text-option-text">
                            ⬆/⬇: Change level of unit<br/>
                            ⬅: Jump to nearest past unit<br/>
                            ⬅: Jump to nearest future unit
                        </div>
                </div>
                <div className="split-center"  tabIndex="1" >
                    <Row className="main-video">
                        <ReactPlayer ref={this.ref} playing={this.state.playing}
                            playbackRate={playbackRate} id="video"  width="100%" height="100%" controls url = {`https://www.youtube.com/watch?v=${videoID}`} onPause={this._onPause}
                            onPlay={this._onPlay}
                            onReady={this._onReady}
                            onProgress={this.handleProgress}
                            onDuration={this.handleDuration}
                            onSeek={this._onSeek}>
                        </ReactPlayer>
                    </Row>
                    <div className="container-wrapper">
                        <div className="container-transcript">
                            {!listening? <div className="sys-instruction">Click below to start talking!</div> :
                            transcript? <div className="sys-instruction">You said: </div>
                            : <Blink color='black' text='Say something to the system!' fontSize='70'/> }
                            <div className="text-option">
                            {transcript}
                            </div>
                            <br/>
                            <Clickable  className="voice-button" onClick={this.onListenHandler}>
                                {listening? <div className="voice-command">"Stop Talking"</div>
                                :<div className="voice-command">"Start Talking"</div>}
                            </Clickable>
                        </div>
                    </div>
                </div>
                <div className="split-right" >
                    <KeyboardEventHandler
                    handleKeys={['enter']}
                    onKeyEvent={(key, e) => this.handleKey(key)}>
                    {/* <div className="search-bar-top">
                        <div className="last-command">{this.state.last_query}</div>
                    </div>
                    <form onSubmit={this.onRequestSearchHandler}>
                        <input type="text" className="search-bar"/>
                    </form> */}
                    <div className="text-option-text"> Jump to: </div>
                    <TimeField
                        value={formatTime(this.state.playedSeconds)} onChange={this.onTimeChange}
                        style={{ border: '2px solid #666', fontSize: 42, width: 130,
                        padding: '5px 8px', color: '#333', borderRadius: 5}}
                    />
                    </KeyboardEventHandler>
                </div>    
                </Container>
                <Container className="lower-page">

                <Timeline   videoTime={this.state.playedSeconds} duration={this.state.duration} ></Timeline>
                <Segments videoID={this.state.videoID} videoTime={this.state.playedSeconds} jumpVideo = {this.jumpVideo} starts =  {this.state.starts} contents = {this.state.contents} mid_indexes = {this.state.mid_indexes} mid_contents = {this.state.mid_contents} entered_time = {this.state.entered_time} dynamic = {this.state.dynamic}></Segments>
                </Container>
            </div>
        )
    }
}
export default Home;
