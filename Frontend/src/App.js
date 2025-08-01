import './App.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [question, setquestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setloading] = useState(false);
  const responseAreaRef = useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const submithandler = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setloading(true);
    const userMessage = { role: 'user', text: question };
    setChatHistory(prev => [...prev, userMessage]);

    axios.post('http://localhost:5000/getdata', { prompt: question })
      .then(res => {
        const aiMessage = { role: 'model', text: res.data.response };
        setChatHistory(prev => [...prev, aiMessage]);
      })
      .catch(err => {
        console.error("Axios Error:", err); 
        const errorMessage = { role: 'model', text: "Sorry, something went wrong! Please try again later." };
        setChatHistory(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setloading(false);
        setquestion(''); 
      });
  }

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak( utterance);
    }
  };

  const copyText = (text) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Copied to clipboard!"))
        .catch(err => console.error("Failed to copy:", err));
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top navbar-custom navbaar">
    <div className="container-fluid">
    <div className="navbar-brand fw-bold fs-5">
      AIchats
    </div>

    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item me-2 mb-2 mb-lg-0">
          <a className="btn btn-outline-light" href="/login">
            Login
          </a>
        </li>
        <li className="nav-item">
          <a className="btn btn-light" href="/signup">
                Sign Up
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
      <div className="chat-container container-fluid">
        <header className="text-center py-4">
          <h3 className="ai-name">AI-Project</h3>
          <p className="ai-description">
            Your friendly AI assistant, ready to help you with any question.
          </p>
        </header>

        <main className="row">
          <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
            <div className="chat-box user-side">
              <h2 className="box-title">Your Prompt</h2>
              <div className="prompt-area">
                <textarea
                  value={question}
                  onChange={(e) => { setquestion(e.target.value) }}
                  className="form-control boxx"
                  rows="10"
                  placeholder="Enter any query you have :) ..."
                ></textarea>
              </div>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-primary btn-lg" type="button" onClick={submithandler} disabled={loading}>
                  {loading ? 'Generating...' : 'Send Prompt'}
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-12">
            <div className="chat-box ai-side">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="box-title mb-0">Conversation</h2>
                <button className="btn btn-outline-light btn-sm" onClick={clearChat} title="Clear chat history">
                  <i className="bi bi-trash3"></i> Clear Chat
                </button>
              </div>

            <div className="response-area" ref={responseAreaRef}>
          {chatHistory.map((message, index) => (
        <div key={index} className={`message ${message.role}`}>
            {
                message.role === 'user' ? (
                    <p className="mb-0">{message.text}</p>
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                    </ReactMarkdown>
                )
            }
            {message.role === 'model' && (
                <div className="message-actions">
                    <button onClick={() => copyText(message.text)} title="Copy"><i className="bi bi-clipboard icon"></i></button>
                    <button onClick={() => speakText(message.text)} title="Speak"><i className="bi bi-volume-up icon"></i></button>
                </div>
            )}
        </div>
    ))}
                {loading && (
                  <div className="message model">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <strong className='ms-2'>Generating...</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-3 mt-4">
          <p className="text small foot">Powered by Google Gemini</p>
        </footer>
      </div>
    </>
  );
}

export default App;