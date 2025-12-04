import "./App.css";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import Todos from "./todos";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import spinner from "./assets/blue-spinner.gif";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [publicData, setPublicData] = useState([]);
  const [showPublicData, setShowPublicData] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(false);

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

  const handleTestPublicCollection = async () => {
    setLoadingPublic(true);
    try {
      const publicTestRef = collection(db, "public_test");
      const snapshot = await getDocs(publicTestRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setPublicData(data);
      setShowPublicData(true);
    } catch (err) {
      console.error("Error fetching public data:", err);
      alert("Error fetching public data: " + err.message);
    } finally {
      setLoadingPublic(false);
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

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button
          onClick={handleTestPublicCollection}
          disabled={loadingPublic}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loadingPublic ? "not-allowed" : "pointer",
            opacity: loadingPublic ? 0.6 : 1,
          }}
        >
          {loadingPublic ? "Loading..." : "🧪 Test Public Collection"}
        </button>
        {showPublicData && (
          <div
            style={{
              marginTop: "15px",
              padding: "20px",
              backgroundColor: "#2c2c2c",
              borderRadius: "8px",
              maxWidth: "600px",
              margin: "15px auto 0",
              border: "2px solid #4CAF50",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#4CAF50", fontSize: "18px" }}>
              📋 Public Test Data:
            </h3>
            {publicData.length === 0 ? (
              <p style={{ color: "#ccc" }}>
                No data found in public_test collection
              </p>
            ) : (
              <ul style={{ textAlign: "left", listStyle: "none", padding: 0 }}>
                {publicData.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      padding: "12px",
                      marginBottom: "8px",
                      backgroundColor: "#1a1a1a",
                      borderRadius: "5px",
                      color: "#fff",
                      border: "1px solid #444",
                    }}
                  >
                    <strong style={{ color: "#4CAF50" }}>ID:</strong>{" "}
                    <span style={{ color: "#aaa" }}>{item.id}</span> |{" "}
                    <strong style={{ color: "#4CAF50" }}>Nome:</strong>{" "}
                    <span style={{ color: "#fff", fontSize: "16px" }}>
                      {item.nome}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowPublicData(false)}
              style={{
                marginTop: "15px",
                padding: "8px 20px",
                fontSize: "14px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✖ Close
            </button>
          </div>
        )}
      </div>

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
