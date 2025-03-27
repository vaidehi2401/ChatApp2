import React, { useState, useEffect, useRef, useContext } from "react";
import { SocketContext, socket } from "../context/socket";
import "./Chat.css";
import { FaPaperclip } from 'react-icons/fa';
import axios from "axios";
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState(null);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [groupNames, setGroupNames] = useState([]);
  const [groupmessages, setGroupMessages] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [lastId, setLastId] = useState(-1);
const [activeGroupName, setActiveGroupName] = useState("");
const [isGroupChat, setIsGroupChat] = useState(false);
const [showMembers, setShowMembers] = useState(false);
const [members, setMembers] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [currentUserId, setCurrentUserId] = useState(null);
const [selectedMember, setSelectedMember] = useState(null);
const [actionType, setActionType] = useState(null); // 'makeAdmin' or 'remove'
const [showActionPopup, setShowActionPopup] = useState(false);
const [showConfirmPopup, setShowConfirmPopup] = useState(false);
const groupLastIdsRef = useRef({});
const messagesEndRef = useRef(null);


// Add this state variable near your other state declarations
const [file, setFile] = useState(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

// Add this function to handle file selection
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    handleFileUpload(selectedFile);
  }
};

// Add this function to handle file upload
const handleFileUpload = async (fileToUpload) => {
  if (!fileToUpload) return;
  
  setIsUploading(true);
  setUploadProgress(0);
  
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append('file', fileToUpload); // 'file' should match your backend expectation
    if (activeGroupId) {
      formData.append('groupId', activeGroupId);
    }

    const response = await axios.post(
      'http://localhost:3004/users/upload',
      formData, // Send the FormData object directly
      {
        headers: {
          'Authorization': token,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      }
    );

    // Add the file message to the chat
    const fileMessage = {
      content: `File uploaded: ${fileToUpload.name}`,
      sender: "You",
      fileUrl: response.data.fileUrl,
      isFile: true,
    };

    if (isGroupChat) {
      setGroupMessages(prev => [...prev, fileMessage]);
    } else {
      setMessages(prev => [...prev, fileMessage]);
    }

    setFile(null);
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Failed to upload file.");
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};

const socket = useContext(SocketContext);
useEffect(() => {
  if (activeGroupId) {
    socket.emit('joinGroup', activeGroupId);
    console.log("group joined>>>>>>>")
  }

  const handleNewMessage = (message) => {
    if (isGroupChat && message.groupId === activeGroupId) {
      // For group messages
      setGroupMessages(prev => {
        const updated = [...prev, message];
        const groupKey = `chat_messages_group_${activeGroupId}`;
        
        // Maintain cache
        const stored = localStorage.getItem(groupKey);
        const cached = stored ? JSON.parse(stored) : [];
        const newCache = [...cached, message].slice(-1000);
        localStorage.setItem(groupKey, JSON.stringify(newCache));
        
        // Update last ID
        groupLastIdsRef.current[activeGroupId] = message.id;
        return updated;
      });
    } else if (!isGroupChat && !message.groupId) {
      // For normal messages
      setMessages(prev => {
        const updated = [...prev, message];
        
        // Maintain cache
        const stored = localStorage.getItem("chat_messages");
        const cached = stored ? JSON.parse(stored) : [];
        const newCache = [...cached, message].slice(-1000);
        localStorage.setItem("chat_messages", JSON.stringify(newCache));
        
        // Update last ID
        setLastId(message.id);
        return updated;
      });
    }
  };

  socket.on('newMessage', handleNewMessage);

  return () => {
    socket.off('newMessage', handleNewMessage);
    if (activeGroupId) {
      socket.emit('leaveGroup', activeGroupId);
    }
  };
}, [activeGroupId, isGroupChat]);


  const popupRef = useRef(null);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
  
        const response = await axios.get(
          `http://localhost:3004/users/messages/${lastId}/${activeGroupId}`,
          { headers: { Authorization: token } }
        );
  
        const newMessages = response?.data?.messages;
        if (Array.isArray(newMessages)) {
          if (lastId === -1) {
            setMessages(newMessages);
  
            const first2 = newMessages?.slice(0, 1000) || [];
            localStorage.setItem("chat_messages", JSON.stringify(first2));
  
            if (first2?.length > 0) {
              setLastId(first2[first2.length - 1].id);
            }
          } else {
            if (newMessages?.length > 0) {
              const stored = localStorage.getItem("chat_messages");
              const oldMessages = stored ? JSON.parse(stored) : [];
              const isOldMessagesArray = Array.isArray(oldMessages);
  
              const updatedMessages = [
                ...(isOldMessagesArray ? oldMessages : []),
                ...newMessages,
              ];
  
              const trimmed = updatedMessages?.length > 1000
                ? updatedMessages.slice(100, 1100)
                : updatedMessages.slice(0, 1000);
  
              setMessages(updatedMessages);
              localStorage.setItem("chat_messages", JSON.stringify(trimmed));
  
              if (trimmed?.length > 0) {
                setLastId(trimmed[trimmed.length - 1].id);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
   if(!isGroupChat){
    fetchMessages();}
  }, [lastId, isGroupChat]);
  
  
  // ✅ Fetch group names
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
  
        const response = await axios.get("http://localhost:3004/group/userGroups", {
          headers: { Authorization: token },
        });
  
        const formattedGroups = Array.isArray(response?.data?.groups)
          ? response.data.groups.map(group => ({
              id: group?.groupId,
              name: group?.Group?.name,
            }))
          : [];
  
        setGroupNames(formattedGroups);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };
  
    fetchGroups();
  }, []);
  

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef?.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
  
    if (showPopup) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showPopup]);
  

  const handleInputChange = (e) => setMessage(e.target.value);
  const handleGroupClick = async (groupId, name) => {
    setActiveGroupId(groupId);
    setActiveGroupName(name);
    setIsGroupChat(true);
    setShowMembers(false);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const [msgRes, roleRes] = await Promise.all([
        axios.get(`http://localhost:3004/users/messages/lastId/${groupId}`, {
          headers: { Authorization: token },
        }),
        axios.get(`http://localhost:3004/group/members/${groupId}`, {
          headers: { Authorization: token },
        }),
      ]);
  
      const memberList = Array.isArray(roleRes?.data?.members)
        ? roleRes.data.members.map(m => ({
            id: m?.id,
            name: m?.name,
            email: m?.email,
            role: m?.role,
          }))
        : [];
  
      setGroupMessages(msgRes?.data?.messages || []);
      setMembers(memberList);
  
      const currentUserId = roleRes?.data?.userId;
      setCurrentUserId(currentUserId);
  
      const userRole = memberList.find(m => m?.id === parseInt(currentUserId));
      setIsAdmin(userRole?.role === "admin");
    } catch (error) {
      console.error("Error fetching group messages or members:", error);
    }
  };
  
  useEffect(() => {
    let intervalId;
  
    if (isGroupChat && activeGroupId) {
      const fetchGroupMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const groupKey = `chat_messages_group_${activeGroupId}`;
          const lastId = groupLastIdsRef.current[activeGroupId] ?? -1;
  
          // If lastId is -1, try from cache
          if (lastId === -1) {
            const stored = localStorage.getItem(groupKey);
            const cached = stored ? JSON.parse(stored) : [];
  
            if (cached.length > 0) {
              setGroupMessages(cached);
              groupLastIdsRef.current[activeGroupId] = cached[cached.length - 1].id;
              return;
            }
          }
  
          const response = await axios.get(
            `http://localhost:3004/users/messages/${lastId}/${activeGroupId}`,
            { headers: { Authorization: token } }
          );
       
          const newMessages = response.data.messages;
       //   console.log("new group messages", newMessages)
  
          if (newMessages.length > 0) {
            const stored = localStorage.getItem(groupKey);
            const oldMessages = stored ? JSON.parse(stored) : [];
            let updated = [...oldMessages, ...newMessages];
  
            // Trim if more than 1000
            if (updated.length > 1000) {
              updated = updated.slice(100); // remove oldest 100
            }
  
            localStorage.setItem(groupKey, JSON.stringify(updated));
            setGroupMessages(updated);
  
            groupLastIdsRef.current[activeGroupId] = updated[updated.length - 1].id;
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      };
  
      fetchGroupMessages();
      
    }
  }, [isGroupChat, activeGroupId]);
  
  const handleJoinLinkClick = (messageContent) => {
    const match = messageContent?.match(/\/group\/joinGroup\/(\d+)/);
    if (match) {
      setJoinGroupId(match[1]);
      setShowJoinPopup(true);
    }
  };
  

  const handleSendMessage = async () => {
    if (!message?.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      await axios.post(
        `http://localhost:3004/users/message/`,
        { message, groupId: activeGroupId },
        { headers: { Authorization: token } }
      );
  
    //  setMessages([...(Array.isArray(messages) ? messages : []), { content: message, sender: "You" }]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };
  

  const handleCreateGroup = () => {
    setShowPopup(true);
  };

  const handleInviteUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const response = await axios.post(
        `http://localhost:3004/group/createGroup`,
        { groupName },
        { headers: { Authorization: token } }
      );
  
      const groupId = response?.data?.group?.id || response?.data?.groupId;
      const groupNameCreated = response?.data?.group?.name;
  
      setIsGroupChat(true);
  
      const inviteMessage = `Join my group "${groupName}": http://localhost:3004/group/joinGroup/${groupId}`;
      await axios.post(
        `http://localhost:3004/users/message`,
        { message: inviteMessage },
        { headers: { Authorization: token } }
      );
  
      setMessage(inviteMessage);
      handleSendMessage();
      setMessage("");
  
      await handleGroupClick(groupId, groupNameCreated);
    } catch (err) {
      console.log(err);
    }
  
    setShowPopup(false);
    setGroupName("");
  };
  function shortenFileName(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.length > 25 ? filename.slice(0, 25) + '...' : filename;
  }
  

  // ✅ Handle clicking on a group name
  
  return (

    <div className="chat-container">
      <div className="chat-box">
      <div className="chat-header">
  <h2
    style={{ cursor: isAdmin ? "pointer" : "default" }}
    onClick={() => isAdmin && setShowMembers(!showMembers)}
  >
    {isGroupChat ? `Group: ${activeGroupName}` : "Chat"}
  </h2>
  {isGroupChat && (
    <button
      onClick={() => {
        setIsGroupChat(false);
        setActiveGroupId(null);
        setActiveGroupName("");
        setShowMembers(false);
      }}
      className="back-button"
    >
      ⬅ Back
    </button>
  )}
</div>
{showMembers && isAdmin && (
  <div className="group-members">
    <input
      type="text"
      placeholder="Search members..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
   <ul className="member-list">
  {members
    .filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort so that admins appear at the top
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return 0;
    })
    .map((member) => (
      <li
        key={member.id}
        className={`member-item ${member.role === "admin" ? "admin" : ""}`}
        onClick={() => {
          if (member.role !== "admin" && member.id !== currentUserId) {
            setSelectedMember(member);
            setShowActionPopup(true);
          }
        }}
        style={{
          cursor:
            member.role !== "admin" && member.id !== currentUserId
              ? "pointer"
              : "default",
          fontWeight: member.role === "admin" ? "bold" : "normal",
        }}
      >
        {member.name} {member.role === "admin" ? "(Admin)" : ""}
      </li>
    ))}
</ul>


  </div>
)}

    
<div className="messages">
  {(isGroupChat ? groupmessages : messages).map((msg, index) => {
    const isInvite = msg.content.includes("http://localhost:3004/group/joinGroup/");
    const isFile = msg.content.includes("https://") && msg.content.includes("amazonaws.com");

    return (
      <div key={index} className="message">
        <strong>{msg.sender}:</strong>{" "}
        {isInvite ? (
          <span
            className="invite-link"
            onClick={() => handleJoinLinkClick(msg.content)}
            style={{ color: "#7DF9FF", cursor: "pointer", textDecoration: "underline" }}
          >
            {msg.content}
          </span>
        ) : isFile ? (
          <a
            href={msg.content}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7DF9FF", textDecoration: "underline" }}
            download
          >
           📎 {shortenFileName(msg.content)}
          </a>
        ) : (
          msg.content
        )}
      </div>
    );
  })}
</div>


      </div>

      <div className="user-list">
        <h2>Online Users</h2>
        <ul>
          <li>User 1</li>
          <li>User 2</li>
        </ul>
      </div>

      <div className="group-list">
        <h2>Groups</h2>
        <ul>
          {groupNames.map((group) => (
            <li
              key={group.id}
              onClick={() => handleGroupClick(group.id, group.name)}
              style={{ cursor: "pointer", color: "#7DF9FF", textDecoration: "underline" }}
            >
              {group.name}
            </li>
          ))}
        </ul>
        <button className="create-group-btn" onClick={handleCreateGroup}>
          Create Group
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup" ref={popupRef}>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button onClick={handleInviteUsers}>Invite Users</button>
          </div>
        </div>
      )}

<div className="input-container">
  <label htmlFor="file-upload" className="file-upload-button">
    <FaPaperclip />
    <input
      id="file-upload"
      type="file"
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />
  </label>
  <input
    type="text"
    placeholder="Type a message..."
    value={message}
    onChange={handleInputChange}
  />
  <button onClick={handleSendMessage}>Send</button>
  
  {isUploading && (
    <div className="upload-progress">
      <div 
        className="progress-bar" 
        style={{ width: `${uploadProgress}%` }}
      ></div>
      <span>{uploadProgress}%</span>
    </div>
  )}
</div>

      {showJoinPopup && (
        <div className="popup-overlay">
          <div className="popup" ref={popupRef}>
            <p className="groupjoinpara">Do you want to join this group?</p>
            <button
              className="joinGroup"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.post(
                    `http://localhost:3004/group/joinGroup/${joinGroupId}`,
                    {},
                    { headers: { Authorization: token } }
                  );
                  alert("You joined the group!");
                } catch (error) {
                  console.error("Error joining group:", error);
                  alert("Failed to join the group.");
                }
                setShowJoinPopup(false);
                setJoinGroupId(null);
              }}
            >
              Yes
            </button>
            <button onClick={() => setShowJoinPopup(false)}>No</button>
          </div>
        </div>
      )}
      {showActionPopup && selectedMember && (
  <div className="popup-overlay">
     <div className="popup" ref={popupRef}>
     <h4>Manage Member: {selectedMember.name}</h4>
    <button
      onClick={() => {
        setActionType("makeAdmin");
        setShowConfirmPopup(true);
        setShowActionPopup(false);
      }}
    >
      Make Admin
    </button>
    <button
      onClick={() => {
        setActionType("remove");
        setShowConfirmPopup(true);
        setShowActionPopup(false);
      }}
    >
      Remove from Group
    </button>
    <button onClick={() => setShowActionPopup(false)}>Cancel</button>
  </div>
  </div>
)}

{showConfirmPopup && selectedMember && (
  <div className="popup-overlay">
    <p>
      Are you sure you want to{" "}
      {actionType === "makeAdmin" ? "make" : "remove"} {selectedMember.name}{" "}
      {actionType === "makeAdmin" ? "an admin" : "from the group"}?
    </p>
    <button onClick={async () => {
      const token = localStorage.getItem("token");
      try {
        if (actionType === "makeAdmin") {
          await axios.post("http://localhost:3004/group/make-admin", {
            groupId: activeGroupId,
            userId: selectedMember.id
          }, {
            headers: { Authorization: token }
          });
          alert(`${selectedMember.name} is now an admin.`);
        } else if (actionType === "remove") {
          await axios.post("http://localhost:3004/group/remove-user", {
            groupId: activeGroupId,
            userId: selectedMember.id
          }, {
            headers: { Authorization: token }
          });
          alert(`${selectedMember.name} was removed from the group.`);
        }
        // Optionally, refresh member list
        const response = await axios.get(`http://localhost:3004/group/members/${activeGroupId}`, {
          headers: { Authorization: token },
        });
        const updatedMembers = response.data.members.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role
        }));
        setMembers(updatedMembers);
      } catch (err) {
        console.error(err);
        alert("Action failed.");
      } finally {
        setShowConfirmPopup(false);
        setSelectedMember(null);
        setActionType(null);
      }
      setShowConfirmPopup(false);
      setSelectedMember(null);
    }}>
      Confirm
    </button>
    <button onClick={() => setShowConfirmPopup(false)}>Cancel</button>
  </div>
)}

     
    </div>
  );
};

export default Chat;
