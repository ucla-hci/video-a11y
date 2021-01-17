import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import { Header, Button, Image, Message } from 'semantic-ui-react';
import classNames from 'classnames';
import '../App.css';
import Timeline from './Timeline';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Divider from '@material-ui/core/Divider';
import {clips} from '../scripts';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            playbackRate: 1.0,
            modalOpen: true,
            hover: false,
            message: false,
            videoID: 'orkeOsOfAGk'
            
        }
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
          selected: [],
          selected_false: [],
          suggestions: [],
          option_suggestions: [],
          option_indexes: [],
          time_options: [],
          content_options: [],
          keyword_indexes: [],
          contextual_state: 0,
          currentTime: 0,
        })
        console.log("changed the video", videoID);
        this.handleDrawerClose();
      }
    
    
    
    render() {
        const { videoID, playing, playbackRate, modalOpen,} = this.state;
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
                <Container className="main-page">
                <div className="split-left"  tabIndex="1" >
                    <Row className="main-video">
                        <ReactPlayer ref={this.ref} playing={playing}
                            playbackRate={playbackRate} id="video"  width="100%" height="100%" controls url = {`https://www.youtube.com/watch?v=${videoID}`} onPause={this._onPause}
                            onPlay={this._onPlay}
                            onReady={this._onReady}
                            onProgress={this.handleProgress}
                            onDuration={this.handleDuration}
                            onSeek={this._onSeek}>
                        </ReactPlayer>
                    </Row>
                    <Timeline className="timeline"  videoTime={this.state.playedSeconds} duration={this.state.duration} ></Timeline>
                </div>
                <div className="split-right" >
                    <div className="search-bar-top">
                        <div className="last-command">{this.state.last_query}</div>
                    </div>
                    <form onSubmit={this.onRequestSearchHandler}>
                        <input type="text" className="search-bar"/>
                    </form>
                    {/* {this.state.option_indexes.length > 4?
                        <div >
                        {this.state.textOptionsIndex === 0?
                        <div className="time-option"><div className="voice-command">"Show Next" </div> {'\xa0\xa0'}{this.state.textOptionsIndex+1} / {Math.ceil(this.state.option_indexes.length/4) } </div>
                        :<div >{this.state.textOptionsIndex + 1 >= Math.ceil(this.state.option_indexes.length/4)?
                            <div className="time-option"><div className="voice-command" >"Show Previous"</div> {'\xa0\xa0'}{this.state.textOptionsIndex+1} / {Math.ceil(this.state.option_indexes.length/4) } </div>
                            :<div className="time-option"><div className="voice-command" >"Show Previous / Next" </div>{'\xa0\xa0'}{this.state.textOptionsIndex+1} / {Math.ceil(this.state.option_indexes.length/4) } </div>}</div>}
                        </div>
                    :
                    null} */}
                    </div>
                </Container>
            </div>
        )
    }
}
export default Home;