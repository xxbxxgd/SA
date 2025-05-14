import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Paper, Typography, TextField, Button, 
  Avatar, Box, CircularProgress, Divider, IconButton,
  AppBar, Toolbar, Grid, List, ListItem, ListItemAvatar, 
  ListItemText, Badge
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { listenToMessages, sendMessage, getUserChatRooms } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // 滾動和消息相關的 ref
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const scrollPositionRef = useRef({ top: 0, height: 0 });
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  
  // 獲取所有聊天室
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (currentUser) {
      unsubscribe = getUserChatRooms((rooms) => {
        setChatRooms(rooms);
        setLoadingRooms(false);
      });
    }
    
    return () => unsubscribe();
  }, [currentUser]);
  
  // 獲取指定聊天室的對方用戶名稱
  const getOtherUserName = (room) => {
    if (!currentUser || !room || !room.participantNames) return '未知用戶';
    
    for (const [userId, name] of Object.entries(room.participantNames)) {
      if (userId !== currentUser.uid) {
        return name || '未知用戶';
      }
    }
    
    return '未知用戶';
  };
  
  // 獲取聊天室的未讀消息數
  const getRoomUnreadCount = (room) => {
    if (!currentUser || !room || !room.unreadCount) return 0;
    return room.unreadCount[currentUser.uid] || 0;
  };
  
  // 獲取聊天室資訊
  useEffect(() => {
    const fetchRoom = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const roomRef = doc(db, 'chats', roomId);
        const roomSnap = await getDoc(roomRef);
        
        if (!roomSnap.exists()) {
          console.error('找不到聊天室');
          navigate('/');
          return;
        }
        
        const roomData = roomSnap.data();
        setRoom(roomData);
        
        // 找出其他用戶的名稱
        if (roomData.participantNames) {
          const otherUserId = roomData.participants.find(id => id !== currentUser.uid);
          setOtherUserName(roomData.participantNames[otherUserId] || '未知用戶');
        }
        
      } catch (error) {
        console.error('獲取聊天室錯誤', error);
      }
    };
    
    fetchRoom();
  }, [roomId, currentUser, navigate]);
  
  // 判斷是否顯示日期分隔線
  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg || !currentMsg.timestamp || !prevMsg.timestamp) return false;
    
    const currentDate = new Date(currentMsg.timestamp.seconds * 1000).toDateString();
    const prevDate = new Date(prevMsg.timestamp.seconds * 1000).toDateString();
    
    return currentDate !== prevDate;
  };
  
  // 獲取日期分隔線文字
  const getDateSeparatorText = (message) => {
    if (!message.timestamp) return '';
    
    const date = new Date(message.timestamp.seconds * 1000);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // 添加防抖函數
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 優化訊息監聽
  useEffect(() => {
    let unsubscribe = () => {};
    let isMounted = true;
    
    if (currentUser && roomId) {
      const debouncedSetMessages = debounce((newMessages) => {
        if (!isMounted) return;
        
        setMessages(prevMessages => {
          // 使用 Set 來追蹤已處理的消息 ID
          const processedIds = new Set(prevMessages.map(msg => msg.id));
          const newMessagesToAdd = newMessages.filter(msg => !processedIds.has(msg.id));
          
          if (newMessagesToAdd.length === 0) {
            return prevMessages;
          }
          
          // 合併並排序消息
          const allMessages = [...prevMessages, ...newMessagesToAdd].sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeA - timeB;
          });
          
          return allMessages;
        });
        
        // 只在有新消息時更新 loading 狀態
        if (newMessages.length > 0) {
          setLoading(false);
        }
      }, 100); // 100ms 的防抖時間

      unsubscribe = listenToMessages(roomId, (newMessages) => {
        if (!isMounted) return;
        debouncedSetMessages(newMessages);
      });
    }
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId, currentUser]);
  
  // 優化訊息渲染
  const MessageItem = React.memo(({ message }) => {
    const isCurrentUser = message.sender === currentUser?.uid;
    
    return (
      <Box
        ref={message.id === messages[messages.length - 1]?.id ? lastMessageRef : null}
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          mb: 1.5,
          opacity: 0,
          animation: 'fadeIn 0.3s ease forwards',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {!isCurrentUser && (
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              bgcolor: 'primary.light'
            }}
          >
            {message.senderName?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        )}
        
        <Box sx={{ maxWidth: '70%' }}>
          {!isCurrentUser && (
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 1, 
                mb: 0.5, 
                display: 'block',
                color: 'text.secondary'
              }}
            >
              {message.senderName || '未知用戶'}
            </Typography>
          )}
          
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '16px',
              bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
              color: isCurrentUser ? 'white' : 'text.primary',
              position: 'relative',
              maxWidth: '100%',
              wordBreak: 'break-word',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                ...(isCurrentUser ? {
                  right: -8,
                  borderWidth: '8px 0 8px 8px',
                  borderColor: `transparent transparent transparent ${theme => theme.palette.primary.main}`
                } : {
                  left: -8,
                  borderWidth: '8px 8px 8px 0',
                  borderColor: `transparent ${theme => theme.palette.grey[100]} transparent transparent`
                }),
                top: '50%',
                transform: 'translateY(-50%)'
              }
            }}
          >
            <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
              {message.text}
            </Typography>
          </Paper>
          
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 0.5,
              display: 'block',
              textAlign: isCurrentUser ? 'right' : 'left',
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            {formatTime(message.timestamp)}
          </Typography>
        </Box>
      </Box>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.timestamp?.seconds === nextProps.message.timestamp?.seconds &&
      prevProps.message.sender === nextProps.message.sender
    );
  });

  // 使用 useMemo 優化訊息列表
  const memoizedMessages = useMemo(() => {
    return messages.map(message => (
      <MessageItem key={message.id} message={message} />
    ));
  }, [messages]);
  
  // 優化滾動處理
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (isNearBottom !== shouldAutoScroll) {
      setShouldAutoScroll(isNearBottom);
    }
  }, [shouldAutoScroll]);
  
  // 記錄滾動位置
  const updateScrollPosition = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    scrollPositionRef.current = {
      top: scrollTop,
      height: scrollHeight,
      clientHeight: clientHeight,
      atBottom: scrollHeight - scrollTop - clientHeight < 50
    };
  }, []);
  
  // 使用 useCallback 優化滾動到底部函數
  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (!messagesContainerRef.current || isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    
    requestAnimationFrame(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ 
          behavior, 
          block: 'end' 
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    });
  }, []);
  
  // 處理消息變化引起的滾動行為
  useEffect(() => {
    if (messages.length === 0 || loading) return;
    
    const isNewMessage = messages.length > prevMessagesLength;
    setPrevMessagesLength(messages.length);
    
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const isCurrentUserMessage = lastMessage.sender === currentUser?.uid;
      
      if (isCurrentUserMessage || shouldAutoScroll) {
        scrollToBottom(isCurrentUserMessage ? 'auto' : 'smooth');
      }
    } else if (shouldAutoScroll) {
      scrollToBottom('auto');
    }
  }, [messages, loading, shouldAutoScroll, prevMessagesLength, currentUser, scrollToBottom]);
  
  // 組件卸載時清理定時器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // 發送消息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      const messageToSend = newMessage.trim();
      setNewMessage('');
      
      setShouldAutoScroll(true);
      
      await sendMessage(roomId, messageToSend);
    } catch (error) {
      console.error('發送消息錯誤', error);
      alert('發送消息失敗: ' + error.message);
    }
  };
  
  // 格式化時間
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: zhTW });
    } catch (error) {
      console.error('時間格式化錯誤', error);
      return '';
    }
  };
  
  // 處理聊天室點擊
  const handleRoomClick = (roomId) => {
    navigate(`/chat/${roomId}`);
  };
  
  // 返回按鈕
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        p: 0,
        overflow: 'hidden',
        bgcolor: '#f5f7fb'
      }}
    >
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main',
                mr: 1.5
              }}
            >
              {otherUserName?.charAt(0).toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {otherUserName || '訊息'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {room?.lastActive ? `最後上線 ${formatTime(room.lastActive)}` : '離線'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 主要內容區域 */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex',
        overflow: 'hidden',
        bgcolor: '#f5f7fb'
      }}>
        {/* 左側聊天室列表 */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', sm: 320 },
            display: { xs: room ? 'none' : 'block', sm: 'block' },
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            overflow: 'hidden'
          }}
        >
          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : chatRooms.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                還沒有聊天記錄
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {chatRooms.map((room) => {
                const otherUserName = getOtherUserName(room);
                const unreadCount = getRoomUnreadCount(room);
                const isActive = room.id === roomId;
                
                return (
                  <ListItem 
                    key={room.id}
                    button 
                    onClick={() => handleRoomClick(room.id)}
                    sx={{
                      backgroundColor: isActive 
                        ? 'rgba(25, 118, 210, 0.08)' 
                        : (unreadCount > 0 ? 'rgba(0, 150, 255, 0.04)' : 'inherit'),
                      '&:hover': {
                        backgroundColor: isActive 
                          ? 'rgba(25, 118, 210, 0.12)' 
                          : (unreadCount > 0 ? 'rgba(0, 150, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'),
                      },
                      borderLeft: isActive ? '3px solid' : 'none',
                      borderColor: '#1976d2',
                      borderBottom: '1px solid',
                      borderBottomColor: 'rgba(0, 0, 0, 0.08)',
                      pl: isActive ? 1.5 : 2,
                      py: 1.5
                    }}
                  >
                    <ListItemAvatar>
                      <Badge 
                        color="error" 
                        badgeContent={unreadCount} 
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        invisible={isActive || unreadCount === 0}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: isActive ? '#1976d2' : '#e0e0e0',
                            width: 44,
                            height: 44
                          }}
                        >
                          {otherUserName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{
                              fontWeight: (unreadCount > 0 && !isActive) ? 'bold' : 'normal',
                              color: isActive ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {otherUserName}
                          </Typography>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              color: (unreadCount > 0 && !isActive) ? 'text.primary' : 'text.secondary',
                              fontWeight: (unreadCount > 0 && !isActive) ? 'bold' : 'normal',
                              fontSize: '0.8rem'
                            }}
                          >
                            {room.lastMessage ? 
                              (room.lastMessage.length > 20 ? `${room.lastMessage.substring(0, 20)}...` : room.lastMessage) 
                              : "沒有訊息"}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.7rem',
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          {formatTime(room.lastMessageTime)}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>

        {/* 右側聊天內容 */}
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Paper
            ref={messagesContainerRef}
            onScroll={handleScroll}
            elevation={0}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              p: 3,
              bgcolor: '#f5f7fb',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '3px'
              }
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%' 
              }}>
                <CircularProgress size={40} />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  沒有消息，開始聊天吧！
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto' }}>
                {memoizedMessages}
              </Box>
            )}
          </Paper>

          {/* 輸入框區域 */}
          <Paper
            component="form"
            onSubmit={handleSendMessage}
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'white',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ 
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1
            }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="輸入訊息..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f5f7fb',
                    '&:hover': {
                      bgcolor: '#f0f2f5'
                    }
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                variant="contained"
                sx={{
                  minWidth: 'unset',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  p: 0
                }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatRoom; 