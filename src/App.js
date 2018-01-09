import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ld from "jsonld";

class App extends Component {

  constructor() {

    super();
    this.state = {};

  }

  handleGO(e) {

    e.preventDefault();
    const { value } = this.urlInput;
    if(window.localStorage) window.localStorage.bookmarked = value;
    this.setState( { err: undefined } );
    fetch( value )
      .then( resp => {

        const { status, statusText } = resp;
        const headers = JSON.parse( JSON.stringify( resp.headers ) );
        this.setState( { status, statusText, headers } );
        return resp.json();

      } )
      .then( json => {

        this.setState( { json } );
        this.expandLD( json );

      } )
      .catch( err => {

        this.setState( { err } );

      } );

  }

  bookmarkedURL() {

      return ( window.localStorage && window.localStorage.bookmarked ) || "";
  }

  expandedLD() {

    const { expanded } = this.state;
    return expanded ? <pre>{JSON.stringify( expanded, null, 3 )}</pre> : null;

  }

  renderHeaders() {
    const { headers } = this.state;
    if( !headers) { return null;}
    return <div>
        {Object.keys(headers).map( key => <div>{key}: {headers[ key]}</div> )}
      </div>;
  }

  expandLD( json ) {

    ld.expand( json, ( err, expanded ) => {

        this.setState( { err, expanded } );

    } );

  }

  handleEditorChange( e ) {

    const candidate = this.editor.textContent;
    try {
      const json =  JSON.parse(candidate);
      this.expandLD( json );
    } catch( ex ) {
        console.warn( ex );
    }

  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <a href="http://json-ld.org" target="blank">
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <h1 className="App-title">JSON-LD browser</h1>
        </header>
        <section className="console">

          <form>

            <h3>Request</h3>
            <label>
                <span className="label-text">URL</span>
                <input type="text" ref={x => this.urlInput = x} defaultValue={this.bookmarkedURL()} />
                <button type="button" onClick={e => this.handleGO(e)}>GO</button>
            </label>
            <h4>Request headers</h4>
            <pre>{( this.state.err || "" ).toString()}</pre>
          </form>
          <article>
            <h3>Response</h3>
            {this.state.status} {this.state.statusText} {this.renderHeaders()}
            <div className="editor" onKeyUp={e => this.handleEditorChange(e)} ref={x => this.editor = x} contentEditable={true}>
              {JSON.stringify(this.state.json, null, 3 )}
            </div>
          </article>

          <article>
            <h3>Expanded</h3>
            {this.expandedLD()}
          </article>
        </section>

      </div>
    );
  }
}

export default App;
