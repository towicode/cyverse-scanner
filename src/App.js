import React, { Component } from 'react';
import Scanner from './Scanner';
import Result from './Result';
import uaimg from './image/ua.png'

class App extends Component {

  state = {
    scanning: false,
    status: 'waiting',
    results: []
  }

  _scan = () => {
    this.setState({ scanning: !this.state.scanning, status: this.state.scanning ? 'waiting' : 'scanning', result: [] });
  }

  _switch = () => {
    
  }

  _onDetected = (result) => {
    console.log(result);
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

        {this.state.scanning ? null : <div className='status'>
          <div className='helpText' style={{ background: "white" }}>
            {this.state.results.length > 0 ? null  : <span>Scan tube and press accept after verifying barcode.</span>}
            <div>
              <img style={{ marginTop: "10px", width: "50vw" }} alt="UA Logo" src={uaimg} />
            </div>
            {this.state.results.length <= 0 ? null : <img src={this.state.results[0].data2}/>}


            {this.state.results.length <= 0 ? null : <div>
              <div className="barcoderesults">Barcode: {this.state.results[0].codeResult.code}</div>
              <div className="otherdata">Name: {this.state.results[0].codeResult.code}</div>
              <div className="otherdata">NetID: {this.state.results[0].codeResult.code}</div>
              <div className="otherdata">Date: {this.state.results[0].codeResult.code}</div>

              
              
              </div>}




          </div>
        </div>
        }

        {this.state.scanning ? null :
          <div>
            <div className="scan" onClick={this._scan}>
            </div>

            <div className="accept" style={this.state.results.length > 0 ? {backgroundColor: "green"} : {backgroundColor: "red"}} onClick={console.log("accepted!")}>
            </div>
          </div>}
        {this.state.scanning ? <Scanner cancel={this._scan} onDetected={this._onDetected} /> : null}
      </div >
    )
  }

}

export default App;
