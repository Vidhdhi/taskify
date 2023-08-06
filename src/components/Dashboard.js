import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

const ItemTypes = {
  TASK: 'task',
};

const Dashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);

  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    assignedUser: '',
    progress: 0,
  });

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      setTasks(
        snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          assignedUser: doc.data().assignedUser,
          progress: doc.data().progress,
          status: doc.data().status,
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAddTaskDialog = () => {
    setOpenAddTaskDialog(true);
  };

  const handleCloseAddTaskDialog = () => {
    setOpenAddTaskDialog(false);
  };

  const handleAddTask = async () => {
    if (newTaskData.title.trim()) {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskData.title,
        description: newTaskData.description,
        assignedUser: newTaskData.assignedUser,
        progress: newTaskData.progress,
        status: 'todo',
        timestamp: serverTimestamp(),
      });

      setNewTaskData({
        title: '',
        description: '',
        assignedUser: '',
        progress: 0,
      });

      handleCloseAddTaskDialog();
    }
  };

  const moveTask = async (id, newStatus) => {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { status: newStatus });
  };

  const deleteTask = async id => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = async (id, newTitle) => {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { title: newTitle });
  };

  const handleMoveToInProcess = id => {
    moveTask(id, 'inprocess');
  };

  const handleMoveToComplete = id => {
    moveTask(id, 'complete');
  };

  const Task = ({ id, title, description, assignedUser, progress, status }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TASK,
      item: { id, title, description, assignedUser, progress, status },
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: ItemTypes.TASK,
      canDrop: item => item.status !== status,
      drop: item => {
        if (item.status === 'todo') {
          moveTask(item.id, status);
        } else if (item.status === 'inprocess') {
          if (status === 'complete') {
            moveTask(item.id, status);
          } else {
            moveTask(item.id, 'inprocess');
          }
        }
      },
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);

    const handleEditClick = () => {
      setIsEditing(true);
    };

    const handleEditConfirm = () => {
      if (editedTitle.trim() !== title) {
        editTask(id, editedTitle);
      }
      setIsEditing(false);
    };

    return (
      <div ref={node => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Paper elevation={3} className="task" sx={{ margin: '10px', padding: '4%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isEditing ? (
            <>
              <TextField
                variant="outlined"
                size="small"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
              />
              <Button onClick={handleEditConfirm}>Confirm</Button>
            </>
          ) : (
            <>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body1">{description}</Typography>
              <Typography variant="body2">Assigned User: {assignedUser}</Typography>
              <Typography variant="body2">Progress: {progress}%</Typography>
              <Button variant="contained" sx={{ backgroundColor: 'gray' }} onClick={handleEditClick}>Edit</Button>
              <Button variant="contained" sx={{ backgroundColor: 'red' }} onClick={() => deleteTask(id)}>Delete</Button>

              {status === 'todo' && (
                <>
                  <Button variant="contained" sx={{ backgroundColor: 'orange' }} onClick={() => handleMoveToInProcess(id)}>Move to In Process</Button>
                </>
              )}
              {status === 'inprocess' && (
                <Button variant="contained" sx={{ backgroundColor: 'green' }} onClick={() => handleMoveToComplete(id)}>Move to Complete</Button>
              )}
            </>
          )}
        </Paper>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Taskify (Task Management System Test)</Typography>
          <Button color="inherit" onClick={() => signOut(user.auth)}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container className="App" sx={{ marginTop: '40px', marginBottom: '40px' }}>
        <form style={{marginBottom: '40px'}}>
          <Button variant="contained" color="primary" onClick={handleOpenAddTaskDialog}>
            Add Task
          </Button>
        </form>
        <Grid container spacing={4}>
          <Grid item xs={4} sx={{backgroundColor:'lightblue',padding:'4%'}}>
            <Typography variant="h6">Todo</Typography>
            {tasks
              .filter(task => task.status === 'todo')
              .map(task => (
                <Task key={task.id} {...task} />
              ))}
          </Grid>
          <Grid item xs={4} sx={{backgroundColor:'orange',padding:'4%'}}>
            <Typography variant="h6">In Process</Typography>
            {tasks
              .filter(task => task.status === 'inprocess')
              .map(task => (
                <Task key={task.id} {...task} />
              ))}
          </Grid>
          <Grid item xs={4} sx={{backgroundColor:'lightgreen',padding:'4%'}}>
            <Typography variant="h6">Complete</Typography>
            {tasks
              .filter(task => task.status === 'complete')
              .map(task => (
                <Task key={task.id} {...task} />
              ))}
          </Grid>
        </Grid>
      </Container>

      {/* Add Task Dialog */}
      <Dialog open={openAddTaskDialog} onClose={handleCloseAddTaskDialog}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            variant="outlined"
            size="small"
            fullWidth
            value={newTaskData.title}
            onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Description"
            variant="outlined"
            size="small"
            fullWidth
            value={newTaskData.description}
            onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Assigned User"
            variant="outlined"
            size="small"
            fullWidth
            value={newTaskData.assignedUser}
            onChange={e => setNewTaskData({ ...newTaskData, assignedUser: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Progress (%)"
            variant="outlined"
            size="small"
            type="number"
            fullWidth
            value={newTaskData.progress}
            onChange={e => setNewTaskData({ ...newTaskData, progress: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTaskDialog} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddTask} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default Dashboard;
