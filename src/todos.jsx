import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { useEffect, useState } from "react";
import spinner from "./assets/blue-spinner.gif";

function Todos({ user }) {
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const todoCollRef = collection(db, "todos");
  const [todos, setTodos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    // Buscar apenas os todos do usuário logado
    // Removemos orderBy para evitar necessidade de índice composto
    const q = query(todoCollRef, where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const todosArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          userId: doc.data().userId,
          completed: doc.data().completed || false,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Ordenar no lado do cliente por data de criação (mais recentes primeiro)
        todosArray.sort((a, b) => b.createdAt - a.createdAt);

        setTodos(todosArray);
        setError(null);
      },
      (err) => {
        console.error("Snapshot error: ", err);
        if (err.code === "permission-denied") {
          setError("Permission denied. Please sign in to view your todos.");
        } else {
          setError(err.message);
        }
        // Mesmo com erro, definir todos como array vazio para não travar no spinner
        setTodos([]);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(todoCollRef, {
        title: newTitle.trim(),
        userId: user.uid,
        completed: false,
        createdAt: new Date(),
      });
      setNewTitle("");
    } catch (err) {
      console.error("Error adding todo:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied. Please make sure you are signed in.");
      } else {
        alert("Error adding todo. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todoId, currentStatus) => {
    try {
      const todoRef = doc(db, "todos", todoId);
      await updateDoc(todoRef, {
        completed: !currentStatus,
      });
    } catch (err) {
      console.error("Error updating todo:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied. Please make sure you are signed in.");
      }
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return;

    try {
      const todoRef = doc(db, "todos", todoId);
      await deleteDoc(todoRef);
    } catch (err) {
      console.error("Error deleting todo:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied. Please make sure you are signed in.");
      } else {
        alert("Error deleting todo. Please try again.");
      }
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSaveEdit = async (todoId) => {
    if (!editTitle.trim()) {
      handleCancelEdit();
      return;
    }

    try {
      const todoRef = doc(db, "todos", todoId);
      await updateDoc(todoRef, {
        title: editTitle.trim(),
      });
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      console.error("Error updating todo:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied. Please make sure you are signed in.");
        handleCancelEdit();
      }
    }
  };

  if (todos == null) {
    return (
      <div className="loading-container">
        <img src={spinner} alt="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading todos: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todos-container">
      <div className="todos-header">
        <h2>My Todos</h2>
        {totalCount > 0 && (
          <div className="todos-stats">
            <span className="stat-item">
              Total: <strong>{totalCount}</strong>
            </span>
            <span className="stat-item">
              Completed: <strong>{completedCount}</strong>
            </span>
            <span className="stat-item">
              Pending: <strong>{totalCount - completedCount}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="todos-list">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>📝 No todos yet</p>
            <p className="empty-state-subtitle">
              Add your first todo below to get started!
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(todo.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit(todo.id);
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="todo-edit-input"
                    autoFocus
                  />
                ) : (
                  <span
                    className="todo-title"
                    onDoubleClick={() => handleStartEdit(todo)}
                  >
                    {todo.title}
                  </span>
                )}
              </div>
              <div className="todo-actions">
                {editingId !== todo.id && (
                  <>
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="todo-button edit-button"
                      title="Edit todo"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="todo-button delete-button"
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="add-todo-section">
        <h3>Add New Todo</h3>
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="add-todo-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newTitle.trim()}
            className="add-todo-button"
          >
            {loading ? "Adding..." : "➕ Add"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Todos;
