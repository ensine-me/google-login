import logo from './logo.svg';
import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import {useState} from 'react';

function App() {
  const [ start, setStart ] = useState(new Date());
  const [ end, setEnd ] = useState(new Date());
  const [ eventName, setEventName ] = useState("");
  const [ eventDescription, setEventDescription ] = useState("");

  const session = useSession(); // user, quando a sessão existir temos um usuario.
  const supabase = useSupabaseClient(); // talk to supabase;
  const { isLoading } = useSessionContext();

  if(isLoading){
    return <></>
  }

  async function googleSignIn(){
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
      }
    });
    if(error){
      alert("Error loggin into google provider with supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }
  const conferenceId = "qsz-pkbc-tnx";
  async function createCalendarEvent(){
    console.log("Creating calendar event");
    const event = {
      'summary': eventName,
      'description': eventDescription,
      'attendees': [
        {'email' : 'jvsalss@gmail.com'}
      ],
      'start': {
        'dateTime': start.toISOString(),
        'timeZone' : Intl.DateTimeFormat().resolvedOptions().timeZone // Vai da Brasil KAKAKAKAK
      },
      'end': {
        'dateTime': end.toISOString(), // Date.toISOString() ->
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone // Vai da Brasil KAKAKAKAK
      },
      'conferenceData': {
        'createRequest': {
          'conferenceSolutionKey': {
            'type': 'hangoutsMeet'
          },
          'requestId': Math.random().toString(36).substring(7)
        },
        'conferenceId': conferenceId
    }
  }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization':'Bearer ' + session.provider_token
      },
      body: JSON.stringify(event)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      alert("Evento criado cheque o google calendar.");
    });
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);
  return (
    <div className="App">
     <div style={{width:"400px", margin: "30px auto"}}>
      {session ?
      <>
      <h2>Opa, blz? {session.user.email}</h2>
      <p>Comece seu evento</p>
      <DateTimePicker onChange={setStart} value={start}></DateTimePicker>
      <p> Fim do evento </p>
      <DateTimePicker onChange={setEnd} value={end}></DateTimePicker>
      <p>Nome do evento:</p>
      <input type='text' onChange={(e) => setEventName(e.target.value)}></input>
      <p>Descrição do Evento:</p>
      <input type='text' onChange={(e) => setEventDescription(e.target.value)}></input>
      <hr />
      <button onClick={() => createCalendarEvent()}>Criar evento do calendario</button>
      <p></p>
      <button onClick={() => signOut()}>Deslogar</button>
      </>
      :
      <>
        <button onClick={() => googleSignIn()}>Logar-se com google</button>
      </>
       }
     </div>
    </div>
  );
}

export default App;
