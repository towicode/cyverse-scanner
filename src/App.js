import React, { Component } from 'react';
import Scanner from './Scanner';
import Result from './Result';

class App extends Component {

  state = {
    scanning: false,
    status: 'waiting',
    results: []
  }

  _scan = () => {
    this.setState({ scanning: !this.state.scanning, status: this.state.scanning ? 'waiting' : 'scanning', result: [] });
  }

  _onDetected = (result) => {
    this.setState({
      results: [result],
      scanning: false,
      status: 'waiting'
    });
  }

  render() {
    console.log('Results: ', this.state.results)
    return (
      <div>
        <div className='status'>
          <div style={{ background: "white" }}>
            Status: {this.state.status}
          </div>
        </div>
        <div className="header" onClick={this._scan}>
        {/* {this.state.scanning ? 'Stop' : 'Start'} */}
        </div>
        <ul className="results">
          {this.state.results.map((result, i) => (<Result key={result.codeResult.code + i} result={result} />))}
        </ul>
        { this.state.scanning ? <Scanner onDetected={this._onDetected} /> : null }
      </div >
    )
  }

}

export default App;
