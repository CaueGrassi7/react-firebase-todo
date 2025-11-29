import "./App.css";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import Todos from "./todos";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import spinner from "./assets/blue-spinner.gif";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src={spinner} alt="Loading..." />
      </div>
    );
  }

  return (
    <>
      <h1>React Firebase Todo</h1>

      {user ? (
        <div>
          <div className="user-info">
            <p>Welcome, {user.email}</p>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
          <Todos user={user} />
        </div>
      ) : (
        <div>
          {showSignUp ? (
            <SignUp onToggleForm={() => setShowSignUp(false)} />
          ) : (
            <SignIn onToggleForm={() => setShowSignUp(true)} />
          )}
        </div>
      )}
    </>
  );
}

export default App;
