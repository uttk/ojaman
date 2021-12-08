import { render } from "react-dom";

import { initialize } from "./utils/webrtc";

import "./index.css";

const { sendOffer, startLive } = initialize();

export const App = () => {
  return (
    <>
      <section className="container">
        <div>
          <div className="container">
            <div>
              <p>Offer</p>
              <video muted controls id="offer-preview" className="preview" />
            </div>

            <div>
              <p>Answer</p>
              <video muted controls id="answer-preview" className="preview" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <button onClick={startLive}>Start Live</button>
        <button onClick={sendOffer}>Send Offer</button>
      </section>
    </>
  );
};

render(<App />, document.getElementById("app"));
