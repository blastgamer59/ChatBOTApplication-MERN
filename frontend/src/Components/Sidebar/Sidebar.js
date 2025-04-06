import React, { useEffect, useState } from "react";
import { VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { BsThreeDotsVertical } from "react-icons/bs";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "./Sidebar.css";

const Sidebar = ({
  isOpen,
  toggleSidebar,
  showSidebarIcon,
  setChatId,
  setMessages,
  user,
}) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    if (!user || !user.email) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/chat-history?email=${user.email}`
      );

      if (!response.ok) {
        console.error("Failed to fetch chat history:", response.statusText);
        return;
      }

      const data = await response.json();
      setChatHistory(data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setChatId(newChatId);
    setMessages([]);
    setSelectedChat(null);
  };

  const handleChatClick = async (chatId) => {
    setLoading(true);
    setSelectedChat(chatId);

    try {
      if (!user || !user.email) return;

      const response = await fetch(
        `http://localhost:5000/messages?email=${user.email}&chatId=${chatId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      setChatId(chatId);
      setMessages(data);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, chatId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    const chat = chatHistory.find((chat) => chat._id === currentChatId);
    if (chat) {
      setNewTitle(chat.title);
    }
    setOpenRenameDialog(true);
    handleMenuClose();
  };

  const handleRenameDialogClose = () => {
    setOpenRenameDialog(false);
  };

  const handleRenameSubmit = async () => {
    if (!newTitle.trim() || !user || !user.email) {
      handleRenameDialogClose();
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/rename-chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          email: user.email,
          newTitle: newTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to rename chat: ${response.statusText}`);
      }

      // Update local state
      setChatHistory((prevChatHistory) =>
        prevChatHistory.map((chat) =>
          chat._id === currentChatId ? { ...chat, title: newTitle } : chat
        )
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    } finally {
      handleRenameDialogClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setConfirmDeleteDialog(false);
  };

  const handleDeleteConfirm = async () => {
    if (!currentChatId || !user || !user.email) {
      handleDeleteDialogClose();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/delete-chat/${currentChatId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete chat: ${response.statusText}`);
      }

      // Update local state
      setChatHistory((prevChatHistory) =>
        prevChatHistory.filter((chat) => chat._id !== currentChatId)
      );

      // If the deleted chat is the currently selected one, reset to new chat
      if (selectedChat === currentChatId) {
        setChatId(null);
        setMessages([]);
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      handleDeleteDialogClose();
    }
  };

  const groupChatsByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const todayChats = [];
    const yesterdayChats = [];
    const previousChats = [];

    chatHistory.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate.toDateString() === today.toDateString()) {
        todayChats.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        yesterdayChats.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        previousChats.push(chat);
      }
    });

    return { todayChats, yesterdayChats, previousChats };
  };

  const { todayChats, yesterdayChats, previousChats } = groupChatsByDate();

  return (
    <>
      {showSidebarIcon && (
        <Tooltip
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
          arrow
          placement="left"
        >
          <VscLayoutSidebarLeftOff
            className="toggle-icon"
            onClick={toggleSidebar}
          />
        </Tooltip>
      )}

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <button className="new-chat-btn" onClick={handleNewChat}>
          New Chat
        </button>

        {loading && (
          <div className="loading-container">
            <CircularProgress size={24} />
          </div>
        )}

        <div className="chat-history">
          {todayChats.length > 0 && (
            <div className="chat-section">
              <h4>Today</h4>
              {todayChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${
                    selectedChat === chat._id ? "selected" : ""
                  }`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <span>{chat.title}</span>
                  <BsThreeDotsVertical
                    className="menu-icon"
                    onClick={(e) => handleMenuClick(e, chat._id)}
                  />
                </div>
              ))}
            </div>
          )}

          {yesterdayChats.length > 0 && (
            <div className="chat-section">
              <h4>Yesterday</h4>
              {yesterdayChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${
                    selectedChat === chat._id ? "selected" : ""
                  }`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <span>{chat.title}</span>
                  <BsThreeDotsVertical
                    className="menu-icon"
                    onClick={(e) => handleMenuClick(e, chat._id)}
                  />
                </div>
              ))}
            </div>
          )}

          {previousChats.length > 0 && (
            <div className="chat-section">
              <h4>Previous 7 Days</h4>
              {previousChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${
                    selectedChat === chat._id ? "selected" : ""
                  }`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <span>{chat.title}</span>
                  <BsThreeDotsVertical
                    className="menu-icon"
                    onClick={(e) => handleMenuClick(e, chat._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              width: "150px",
            },
          }}
        >
          <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
          <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
        </Menu>

        {/* Rename Dialog */}
        <Dialog open={openRenameDialog} onClose={handleRenameDialogClose}>
          <DialogTitle>Rename Chat</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Title"
              type="text"
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRenameDialogClose}>Cancel</Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default Sidebar;
