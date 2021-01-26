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
            option_suggestions: [],
            option_indexes: [],
            time_options: [1, 20, 130, 200, 300],
            content_options: ["hi", "hi", "here", "here", "hi"],
            keyword_indexes: [[],[],[],[]],
            current_level: 1,
        }
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.jumpVideo  = this.jumpVideo.bind(this);
    }


    componentDidMount() {
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
          current_level: 0,
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
    
    
    
    render() {
        const { videoID, playing, playbackRate, listening, transcript} = this.state;
        const { addFlag, flagClickHandler, showFlags, addParticipationPoint } = this;

        return (
            <div className="Home">
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
                    <div className="search-bar-top">
                        <div className="last-command">{this.state.last_query}</div>
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
                    <div className="search-bar-top">
                        <div className="last-command">{this.state.last_query}</div>
                    </div>
                    <form onSubmit={this.onRequestSearchHandler}>
                        <input type="text" className="search-bar"/>
                    </form>
                    </div>    
                </Container>
                <Container className="lower-page">

                <Timeline   videoTime={this.state.playedSeconds} duration={this.state.duration} ></Timeline>
                <Segments videoID={this.state.videoID} videoTime={this.state.playedSeconds} jumpVideo = {this.jumpVideo} current_level = {this.state.current_level}></Segments>
                </Container>
            </div>
        )
    }
}
export default Home;
