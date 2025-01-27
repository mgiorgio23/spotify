import { React, useState } from 'react' 
import logo from './logo.svg';
import './App.css';
import { redirectToAuthCodeFlow } from './util/authorization'

function App() {
  const clientId = "78d0c6da6d2e462288eca0432781f79b";
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const [topTracks, setTracks] = useState("");

  async function auth() {
    if (!code) {
      console.log('here')
      redirectToAuthCodeFlow(clientId);
  } else {
      const accessToken = await getAccessToken(clientId, code);
      const profile = await fetchProfile(accessToken);
      localStorage.setItem("token",accessToken)
      // populateUI(profile);
  }
  };

  async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");
    console.log(verifier)
    console.log(code)
    console.log(clientId)
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
  console.log("TOKEN: ",token)
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}
  
  // Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
  async function fetchWebApi(endpoint, method, body) {
    const token = localStorage.getItem("token")
    console.log("TOKEN: ",token);
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body:JSON.stringify(body)
    });
    return await res.json();
  }

  async function getTopTracks(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const tracks = await fetchWebApi(
      'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
    ).items;
    console.log(tracks)
  }
  
  // console.log(
  //   topTracks?.map(
  //     ({name, artists}) =>
  //       `${name} by ${artists.map(artist => artist.name).join(', ')}`
  //   )
  // );
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button type="button" onClick={(e) => auth(e.target.value)}>Authorize</button>
        <button type="button" onClick={(e) => getTopTracks(e.target.value)}>Get Top Tracks</button>
      </header>
    </div>
  );
}

export default App;
