import { useState } from "react";
import { List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../firebase.js";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

const Todo = ({ arr }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedTodo, setUpdatedTodo] = useState(arr.item.todo);

  return (
    <List className="todo__list">
      <ListItem>
        <ListItemAvatar />
        {editMode ? (
          <input
            type="text"
            value={updatedTodo}
            onChange={(e) => setUpdatedTodo(e.target.value)}
          />
        ) : (
          <ListItemText primary={arr.item.todo} secondary={arr.item.todo} />
        )}
      </ListItem>
      {editMode ? (
        <button
          onClick={() => {
            updateDoc(doc(db, "todos", arr.id), {
              todo: updatedTodo,
            });
            setEditMode(false);
          }}
        >
          Save
        </button>
      ) : (
        <>
          <DeleteIcon
            fontSize="large"
            style={{ opacity: 0.7 }}
            onClick={() => {
              deleteDoc(doc(db, "todos", arr.id));
            }}
          />
          <EditIcon
            fontSize="large"
            style={{ opacity: 0.7 }}
            onClick={() => {
              setEditMode(!editMode);
            }}
          />
        </>
      )}
    </List>
  );
};

export default Todo;
